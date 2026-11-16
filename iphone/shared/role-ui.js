/* Presentation for a fixed-role offline demo; production authorization lives on the server. */
(() => {
  "use strict";
  const roles = {
    owner: {
      name: "원장", title: "오늘의 학원 운영", context: "학원 전체 · 11월 16일 월요일",
      tabs: [["home", "홈", "home", ["home-overview"]], ["students", "학생/반", "people", ["roster", "grades"]],
        ["attendance", "출결/일정", "qr", ["schedule", "school-schedule"]], ["settings", "운영", "settings", ["website", "learning", "notifications"]]],
    },
    teacher: {
      name: "선생님", title: "오늘의 수업 관리", context: "이도현 선생님 · 중2 심화반",
      tabs: [["home", "홈", "home", ["home-overview"]], ["attendance", "출결", "qr", ["schedule"]], ["learning", "과제 검사", "book", ["video"]],
        ["students", "학생", "people", ["grades", "school-schedule", "notifications", "website"]]],
    },
    student: {
      name: "학생", title: "오늘 할 일", context: "김지우 학생 · 중2 심화반",
      tabs: [["home", "홈", "home", ["home-overview", "notifications"]], ["learning", "과제", "book", ["video"]],
        ["attendance", "출결", "qr", ["schedule"]], ["grades", "성적", "chart", ["school-schedule"]]],
    },
    parent: {
      name: "학부모", title: "우리 아이의 하루", context: "연결된 자녀의 학습과 출결",
      tabs: [["home", "홈", "home", ["home-overview"]], ["attendance", "출결", "qr", []], ["learning", "과제/성적", "chart", ["grades"]],
        ["news", "소식", "bell", ["notifications", "schedule", "school-schedule"]]],
    },
  };
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6"/>',
    qr: '<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chart: '<path d="M4 3v18h17M8 17v-5M13 17V8M18 17V5"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
    bell: '<path d="M4 17h16l-2-4V9A6 6 0 0 0 6 9v4zM10 21h4"/>',
    notice: '<path d="M3 10v4h4l7 4V6l-7 4zm14-1a5 5 0 0 1 0 6"/>',
    edit: '<path d="m4 16 12-12 4 4L8 20H4zM14 6l4 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const enabled = (role) => Object.hasOwn(roles, window.ACADEMY_APP_ROLE ?? "") && role === window.ACADEMY_APP_ROLE;

  function rowList(rows) {
    return `<ul class="demo-home-list" aria-label="오늘 확인할 내용">${rows.map(({ label, value, detail, symbol, screen, assignment, attention }) => {
      const inner = `<span class="demo-home-icon">${icon(symbol)}</span><span class="demo-home-copy"><small>${escape(label)}</small><strong>${escape(value)}</strong><span>${escape(detail)}</span></span>`;
      const action = assignment ? `data-action="submit-homework" data-id="${escape(assignment)}"`
        : screen ? `data-action="navigate" data-id="${escape(screen)}"` : "";
      return `<li class="demo-home-item${attention ? " demo-home-attention" : ""}">${action
        ? `<button type="button" class="demo-home-row" data-action-level="tertiary" ${action}>${inner}<span class="demo-home-chevron" aria-hidden="true">›</span></button>`
        : `<div class="demo-home-row">${inner}</div>`}</li>`;
    }).join("")}</ul>`;
  }

  function overview(role, rows, controls) {
    const data = roles[role];
    return `<section class="demo-role-home demo-home-overview" data-role-overview="${role}">
      <header class="demo-role-heading"><h1>${data.title}</h1><p>${data.context}</p></header>
      ${controls}${rowList(rows)}
    </section>`;
  }

  function homeButton({ label, action = "navigate", id = "", symbol, chevron = false }, level = "tertiary", classname = "") {
    return `<button type="button" class="${classname}" data-action="${escape(action)}"${id ? ` data-id="${escape(id)}"` : ""} data-action-level="${level}">${symbol ? icon(symbol) : ""}${escape(label)}${chevron ? '<span class="demo-link-chevron" aria-hidden="true">›</span>' : ""}</button>`;
  }

  function metricGrid(rows) {
    return `<ul class="demo-home-metrics" aria-label="오늘 학원 운영">${rows.map(({ label, value, detail, screen, attention }) => `
      <li><button type="button" class="demo-home-metric${attention ? " demo-home-attention" : ""}" data-action="navigate" data-id="${escape(screen)}" data-action-level="tertiary">
        <small>${escape(label)}</small><strong>${escape(value)}</strong><span>${escape(detail)}</span>
      </button></li>`).join("")}</ul>`;
  }

  function sectionLink(label, id) {
    return homeButton({ label, id, chevron: true }, "tertiary", "demo-home-link");
  }

  function scheduleList(lessons, selectedGroup) {
    const own = lessons.filter((lesson) => (lesson.groupKey ?? lesson.group) === selectedGroup);
    const others = lessons.filter((lesson) => (lesson.groupKey ?? lesson.group) !== selectedGroup);
    return `<ul class="demo-home-lessons demo-site-schedule">${[...own, ...others].map(({ day, time, group, teacher }, index) => `
      <li${index < own.length ? ' class="is-own" data-own-class' : ""}><strong>${escape(group)}${index < own.length ? ' <small>내 반</small>' : ""}</strong>
        <span>${escape(day)}요일 ${escape(time)}${teacher ? ` · ${escape(teacher)} 선생님` : ""}</span></li>`).join("") || "<li>등록된 수업 시간표가 없어요.</li>"}</ul>`;
  }

  function staffList(staff) {
    return `<ul class="demo-site-staff">${staff.map(({ name, title, subject, grade, detail, credentials, photoUrl }) => `
      <li>${photoUrl ? `<img class="demo-site-photo" src="${escape(photoUrl)}" alt="${escape(name)} 강사 사진" width="44" height="44">`
        : `<span class="demo-site-initial" aria-hidden="true">${escape(Array.from(name)[0] || "·")}</span>`}
        <div><strong>${escape(name)}${title ? ` <small>${escape(title)}</small>` : ""}</strong>
          ${subject || grade ? `<span>${escape([subject, grade].filter(Boolean).join(" · "))}</span>` : ""}
          ${detail ? `<p>${escape(detail)}</p>` : ""}
          ${credentials?.length ? `<ul class="demo-staff-credentials">${credentials.map((entry) => `<li>${escape(entry)}</li>`).join("")}</ul>` : ""}</div></li>`).join("") || "<li>강사진 안내를 준비하고 있어요.</li>"}</ul>`;
  }

  function contactList(profile) {
    const rows = [["운영시간", "hours"], ["주소", "address"], ["전화", "phone"], ["카카오 채널", "kakao"]].filter(([, key]) => profile[key]);
    if (!rows.length) return '<p class="demo-site-muted">학원 안내를 준비하고 있어요.</p>';
    return `<dl class="demo-site-contact">${rows.map(([label, key]) => `<div><dt>${label}</dt><dd>${key === "hours" ? escape(profile[key])
      : homeButton({ label: key === "kakao" ? "카카오 채널 보기" : profile[key], action: "demo-contact", id: key, chevron: true }, "tertiary", "demo-home-link")}</dd></div>`).join("")}</dl>`;
  }

  function noticeSection(role, notices) {
    return `<section class="demo-home-section" aria-labelledby="demo-notice-title">
      <header class="demo-home-section-heading"><h2 id="demo-notice-title">공지</h2>
        ${sectionLink("더 보기", role === "parent" ? "news" : role === "student" ? "learning" : "website")}</header>
      <ul class="demo-home-list">${notices.slice(0, 2).map(({ title, detail, date, id }) => `
        <li class="demo-home-notice"><button type="button" data-action="home-notice" data-id="${escape(id)}" data-action-level="tertiary"><span class="demo-home-icon">${icon("notice")}</span>
          <span class="demo-home-copy"><strong>${escape(title)}</strong><span>${escape(detail)} · ${escape(date)}</span></span></button></li>`).join("")}</ul>
    </section>`;
  }

  function homepageSections(role, profile, timetable, staff, notices, selectedGroup) {
    const section = (id, title, html) => `<section class="demo-home-section" aria-labelledby="demo-${id}-title">
      <header class="demo-home-section-heading"><h2 id="demo-${id}-title">${title}</h2></header>${html}</section>`;
    const order = profile.sections ?? ["notices", "timetable", "staff", "contact"];
    const content = {
      intro: () => profile.cover || profile.longIntro || profile.tags?.length
        ? section("intro", "학원 소개", `${profile.cover ? `<img class="demo-site-cover" src="${escape(profile.cover)}" alt="학원 대표 사진">` : ""}
          ${profile.longIntro ? `<p class="demo-site-paragraph">${escape(profile.longIntro)}</p>` : ""}
          ${profile.tags?.length ? `<p class="demo-site-tags">${profile.tags.map((tag) => `<span>${escape(tag)}</span>`).join("")}</p>` : ""}`) : "",
      staff: () => section("staff", "강사진", staffList(staff)),
      timetable: () => section("timetable", "수업 시간표", scheduleList(timetable, selectedGroup)),
      notices: () => noticeSection(role, notices),
      hours: () => profile.hours ? section("hours", "운영시간", `<p class="demo-site-paragraph">${escape(profile.hours)}</p>`) : "",
      contact: () => section("guide", "학원 안내", contactList(profile.sections ? { ...profile, hours: "" } : profile)),
    };
    return order.map((id) => content[id]?.() ?? "").join("");
  }

  function home(role, { context, name, summary, actions, rows, controls, notices, lessons, profile, staff, timetable = [], staffProfiles = [], selectedGroup }) {
    const websiteEdit = { label: profile.ready ? "편집하기" : "홈페이지 만들기", action: "homepage-edit", symbol: "edit" };
    const parent = role === "parent";
    const learner = parent || role === "student";
    return `<section class="demo-role-home" data-role-home="${role}">
      <header class="demo-greeting${learner ? " demo-greeting-learner" : ""}">
        ${learner ? `<h1>${escape(profile.name)}</h1><p class="demo-greeting-intro">${escape(profile.sections && !profile.sections.includes("intro") ? "수업 시간표와 학원 소식을 한곳에서 확인하세요." : profile.intro)}</p>
          <p class="demo-greeting-meta">${escape(name)}, 반가워요</p>`
          : `<p class="demo-greeting-meta">${escape(context)} · 11월 16일 월요일</p>
          <h1>${escape(name)},<br>오늘도 반가워요</h1>
          <p class="demo-greeting-summary">${escape(summary)}</p>`}
        <div class="demo-greeting-actions">${actions.map((action, index) =>
          homeButton(action, index === 0 ? "primary" : "secondary", "demo-greeting-button")).join("")}</div>
      </header>
      <section class="demo-home-section" aria-labelledby="demo-today-title">
        <header class="demo-home-section-heading">
          <h2 id="demo-today-title">${role === "owner" ? "오늘 운영" : "오늘"}</h2>
          ${sectionLink("전체 보기", "home-overview")}
        </header>
        ${controls}
        ${role === "owner" ? metricGrid(rows) : rowList(rows)}
      </section>
      ${learner ? homepageSections(role, profile, timetable, staffProfiles, notices, selectedGroup) : noticeSection(role, notices)}
      ${parent ? homeButton({ label: "상담 신청", action: "demo-consultation", symbol: "calendar" }, "secondary", "demo-contact-cta") : ""}
      ${role === "teacher" ? `<section class="demo-home-section" aria-labelledby="demo-week-title">
        <header class="demo-home-section-heading"><h2 id="demo-week-title">이번 주 수업</h2>
          ${homeButton({ label: "수업 일정", id: "schedule" }, "tertiary", "demo-home-link")}</header>
        <ul class="demo-home-lessons">${lessons.map(({ day, time, group, teacher }) => `<li><strong>${escape(day)}</strong><span>${escape(time)}</span><span>${escape(group)} · ${escape(teacher)} 선생님</span></li>`).join("") || "<li>예정된 수업이 없어요.</li>"}</ul>
      </section>` : ""}
      ${!learner ? `<section class="demo-home-section" aria-labelledby="demo-website-title">
        <header class="demo-home-section-heading"><h2 id="demo-website-title">학원 홈페이지</h2>
          ${role === "owner" && profile.ready ? homeButton({ label: "미리보기", id: "website" }, "tertiary", "demo-home-link") : ""}
        </header>
        <div class="demo-home-website">
          ${role === "owner" && profile.ready ? `<div class="demo-site-thumbnail" aria-hidden="true"><div></div><strong>${escape(profile.name)}</strong><i></i><i></i></div>` : ""}
          <div><strong>${escape(role === "owner" && profile.ready ? "학생·학부모 첫 화면" : profile.name)}</strong>
            <p>${escape(role === "owner" && profile.ready ? "소개 · 강사진 · 시간표 · 공지" : profile.intro)}</p>
            ${role === "owner" ? homeButton(websiteEdit, "tertiary", "demo-home-link")
              + (!profile.phone ? homeButton({ label: "연락처 등록", action: "homepage-edit", id: "contact", chevron: true }, "tertiary", "demo-home-link") : "")
              : `<p>강사진 ${escape(staff)}</p>${profile.phone ? `<p>${escape(profile.phone)}</p>` : ""}
                ${homeButton({ ...websiteEdit, label: "홈페이지 편집" }, "tertiary", "demo-home-link")}`}
          </div>
        </div>
      </section>` : ""}
    </section>`;
  }

  function tabs(role, screen) {
    const data = roles[role];
    return `<nav class="demo-role-tabs" aria-label="${data.name} 하단 탭"><div>${data.tabs.map(([path, label, symbol, children]) => {
      const current = path === screen || children.includes(screen);
      return `<button type="button" data-action="navigate" data-id="${path}" data-action-level="tertiary"${current ? ' aria-current="page"' : ""}>${icon(symbol)}<span>${label}</span></button>`;
    }).join("")}</div></nav>`;
  }

  function primarySelector(role, screen) {
    if (screen === "website" && role !== "owner") return '[data-action="navigate"][data-id="home"]';
    if (screen === "attendance") return role === "student" ? '[data-action="camera-qr"]' : role === "owner" || role === "teacher" ? '[data-action="teacher-qr"]' : null;
    if (screen === "learning") return role === "owner" || role === "teacher" ? '[data-action="review"]' : null;
    if (screen === "video" && role === "student") return '[data-action="watch-video"]';
    if (screen === "roster" && role === "owner") return '[data-action="apply-roster"]:not(:disabled), [data-action="preview-roster"]';
    if (screen === "school-schedule") return role === "student" ? '[data-action="school-demo-report"]' : role === "parent" ? null : '[data-action="school-demo-approve"]';
    if (screen === "students") return '[data-action="consultation-note"]';
    return null;
  }

  function apply(container, role, screen) {
    if (!enabled(role)) return;
    document.body.classList.add("role-app-ui");
    document.body.dataset.appRole = role;
    const selector = primarySelector(role, screen);
    const candidate = selector ? (screen === "roster" ? container.querySelector('[data-action="apply-roster"]:not(:disabled)') : null) ?? container.querySelector(selector) : null;
    for (const control of container.querySelectorAll(".primary")) {
      if (control === candidate) continue;
      control.classList.replace("primary", "secondary");
      control.dataset.actionLevel = "secondary";
    }
    if (candidate) {
      candidate.classList.remove("secondary", "text-button");
      candidate.classList.add("primary");
      candidate.dataset.actionLevel = "primary";
      const dock = document.createElement("div");
      dock.className = "demo-action-dock";
      dock.append(candidate);
      container.append(dock);
    }
    container.insertAdjacentHTML("beforeend", tabs(role, screen));
  }
  window.AcademyRoleUi = Object.freeze({ enabled, home, overview, tabs, apply, primarySelector, scheduleList, staffList, contactList });
})();
