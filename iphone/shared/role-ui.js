/* Presentation for a fixed-role offline demo; production authorization lives on the server. */
(() => {
  "use strict";
  const roles = {
    owner: {
      name: "원장", title: "오늘의 학원 운영", context: "학원 전체 · 11월 16일 월요일",
      tabs: [["home", "홈", "home", []], ["students", "학생/반", "people", ["roster", "grades"]],
        ["attendance", "출결/일정", "qr", ["schedule", "school-schedule"]], ["settings", "운영", "settings", ["website", "learning", "notifications"]]],
    },
    teacher: {
      name: "선생님", title: "오늘의 수업 관리", context: "이도현 선생님 · 중2 심화반",
      tabs: [["home", "홈", "home", []], ["attendance", "출결", "qr", ["schedule"]], ["learning", "과제 검사", "book", ["video"]],
        ["students", "학생", "people", ["grades", "school-schedule", "notifications", "website"]]],
    },
    student: {
      name: "학생", title: "오늘 할 일", context: "김지우 학생 · 중2 심화반",
      tabs: [["home", "홈", "home", ["website", "notifications"]], ["learning", "과제", "book", ["video"]],
        ["attendance", "출결", "qr", ["schedule"]], ["grades", "성적", "chart", ["school-schedule"]]],
    },
    parent: {
      name: "학부모", title: "우리 아이의 하루", context: "연결된 자녀의 학습과 출결",
      tabs: [["home", "홈", "home", []], ["attendance", "출결", "qr", []], ["learning", "과제/성적", "chart", ["grades"]],
        ["news", "소식", "bell", ["notifications", "schedule", "school-schedule", "website"]]],
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
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const enabled = (role) => Object.hasOwn(roles, window.ACADEMY_APP_ROLE ?? "") && role === window.ACADEMY_APP_ROLE;

  function home(role, academyName, rows, controls = "") {
    const data = roles[role];
    return `<section class="demo-role-home" data-role-home="${role}">
      <header class="demo-role-heading"><p class="demo-role-eyebrow">${escape(academyName)} · ${data.name}</p><h1>${data.title}</h1><p>${data.context}</p></header>
      ${controls}
      <ul class="demo-home-list" aria-label="오늘 확인할 내용">${rows.map(({ label, value, detail, symbol, screen, assignment, attention }) => {
        const inner = `<span class="demo-home-icon">${icon(symbol)}</span><span class="demo-home-copy"><small>${escape(label)}</small><strong>${escape(value)}</strong><span>${escape(detail)}</span></span>`;
        const action = assignment ? `data-action="submit-homework" data-id="${escape(assignment)}"`
          : screen ? `data-action="navigate" data-id="${escape(screen)}"` : null;
        return `<li class="demo-home-item${attention ? " demo-home-attention" : ""}">${action
          ? `<button type="button" class="demo-home-row" data-action-level="tertiary" ${action}>${inner}<span class="demo-home-chevron" aria-hidden="true">›</span></button>`
          : `<div class="demo-home-row">${inner}</div>`}</li>`;
      }).join("")}</ul>
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
    if (screen === "website") return '[data-action="navigate"][data-id="home"]';
    if (screen === "attendance") return role === "student" ? '[data-action="camera-qr"]' : role === "owner" || role === "teacher" ? '[data-action="teacher-qr"]' : null;
    if (screen === "learning") return role === "owner" || role === "teacher" ? '[data-action="review"]' : null;
    if (screen === "video" && role === "student") return '[data-action="watch-video"]';
    if (screen === "settings" && role === "owner") return '[data-action="edit-settings"]';
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
  window.AcademyRoleUi = Object.freeze({ enabled, home, tabs, apply, primarySelector });
})();
