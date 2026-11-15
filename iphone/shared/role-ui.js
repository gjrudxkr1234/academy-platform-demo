/* Role-app presentation only. Data and mutations stay in the existing offline
   demo; production authorization is always enforced by the server/database. */
(() => {
  "use strict";
  const roles = {
    owner: { name: "원장", title: "학원 운영, 한눈에", detail: "등록부터 수업 관리까지 필요한 일부터 시작하세요.", cards: [["attendance", "입구 출결 QR", "태블릿에 QR을 크게 띄워요", "qr"], ["learning", "숙제·공지", "제출과 피드백을 확인해요", "book"], ["grades", "성적 리포트", "반별 학습 흐름을 확인해요", "chart"], ["settings", "학원 설정", "출결과 알림을 설정해요", "settings"]], primary: ["학생·학부모 등록", "navigate", "roster"] },
    teacher: { name: "선생님", title: "수업 준비를 간단하게", detail: "담당 수업의 숙제·성적·학교 일정을 확인하세요.", cards: [["schedule", "수업 일정", "수업과 휴가를 확인해요", "calendar"], ["attendance", "입구 출결 QR", "태블릿에 QR을 크게 띄워요", "qr"], ["grades", "성적 관리", "점수와 피드백을 기록해요", "chart"], ["school-schedule", "내신 일정", "학교 마감을 함께 챙겨요", "calendar"]], primary: ["숙제 검사하기", "navigate", "learning"] },
    student: { name: "학생", title: "오늘 할 일부터", detail: "숙제와 영상을 확인하고 학교 마감을 챙겨요.", cards: [["learning", "숙제·공지", "숙제를 제출하고 피드백을 봐요", "book"], ["attendance", "QR 출석", "카메라로 출결 QR을 읽어요", "qr"], ["grades", "내 성적", "나의 학습 흐름을 확인해요", "chart"], ["school-schedule", "내신 일정", "시험·수행평가를 놓치지 않아요", "calendar"]], primary: ["오늘 숙제 제출", "submit-homework", ""] },
    parent: { name: "학부모", title: "우리 아이의 하루", detail: "연결된 자녀의 출결과 학습 흐름을 확인하세요.", cards: [["attendance", "출결 내역", "등원과 하원을 확인해요", "qr"], ["learning", "숙제·공지", "제출과 피드백을 확인해요", "book"], ["grades", "성적 리포트", "점수와 변화 흐름을 확인해요", "chart"], ["school-schedule", "내신 일정", "학교 시험·준비물을 챙겨요", "calendar"]], primary: ["자녀 성적 추이 보기", "navigate", "grades"] },
  };
  const paths = {
    qr: '<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chart: '<path d="M4 3v18h17M8 17v-5M13 17V8M18 17V5"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const enabled = (role) => Object.hasOwn(roles, window.ACADEMY_APP_ROLE ?? "") && role === window.ACADEMY_APP_ROLE;
  function home(role, academyName, menu, summary, primaryOverride) {
    const data = roles[role];
    const primary = primaryOverride ?? data.primary;
    const extras = menu.filter(([screen]) => screen !== "home" && !data.cards.some(([card]) => card === screen));
    return `<section class="demo-role-home" data-role-home="${role}">
      <header class="demo-role-heading"><p class="demo-role-eyebrow">${escape(academyName)} · ${data.name} 앱</p><h1>${data.title}</h1><p>${data.detail}</p></header>
      <nav class="demo-role-grid" aria-label="${data.name} 주요 메뉴">${data.cards.map(([screen, label, description, symbol]) => `<button class="demo-role-card" type="button" data-action="navigate" data-id="${screen}" data-action-level="secondary"><span class="demo-role-icon">${icon(symbol)}</span><strong>${label}</strong><small>${description}</small></button>`).join("")}
      <details class="demo-role-more"><summary>더 보기 <span aria-hidden="true">＋</span></summary>${extras.map(([screen, label]) => `<button class="text-button" type="button" data-action="navigate" data-id="${escape(screen)}">${escape(label)} <span aria-hidden="true">›</span></button>`).join("")}</details></nav>
      <p class="demo-role-summary">${escape(summary)}</p>
      <div class="demo-action-dock"><button type="button" class="primary demo-role-primary" data-action="${primary[1]}" data-id="${primary[2]}" data-action-level="primary">${primary[0]} <span aria-hidden="true">→</span></button></div>
    </section>`;
  }
  function primarySelector(role, screen) {
    if (screen === "home") return ".demo-role-primary";
    if (screen === "website") return '[data-action="navigate"][data-id="home"]';
    if (screen === "attendance") return role === "student" ? '[data-action="camera-qr"]' : role === "owner" || role === "teacher" ? '[data-action="teacher-qr"]' : null;
    if (screen === "learning") return role === "student" ? '[data-action="submit-homework"]' : role === "owner" || role === "teacher" ? '[data-action="review"]' : null;
    if (screen === "video" && role === "student") return '[data-action="watch-video"]';
    if (screen === "settings" && role === "owner") return '[data-action="edit-settings"]';
    if (screen === "roster" && role === "owner") return '[data-action="apply-roster"]:not(:disabled), [data-action="preview-roster"]';
    if (screen === "school-schedule") return role === "student" ? '[data-action="school-demo-report"]' : role === "parent" ? null : '[data-action="school-demo-approve"]';
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
      control.classList.remove("primary"); control.classList.add("secondary"); control.dataset.actionLevel = "secondary";
    }
    if (candidate) {
      candidate.classList.remove("secondary", "text-button"); candidate.classList.add("primary"); candidate.dataset.actionLevel = "primary";
      if (!candidate.closest(".demo-action-dock")) {
        const dock = document.createElement("div"); dock.className = "demo-action-dock"; dock.append(candidate); container.append(dock);
      }
    }
    if (screen !== "home") container.insertAdjacentHTML("afterbegin", '<button type="button" class="text-button demo-back-home" data-action="navigate" data-id="home">‹ 홈으로</button>');
  }
  window.AcademyRoleUi = Object.freeze({ enabled, home, apply, roles, primarySelector });
})();
