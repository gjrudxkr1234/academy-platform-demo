/* Presentation for a fixed-role offline demo; production authorization lives on the server. */
(() => {
  "use strict";
  const roles = {
    owner: {
      name: "원장", title: "오늘의 학원 운영", context: "학원 전체 · 11월 16일 월요일",
      tabs: [["home", "홈", "home", ["home-overview"]], ["students", "학생·반", "people", ["roster"]],
        ["attendance", "출결", "qr", ["schedule", "school-schedule", "academy-calendar"]], ["operations", "운영", "operations", ["settings", "website", "learning", "notifications", "tuition", "staff-pay", "staff-leave", "timetable", "grades"]]],
    },
    teacher: {
      name: "선생님", title: "오늘의 수업 관리", context: "이도현 선생님 · 중2 심화반",
      tabs: [["home", "홈", "home", ["home-overview", "my-work"]], ["attendance", "출결", "qr", ["schedule", "academy-calendar"]], ["learning", "과제 검사", "book", ["video"]],
        ["students", "학생", "people", ["grades", "school-schedule", "notifications", "website"]]],
    },
    student: {
      name: "학생", title: "오늘 할 일", context: "김지우 학생 · 중2 심화반",
      tabs: [["home", "홈", "home", ["home-overview", "notifications"]], ["learning", "과제", "book", ["video"]],
        ["attendance", "출결", "qr", ["schedule", "academy-calendar"]], ["grades", "성적", "chart", ["school-schedule"]]],
    },
    parent: {
      name: "학부모", title: "우리 아이의 하루", context: "연결된 자녀의 학습과 출결",
      tabs: [["home", "홈", "home", ["home-overview"]], ["attendance", "출결", "qr", []], ["learning", "과제/성적", "chart", ["grades"]],
        ["news", "소식", "bell", ["notifications", "schedule", "school-schedule", "academy-calendar", "tuition"]]],
    },
  };
  const paths = {
    operations: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>',
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
    phone: '<path d="m6 3 3 5-2 2a15 15 0 0 0 7 7l2-2 5 3v2c0 1-1 2-2 2A18 18 0 0 1 2 5c0-1 1-2 2-2z"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const enabled = (role) => Object.hasOwn(roles, window.ACADEMY_APP_ROLE ?? "") && role === window.ACADEMY_APP_ROLE;

  function rowList(rows) {
    return `<ul class="demo-home-list" aria-label="오늘 확인할 내용">${rows.map(({ label, value, detail, symbol, screen, assignment, watchVideo, reviewStudent, attention }) => {
      const inner = `<span class="demo-home-icon">${icon(symbol)}</span><span class="demo-home-copy"><small>${escape(label)}</small><strong>${escape(value)}</strong><span>${escape(detail)}</span></span>`;
      const action = assignment ? `data-action="submit-homework" data-id="${escape(assignment)}"`
        : watchVideo ? `data-action="watch-video" data-id="${escape(watchVideo)}"`
        : reviewStudent ? `data-action="review" data-id="${escape(reviewStudent)}"`
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

  const week = ["월", "화", "수", "목", "금", "토", "일"];
  const fixtureDate = "11월 16일 월요일";
  const sectionEnabled = (profile, id) => !profile.sections || profile.sections.includes(id);

  function polishedSection(id, eyebrow, title, html, action = "") {
    return `<section class="demo-home-section demo-polished-section" aria-labelledby="demo-${id}-title">
      <header class="demo-home-section-heading"><div><span lang="en" class="demo-section-label">${eyebrow}</span><h2 id="demo-${id}-title">${title}</h2></div>${action}</header>${html}</section>`;
  }

  function greetingCover(url) {
    return url ? `<img class="demo-greeting-cover" src="${escape(url)}" alt="">` : "";
  }

  function todayItems(rows) {
    return `<ul class="demo-home-list demo-polished-list" aria-label="오늘 확인할 내용">${rows.map(({ label, value, detail, screen, assignment, attention, countdown }) => {
      const action = assignment ? `data-action="submit-homework" data-id="${escape(assignment)}"` : `data-action="navigate" data-id="${escape(screen)}"`;
      const dueBadge = countdown ? `<b class="demo-due-badge${attention ? " is-urgent" : ""}">${escape(countdown)}</b>` : "";
      return `<li class="demo-home-item"><button class="demo-home-row" type="button" ${action} data-action-level="tertiary">
        <span class="demo-polished-dot${attention ? " is-urgent" : ""}" aria-hidden="true"></span><span class="demo-home-copy">
          <small>${escape([label, detail].filter(Boolean).join(" · "))}</small><strong>${escape(value)}${dueBadge}</strong></span><span class="demo-home-chevron" aria-hidden="true">›</span></button></li>`;
    }).join("")}</ul>`;
  }

  function portraitMarkup(card, cssClass, labelled = false) {
    const image = card.photoUrl || card.illustrationUrl;
    return image ? `<img class="${cssClass}" src="${escape(image)}" alt="${labelled ? `${escape(card.name)} 강사 사진` : ""}">`
      : `<span class="${cssClass} demo-portrait-initial" aria-hidden="true">${escape(Array.from(card.name)[0] || "·")}</span>`;
  }

  function teacherStrip(staff) {
    return `<ul class="demo-site-staff demo-portrait-rail">${staff.map((card) => `<li><button type="button" data-action="site-staff-detail"
      data-id="${escape(card.id)}" class="demo-portrait-card" aria-label="${escape(card.name)} 강사 상세">${portraitMarkup(card, "demo-portrait-media", Boolean(card.photoUrl))}
      <span class="demo-portrait-name">${escape(card.name)} <small>${escape(card.title)}</small></span>
      ${card.subject || card.grade ? `<span class="demo-portrait-subject">${escape([card.subject, card.grade].filter(Boolean).join(" · "))}</span>` : ""}</button></li>`).join("")}</ul>`;
  }

  function orderLessons(lessons, group) {
    const mine = (lesson) => Boolean(group && (lesson.groupKey ?? lesson.group) === group);
    return [...lessons].sort((a, b) => Number(mine(b)) - Number(mine(a)) || a.time.localeCompare(b.time));
  }

  function lessonWeek(timetable, selectedGroup, selectedDay) {
    const active = selectedDay || (timetable.some(({ day }) => day === "월") ? "월" : week.find((day) => timetable.some((lesson) => lesson.day === day)));
    const shownDays = timetable.some(({ day }) => day === "일") ? week : week.slice(0, 6);
    const slots = orderLessons(timetable.filter(({ day }) => day === active), selectedGroup);
    return `<div class="demo-polished-days" aria-label="시간표 요일">${shownDays.map((day, index) => `<button type="button" data-action="homepage-day" data-id="${day}" aria-pressed="${day === active}" aria-label="${day}요일 ${16 + index}일">
      <span>${day}</span><strong>${16 + index}</strong><i${timetable.some((entry) => entry.day === day) ? ' class="has-lesson"' : ""}></i></button>`).join("")}</div>
      <ul class="demo-site-schedule demo-polished-lessons">${slots.map((entry) => {
        const [start, end] = entry.time.split("–");
        const own = selectedGroup && (entry.groupKey ?? entry.group) === selectedGroup;
        return `<li${own ? ' class="is-own" data-own-class' : ""}><span class="demo-lesson-time"><strong>${escape(start)}</strong><small>${escape(end ?? "")}</small></span>
          <span><strong>${escape(entry.group)}${own ? ' <small class="demo-own-badge">내 반</small>' : ""}</strong>
            ${entry.teacher || entry.room ? `<span>${escape([entry.teacher && `${entry.teacher} 선생님`, entry.room].filter(Boolean).join(" · "))}</span>` : ""}</span></li>`;
      }).join("") || '<li class="demo-lesson-empty">이날은 예정된 수업이 없어요.</li>'}</ul>`;
  }

  function summaryStrip(role, profile, timetable, selectedGroup, attendance) {
    const next = timetable.filter((entry) => (entry.groupKey ?? entry.group) === selectedGroup)
      .sort((a, b) => week.indexOf(a.day) - week.indexOf(b.day) || a.time.localeCompare(b.time))[0];
    const mondayHours = profile.weeklyHours?.["월"];
    const hours = mondayHours ? `${mondayHours.start}–${mondayHours.end}` : "휴무";
    const items = [
      role === "parent" ? `<button type="button" data-action="navigate" data-id="attendance"><small>오늘 등·하원</small><strong>${escape(attendance)}</strong></button>`
        : next && sectionEnabled(profile, "timetable") ? `<button type="button" data-action="homepage-day" data-id="${escape(next.day)}" data-scroll-target="demo-timetable-title"><small>다음 수업</small><strong>${escape(next.day)} ${escape(next.time.split("–")[0])}</strong></button>` : "",
      sectionEnabled(profile, "hours") && profile.weeklyHours ? `<div><small>오늘 운영</small><strong>${escape(hours)}</strong></div>` : "",
      sectionEnabled(profile, "contact") && profile.phone ? `<button type="button" data-action="demo-contact" data-id="phone"><small>문의</small><strong>${icon("phone")} 전화</strong></button>` : "",
    ].filter(Boolean);
    return items.length ? `<div class="demo-summary-strip">${items.join("")}</div>` : "";
  }

  function operatingHours(profile) {
    if (!profile.weeklyHours) return profile.hours ? `<p>${escape(profile.hours)}</p>` : "";
    if (!Object.values(profile.weeklyHours).some(Boolean)) return "";
    const entries = [];
    for (const day of week) {
      const slot = profile.weeklyHours[day];
      const hours = slot ? `${slot.start}–${slot.end}` : "";
      const last = entries.at(-1);
      if (last?.hours === hours) last.days.push(day);
      else entries.push({ days: [day], hours });
    }
    return `<dl class="demo-polished-hours">${entries.map(({ days, hours }) => {
      const today = days.includes("월");
      return `<div${today ? ' class="is-today"' : ""}><dt>${days[0]}${days.length > 1 ? `–${days.at(-1)}` : ""}${today ? ' <span class="demo-today-badge">오늘</span>' : ""}</dt>
        <dd${hours ? "" : ' class="is-closed"'}>${escape(hours || "휴무")}</dd></div>`;
    }).join("")}</dl>`;
  }

  function learnerHome(role, { name, actions, rows, controls, notices, profile, timetable = [], staffProfiles = [], selectedGroup, homepageDay, brandName = "gradient" }) {
    const parent = role === "parent";
    const showIntro = sectionEnabled(profile, "intro");
    const cover = showIntro && profile.cover;
    const contact = sectionEnabled(profile, "contact");
    const hours = sectionEnabled(profile, "hours") ? operatingHours(profile) : "";
    const address = contact && profile.address;
    const phone = contact && profile.phone;
    const kakao = contact && profile.kakao;
    const contactButtons = `<div class="demo-polished-visit-actions">${phone ? homeButton({ label: "전화하기", action: "demo-contact", id: "phone", symbol: "phone" }, "secondary", "demo-visit-button demo-visit-call") : ""}${address ? homeButton({ label: "길찾기", action: "demo-contact", id: "address", symbol: "pin" }, "secondary", "demo-visit-button") : ""}</div>`;
    const noticesHtml = `<ul class="demo-polished-list demo-polished-notices">${notices.slice(0, 2).map(({ date, id, title, detail }) => `<li class="demo-home-notice"><button type="button" data-action="home-notice" data-id="${escape(id)}"><time>${escape(date.replace(/(\d+)월 (\d+)일/, (_, month, day) => `${month}.${day.padStart(2, "0")}`))}</time><span class="demo-home-copy"><strong>${escape(title)}</strong><span>${escape(detail)}</span></span></button></li>`).join("")}</ul>`;
    return `<section class="demo-role-home demo-polished-home" data-role-home="${role}">
      <header class="demo-greeting demo-greeting-learner">${greetingCover(cover)}
        <p class="demo-greeting-meta">${escape(name)}, 반가워요 · ${fixtureDate}</p><h1>${escape(profile.name)}</h1>
        <p class="demo-greeting-intro">${escape(showIntro ? profile.intro : "수업 시간표와 학원 소식을 한곳에서 확인하세요.")}</p>
        ${showIntro && profile.tags?.length ? `<ul class="demo-greeting-tags">${profile.tags.map((tag) => `<li>${escape(tag)}</li>`).join("")}</ul>` : ""}
        <div class="demo-greeting-actions">${actions.map((action, index) => homeButton(action, index === 0 ? "primary" : "secondary", "demo-greeting-button")).join("")}</div>
      </header>
      ${summaryStrip(role, profile, timetable, selectedGroup, rows[0]?.value ?? "")}
      ${polishedSection("today", "TODAY", "오늘", controls + todayItems(rows), sectionLink("전체 보기", "home-overview"))}
      ${sectionEnabled(profile, "staff") && staffProfiles.length ? polishedSection("staff", "TEACHERS", "강사진", teacherStrip(staffProfiles), homeButton({ label: "전체", action: "site-staff-all", chevron: true }, "tertiary", "demo-home-link")) : ""}
      ${sectionEnabled(profile, "timetable") && timetable.length ? polishedSection("timetable", "TIMETABLE", "수업 시간표", lessonWeek(timetable, selectedGroup, homepageDay), sectionLink("전체 시간표", "schedule")) : ""}
      ${sectionEnabled(profile, "notices") && notices.length ? polishedSection("notice", "NOTICE", "공지", noticesHtml, sectionLink("더 보기", parent ? "news" : "learning")) : ""}
      ${hours || address || phone || kakao ? polishedSection("guide", "VISIT", "학원 안내", `<div class="demo-polished-visit">${hours}
        ${address ? `<p class="demo-visit-address">${icon("pin")} ${escape(address)}</p>` : ""}${contactButtons}
        ${kakao ? homeButton({ label: "카카오 채널 보기", action: "demo-contact", id: "kakao", chevron: true }, "tertiary", "demo-home-link") : ""}</div>`) : ""}
      ${parent ? homeButton({ label: "상담 신청", action: "demo-consultation", symbol: "calendar" }, "secondary", "demo-contact-cta") : ""}
      <div class="demo-polished-footer"><strong>${escape(profile.name)}</strong><small>powered by ∇ ${escape(brandName)}</small></div>
    </section>`;
  }

  function home(role, options) {
    if (role === "student" || role === "parent") return learnerHome(role, options);
    const { context, name, summary, actions, rows, controls, notices, lessons, profile, staff, ownStaff } = options;
    const websiteEdit = { label: profile.ready ? "편집하기" : "홈페이지 만들기", action: "homepage-edit", symbol: "edit" };
    return `<section class="demo-role-home" data-role-home="${role}">
      <header class="demo-greeting">${greetingCover(sectionEnabled(profile, "intro") && profile.cover)}
          <p class="demo-greeting-meta">${escape(context)} · ${fixtureDate}</p>
          <h1>${escape(name)},<br>오늘도 반가워요</h1>
          <p class="demo-greeting-summary">${escape(summary)}</p>
        <div class="demo-greeting-actions">${actions.map((action, index) =>
          homeButton(action, index === 0 ? "primary" : "secondary", "demo-greeting-button")).join("")}</div>
      </header>
      ${role === "teacher" && ownStaff ? `<button type="button" class="demo-own-portrait" data-action="site-own-card" data-id="${escape(ownStaff.id)}">${portraitMarkup(ownStaff, "demo-site-photo")}
        <span><small>내 강사 카드</small><strong>${escape(ownStaff.name)}</strong></span><span>수정 ›</span></button>` : ""}
      <section class="demo-home-section" aria-labelledby="demo-today-title">
        <header class="demo-home-section-heading">
          <h2 id="demo-today-title">${role === "owner" ? "오늘 운영" : "오늘"}</h2>
          ${sectionLink("전체 보기", "home-overview")}
        </header>
        ${controls}
        ${role === "owner" ? metricGrid(rows) : rowList(rows)}
      </section>
      ${noticeSection(role, notices)}
      ${role === "teacher" ? `<section class="demo-home-section" aria-labelledby="demo-week-title">
        <header class="demo-home-section-heading"><h2 id="demo-week-title">이번 주 수업</h2>
          ${homeButton({ label: "수업 일정", id: "schedule" }, "tertiary", "demo-home-link")}</header>
        <ul class="demo-home-lessons">${lessons.map(({ day, time, group, teacher }) => `<li><strong>${escape(day)}</strong><span>${escape(time)}</span><span>${escape(group)} · ${escape(teacher)} 선생님</span></li>`).join("") || "<li>예정된 수업이 없어요.</li>"}</ul>
      </section>` : ""}
      <section class="demo-home-section" aria-labelledby="demo-website-title">
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
      </section>
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
    const scoped = document.body.hasAttribute("data-c-block-scope");
    const candidate = selector ? (screen === "roster" ? container.querySelector('[data-action="apply-roster"]:not(:disabled)') : null) ?? container.querySelector(selector)
      : scoped && !container.querySelector("[data-action-level='primary']") ? container.querySelector(".primary") : null;
    for (const control of container.querySelectorAll(".primary")) {
      if (control === candidate) continue;
      control.classList.replace("primary", "secondary");
      control.dataset.actionLevel = "secondary";
    }
    if (candidate && !scoped) {
      candidate.classList.remove("secondary", "text-button");
      candidate.classList.add("primary");
      candidate.dataset.actionLevel = "primary";
      const dock = document.createElement("div");
      dock.className = "demo-action-dock";
      dock.append(candidate);
      container.append(dock);
    } else if (candidate?.classList.contains("primary")) {
      candidate.dataset.actionLevel = "primary";
    }
    container.insertAdjacentHTML("beforeend", tabs(role, screen));
  }
  window.AcademyRoleUi = Object.freeze({ enabled, home, overview, tabs, apply, primarySelector, scheduleList, staffList, contactList });
})();
