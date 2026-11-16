/* Home and navigation for the synthetic fixed-role application. */
(() => {
  "use strict";
  const text = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const icons = {
    arrow: '<path d="m9 6 6 6-6 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 15h2m4 0h4"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chart: '<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V5"/>',
    bell: '<path d="M4 17h16l-2-3V9a6 6 0 0 0-12 0v5zM10 21h4"/>',
    qr: '<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><path d="M7 14h3v3H7zM14 14h3v3h-3z"/>',
    phone: '<path d="m6 3 3 5-2 2a15 15 0 0 0 7 7l2-2 5 3v2c0 1-1 2-2 2A18 18 0 0 1 2 5c0-1 1-2 2-2z"/>',
    edit: '<path d="m4 16 12-12 4 4L8 20H4zM14 6l4 4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 5 5 3-3 5 5"/><circle cx="16" cy="8" r="1"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--panel)"/><circle cx="16" cy="12" r="2" fill="var(--panel)"/><circle cx="10" cy="18" r="2" fill="var(--panel)"/>',
  };
  const roleLabel = { owner:"원장", teacher:"선생님", student:"학생", parent:"학부모" };
  const icon = name => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ""}</svg>`;
  let panelContext;
  let dragStart;
  let clearCarousel;
  let drawerRoute;

  const button = (label, attrs = "", style = "") => `<button class="${style}" type="button" ${attrs}>${label}</button>`;
  const navigate = id => `data-action="navigate" data-id="${text(id)}"`;
  const homeAction = action => `data-v3-home-action="${text(action)}"`;
  const more = (label, attrs) => button(`${label}${icon("arrow")}`, attrs, "demo-v3-more");
  const academyMark = name => `<span class="demo-v3-academy-mark" aria-hidden="true">${text(String(name).trim().slice(0, 1))}</span>`;
  const heading = (id, title, markup, action = "") =>
    `<section class="demo-v3-section" aria-labelledby="demo-v3-${id}"><header class="demo-v3-section-heading"><h2 id="demo-v3-${id}">${title}</h2>${action}</header>${markup}</section>`;

  function rowList(rows = []) {
    const items = rows.map(({ label, value, detail, screen, assignment, attention, countdown }) => {
      const attrs = assignment ? `data-action="submit-homework" data-id="${text(assignment)}"` : navigate(screen);
      return `<li>${button(`<span><strong>${text(value)}</strong><small>${text([label, detail].filter(Boolean).join(" · "))}</small></span>
        <span class="${attention ? "demo-v3-highlight" : ""}">${countdown ? text(countdown) : icon("arrow")}</span>`, attrs, "demo-v3-row")}</li>`;
    });
    return `<ul class="demo-v3-list">${items.join("")}</ul>`;
  }

  function rosterMetrics(rows) {
    const captions = ["출석률", "검사 대기", "주의 학생", "상담"];
    return `<ul class="demo-v3-metrics">${rows.slice(0, 4).map(({ value, screen }, index) =>
      `<li>${button(`<small>${captions[index]}</small><strong>${text(index === 3 ? "1건" : value)}</strong>`, navigate(screen))}</li>`).join("")}</ul>`;
  }

  function summary(role, opts) {
    const mark = value => `<mark>${text(value)}</mark>`;
    if (role === "student") return opts.pendingCount
      ? `${text(opts.name)}, 오늘 할 일이 ${mark(`${opts.pendingCount}개`)} 남았어요`
      : `${text(opts.name)}, 오늘 할 일을 모두 끝냈어요`;
    if (role === "parent") {
      const { name, attendance } = opts;
      const learner = name.replace(/ 보호자님$/, "").replace(/^[가-힣]([가-힣]{2})$/, "$1");
      if (attendance?.kind === "out") return `${text(learner)}는 ${mark(attendance.time)}에 하원했어요`;
      if (attendance?.kind === "in") return `${text(learner)}는 ${mark(attendance.time)}에 등원했어요`;
      return `${text(learner)}의 오늘 등원 기록을 기다리고 있어요`;
    }
    if (role === "teacher") return opts.todayLessonCount || opts.reviewCount
      ? `오늘 수업 ${mark(`${opts.todayLessonCount ?? 0}개`)}, 검사할 과제 ${mark(`${opts.reviewCount ?? 0}건`)}이에요`
      : "오늘 남은 수업과 검사할 과제가 없어요";
    return opts.presentCount || opts.appointmentCount
      ? `오늘 출석 ${mark(`${opts.presentCount ?? 0}/${opts.rosterCount ?? 0}명`)}, 상담이 ${mark(`${opts.appointmentCount ?? 0}건`)} 있어요`
      : "아직 오늘 출석과 상담 일정이 없어요";
  }

  function staffSection(staff) {
    if (!staff?.length) return "";
    const cards = staff.map(({ id, photoUrl, illustrationUrl, name, title, subject }) => {
      const photo = photoUrl || illustrationUrl;
      const media = photo ? `<img src="${text(photo)}" alt="${photoUrl ? text(name) + " 강사 사진" : ""}">` : `<span class="demo-v3-avatar" aria-hidden="true">${text(name?.[0])}</span>`;
      return `<li>${button(`${media}<strong>${text(name)}</strong><small>${text([title, subject].filter(Boolean).join(" · "))}</small>`,
        `data-action="site-staff-detail" data-id="${text(id)}" aria-label="${text(name)} 강사 상세"`)}</li>`;
    }).join("");
    return heading("staff", "강사진", `<ul class="demo-v3-staff">${cards}</ul>`, more("전체", 'data-action="site-staff-all"'));
  }

  function noticeSection(role, notices = []) {
    if (notices.length === 0) return "";
    const footer = role === "owner" ? button("공지 쓰기", 'data-action="home-notice-write"', "demo-v3-more") : "";
    return heading("notices", "공지", `<ul class="demo-v3-list">${notices.slice(0, 2).map(({ title, detail, id, date }) =>
      `<li>${button(`<span><strong>${text(title)}</strong><small>${text(detail)}</small></span><time>${text(date)}</time>`,
        `data-action="home-notice" data-id="${text(id)}"`, "demo-v3-row")}</li>`).join("")}</ul>${footer}`,
    more("전체", navigate(role === "parent" ? "news" : "learning")));
  }

  function contactSection(profile = {}) {
    const hours = profile.hours;
    const address = profile.address;
    const phone = profile.phone;
    return heading("guide", "학원 안내", `<dl class="demo-v3-contact">
      ${hours ? `<div><dt>운영시간</dt><dd>${text(hours)}</dd></div>` : ""}
      ${address ? `<div><dt>주소</dt><dd>${text(address)}</dd></div>` : ""}
      ${phone ? `<div><dt>전화</dt><dd>${text(phone)}</dd></div>` : ""}
      </dl><div class="demo-v3-contact-actions">
      ${phone ? button(`${icon("phone")}전화하기`, 'data-action="demo-contact" data-id="phone"') : ""}
      ${address ? button('길찾기', 'data-action="demo-contact" data-id="address"') : ""}</div>`);
  }

  function academyIntro(opts) {
    const { profile = {}, staffProfiles = [], notices = [] } = opts;
    return `<div class="demo-v3-introduction"><header class="demo-v3-section"><h1>${text(profile.name)}</h1>
      <p>${text(profile.intro)}</p></header>${staffSection(staffProfiles)}${noticeSection("student", notices)}${contactSection(profile)}</div>`;
  }

  function home(role, opts) {
    const learner = role === "student" || role === "parent";
    const calendar = window.DemoHomeCalendar?.render(role, opts) || "";
    const { rows, profile, controls, notices, staffProfiles } = opts;
    const banner = role === "teacher" ? "" : window.DemoHomeBanners.render(role, opts);
    const initial = `<section class="demo-v3-section demo-v3-intro">
      ${button(`${academyMark(profile.name)}<span>${text(profile.name)} · ${text(opts.context)}</span>${icon("arrow")}`,
        homeAction("academy"), "demo-v3-academy-link")}
      ${role === "parent" ? controls : ""}<h1>${summary(role, opts)}</h1>${banner}</section>`;
    const homework = role === "student" ? "오늘 할 일" : "오늘";
    const classToday = opts.calendar?.lessons?.filter(lesson => lesson.day === "월"
      && opts.calendar.teacherGroups.includes(lesson.groupKey ?? lesson.group)) ?? [];
    const lessonList = `<ul class="demo-v3-list demo-v3-lessons">${classToday.length ? classToday.map(item =>
      `<li>${button(`<span><strong>${text(item.group)}</strong><small>${text(item.room || "수업 일정")}</small></span><time>${text(item.time)}</time>`, navigate("schedule"), "demo-v3-row")}</li>`).join("") :
      "<li class='demo-v3-empty'>오늘 예정된 수업이 없어요.</li>"}</ul>`;
    const today = role === "owner" ? heading("today", "오늘 운영", rosterMetrics(rows), more("전체", navigate("home-overview"))) : role === "teacher"
      ? heading("today", "오늘 수업", lessonList, more("전체", navigate("schedule"))) +
        heading("review", "검사 대기", rowList(rows.slice(1, 2)), more("전체", navigate("learning")))
      : heading("today", homework, rowList(rows.slice(0, 3)), more("전체", navigate("home-overview")));
    const guide = !profile.sections || profile.sections.some(section => ["hours", "contact"].includes(section))
      ? contactSection({ ...profile, hours: !profile.sections || profile.sections.includes("hours") ? profile.hours : "",
        address: !profile.sections || profile.sections.includes("contact") ? profile.address : "",
        phone: !profile.sections || profile.sections.includes("contact") ? profile.phone : "" }) : "";
    const tail = learner ? `${guide}${role === "parent"
      ? `<section class="demo-v3-section">${button(`상담 신청${icon("arrow")}`, 'data-action="demo-consultation"', "demo-v3-contact-cta")}</section>` : ""}
      <div class="demo-v3-academy-footer">${text(profile.name)}</div>` : role === "owner"
      ? `<section class="demo-v3-section" aria-labelledby="demo-website-title"><h2 id="demo-website-title">학원 홈페이지</h2>
        ${more(profile.ready ? "홈페이지 편집" : "홈페이지 만들기", 'data-action="homepage-edit"')}
        ${!profile.phone ? more("연락처 등록", 'data-action="homepage-edit" data-id="contact"') : ""}</section>` : "";
    return `<div class="demo-role-home demo-v3-home" data-role-home="${role}">${initial}${today}${calendar}
      ${learner && (!profile.sections || profile.sections.includes("staff")) ? staffSection(staffProfiles) : ""}
      ${!learner || !profile.sections || profile.sections.includes("notices") ? noticeSection(role, notices) : ""}${tail}</div>`;
  }

  const shortcut = (label, symbol, attrs) => button(`${icon(symbol)}<span>${label}</span>`, attrs);
  const showInfo = ['data-v3-home-action="profile"', "내 정보"];
  const optionsFor = {
    owner: [["홈페이지 편집", "edit", 'data-action="homepage-edit"'], ["배너", "image", 'data-v3-banner-action="manage"'], ["일정", "calendar", homeAction("calendar")], ["설정", "settings", navigate("settings")]],
    teacher: [["출석", "qr", navigate("attendance")], ["과제 검사", "book", navigate("learning")], ["일정", "calendar", homeAction("calendar")], ["공지", "bell", homeAction("notices")]],
    student: [["과제", "book", navigate("learning")], ["성적", "chart", navigate("grades")], ["일정", "calendar", homeAction("calendar")], ["공지", "bell", homeAction("notices")]],
    parent: [["출결", "qr", navigate("attendance")], ["성적", "chart", navigate("grades")], ["상담", "calendar", 'data-action="demo-consultation"'], ["공지", "bell", navigate("news")]],
  };
  function group(title, items) {
    return `<section class="demo-v3-drawer-group"><h3>${title}</h3><ul>${items.map(([attrs, label]) =>
      `<li>${button(`<span>${label}</span>${icon("arrow")}`, attrs)}</li>`).join("")}</ul></section>`;
  }

  function menuContent({ role, options: opts }) {
    const profile = role === "teacher" && opts.ownStaff
      ? `data-action="site-own-card" data-id="${text(opts.ownStaff.id)}"` : homeAction("profile");
    const academy = opts.profile;
    return `<header class="demo-v3-drawer-title"><h2 id="demo-v3-menu-title">메뉴</h2>${button("×", `${homeAction("close")} aria-label="메뉴 닫기"`)}</header>
      ${button(`<span class="demo-v3-avatar" aria-hidden="true">${text(opts.name?.[0])}</span><span><strong>${text(opts.name)}</strong>
      <small>${roleLabel[role]} · ${text(opts.context)}</small></span>${icon("arrow")}`, profile, "demo-v3-profile")}
      <div class="demo-v3-drawer-academy">${button(`${academyMark(academy.name)}<strong>${text(academy.name)}</strong>`, homeAction("academy"))}
      ${academy.phone ? button(`${icon("phone")}전화`, 'data-action="demo-contact" data-id="phone"') : ""}</div>
      <nav class="demo-v3-shortcuts" aria-label="역할 바로가기">${optionsFor[role].map(([label, symbol, attrs]) => shortcut(label, symbol, attrs)).join("")}</nav>
      ${group("학원", [[homeAction("academy"), "학원 소개"], [navigate("schedule"), "수업 시간표"], ...(role === "parent" ? [[navigate("tuition"), "학원비"], [homeAction("calendar"), "일정"]] : []), [homeAction("staff"), "강사진"], [navigate("video"), "학습 영상"]])}
      ${role === "owner" ? group("운영", [[navigate("students"), "학생·반"], [navigate("tuition"), "수납 관리"], [navigate("settings"), "설정"]])
        : role === "teacher" && window.DemoHomeBanners.canManage(role)
          ? group("운영", [['data-v3-banner-action="manage"', "배너 편집"]]) : ""}
      <section class="demo-v3-drawer-group"><h3>설정</h3><label class="demo-v3-theme-switch">
        <span>시스템 설정 따라가기</span><input type="checkbox" role="switch" data-v3-system${window.GradientAppearance.preference() === "system" ? " checked" : ""}></label></section>
      ${group("", [[homeAction("notifications"), "알림 설정"], showInfo, [homeAction("logout"), "로그아웃"]])}`;
  }

  function updateTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    const toggle = document.querySelector('[data-v3-home-action="theme"]');
    toggle?.setAttribute("aria-label", dark ? "밝은 모드로 바꾸기" : "어두운 모드로 바꾸기");
    const input = document.querySelector("[data-v3-system]");
    if (input) input.checked = window.GradientAppearance.preference() === "system";
  }

  function drawer() { return document.getElementById("demo-v3-drawer"); }

  function closeDrawer() {
    if (!drawer()?.open) return;
    drawer().close();
    if (history.state?.demoV3Menu === drawerRoute) history.back();
    drawerRoute = undefined;
  }

  function openDrawer() {
    const menu = drawer();
    if (!menu || menu.open) return;
    menu.querySelector("[data-drawer-content]").innerHTML = menuContent(panelContext);
    drawerRoute = String(Date.now());
    history.pushState({ ...history.state, demoV3Menu: drawerRoute }, "");
    menu.showModal();
    menu.scrollTop = 0;
  }

  window.addEventListener("popstate", () => {
    if (drawer()?.open && history.state?.demoV3Menu !== drawerRoute) {
      drawer().close();
      drawerRoute = undefined;
    }
  });
  window.addEventListener("gradient:appearance-change", updateTheme);

  function handle(control, context) {
    const action = control.dataset.v3HomeAction;
    if (!action) return false;
    if (action === "theme") {
      const mode = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.add("demo-v3-theme-motion");
      window.GradientAppearance.set(mode);
      return true;
    }
    if (action === "menu") { openDrawer(); return true; }
    if (action === "close") { closeDrawer(); return true; }
    closeDrawer();
    if (action === "calendar") window.DemoHomeCalendar.openFull(context);
    else if (action === "notices" || action === "staff") {
      const target = { notices:"#demo-v3-notices", staff:"#demo-v3-staff" }[action];
      if (context.screen !== "home") context.navigate("home");
      const scrollTo = document.querySelector(target);
      if (scrollTo) scrollTo.scrollIntoView({ block:"start" });
      else if (action === "staff") context.navigate("website");
      else if (action === "notices") context.navigate(context.role === "parent" ? "news" : "learning");
    } else if (action === "academy") context.navigate("website");
    else if (action === "profile") {
      if (context.role === "teacher" && context.options.ownStaff) context.openInstructor(context.options.ownStaff.id);
      else context.openDialog("내 정보", `<p>${text(context.options.name)} · ${text(context.options.context)}</p>`);
    } else if (action === "notifications") {
      context.openSheet("알림 설정", `<label><input type="checkbox" name="notices" ${getNoticeMode() ? "checked" : ""}>일정 하루 전 앱 안 알림</label>`,
        form => {
          try { localStorage.setItem("gradient.demo.v3.notices", String(form.has("notices"))); }
          catch { return "알림 설정을 저장하지 못했어요."; }
          return "";
        }, control);
    } else if (action === "logout") context.openDialog("가상 계정", "<p>데모는 가상 역할을 사용합니다. 실제 서비스에는 로그인하지 않았어요.</p>");
    return true;
  }

  function getNoticeMode() {
    try { return localStorage.getItem("gradient.demo.v3.notices") !== "false"; }
    catch { return true; }
  }

  function apply(context) {
    panelContext = context;
    const menu = drawer();
    if (menu && !menu.dataset.bound) {
      menu.dataset.bound = "true";
      menu.addEventListener("cancel", event => { event.preventDefault(); closeDrawer(); });
      menu.addEventListener("close", () => document.querySelector('[data-v3-home-action="menu"]')?.focus());
      menu.addEventListener("click", event => {
        const inside = menu.getBoundingClientRect();
        if (event.target === menu && (event.clientX < inside.left || event.clientY < inside.top || event.clientY > inside.bottom)) closeDrawer();
        if (event.target.closest("[data-action], [data-v3-banner-action], #reset, #iphone-install, a")) closeDrawer();
      });
      menu.addEventListener("pointerdown", event => { dragStart = { x:event.clientX, y:event.clientY }; });
      menu.addEventListener("pointerup", event => {
        if (dragStart && event.clientX - dragStart.x > 64 && Math.abs(event.clientY - dragStart.y) < 50) closeDrawer();
        dragStart = undefined;
      });
      menu.addEventListener("pointercancel", () => { dragStart = undefined; });
      menu.addEventListener("change", event => {
        if (event.target.matches("[data-v3-system]")) {
          window.GradientAppearance.set(event.target.checked ? "system" : document.documentElement.dataset.theme);
        }
      });
    }
    updateTheme();
    clearCarousel?.();
    clearCarousel = window.DemoHomeBanners.enhance(document.getElementById("content"));
    window.DemoHomeCalendar?.enhance(document.getElementById("content"), context);
  }

  window.DemoHomeV3 = Object.freeze({ home, academyIntro, handle, apply, getNoticeMode });
})();
