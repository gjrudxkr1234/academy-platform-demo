/* Synthetic staff time, payroll and leave for the fixed-role demo. */
(() => {
  "use strict";

  const storageKey = "gradient-demo-staff-operations";
  const today = "2026-11-16";
  const payroll = [
    { id:"dohyeon", name:"이도현", kind:"시급 강사", hours:46, wage:30000, baseLeave:15, used:4 },
    { id:"haram", name:"김하람", kind:"주 12시간 · 시급 강사", hours:44, wage:20000, academyLeave:3 },
    { id:"haneul", name:"정하늘", kind:"원장", hours:0, wage:0, basePay:1860000 },
  ];
  const payFor = (staff) => staff.basePay ?? staff.hours * staff.wage;
  const currentStaff = payroll[0];
  const weekday = (date) => "일월화수목금토"[new Date(date + "T00:00:00Z").getUTCDay()];
  const dateText = (value) => {
    const [, month, day] = value.split("-").map(Number);
    return `${month}월 ${day}일(${weekday(value)})`;
  };
  const whole = new Intl.NumberFormat("ko-KR");
  const amount = (value) => whole.format(value);
  const won = (value) => `${amount(value)}원`;
  const conciseWon = (value) => value % 10000 === 0 ? `${amount(value / 10000)}만원` : won(value);
  const initial = () => ({
    requests: [
      { id:"leave-demo-1", staffId:currentStaff.id, date:"2026-11-20", unit:"day", kind:"annual", reason:"개인 일정", status:"pending" },
      { id:"leave-demo-cover", staffId:"haram", date:today, unit:"day", kind:"academy", reason:"개인 일정", status:"approved", substitute:currentStaff.id },
    ],
    attendance:"idle",
    approvedTime:false,
    finalized:false,
  });
  let memory;
  let tab = "pending";
  let selectedStaff;
  let workTab = "work";

  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (Array.isArray(stored?.requests)) return stored;
    } catch { /* Restricted browsers can still run the fixture in memory. */ }
    return memory ??= initial();
  }

  function write(data, ctx, message) {
    memory = data;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* The active session still reflects the change. */ }
    ctx.rerender();
    if (message) ctx.announce(message);
  }

  function reset() {
    memory = undefined;
    tab = "pending";
    workTab = "work";
    selectedStaff = undefined;
    try { localStorage.removeItem(storageKey); } catch { /* In-memory state has already been reset. */ }
  }

  const draw = {
    arrow:'<path d="m9 6 6 6-6 6"/>',
    back:'<path d="m15 6-6 6 6 6"/>',
    wallet:'<path d="M20 9V6H6a2 2 0 0 0 0 4h14v10H6a2 2 0 0 1-2-2V8m16 6h-4"/>',
    wages:'<path d="m4 5 4 14 4-10 4 10 4-14M3 10h18M3 14h18"/>',
    plane:'<path d="m3 11 7 2 3 8 2-1-1-8 6-6a1.5 1.5 0 0 0-2-2l-6 6-8-1z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18m-9 9a16 16 0 0 0 0-18m0 18a16 16 0 0 1 0-18"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m4 16 5-5 4 4 4-4 3 4"/>',
    notice:'<path d="M4 10v4h4l9 4V6l-9 4zm0 0v4m4 0 2 5"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4"/>',
    school:'<path d="m3 9 9-5 9 5-9 5zm3 2v6l6 3 6-3v-6"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${draw[name]}</svg>`;
  const text = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
  const nav = (id) => `data-action="navigate" data-id="${id}"`;
  const action = (type, label, opts = {}) => `<button type="button" class="ops-button ops-${opts.variant ?? "quiet"}" data-staff-operation="${type}" ${opts.id ? `data-staff-id="${text(opts.id)}"` : ""}>${opts.icon ? icon(opts.icon) : ""}${label}</button>`;
  const link = (id, label, css = "ops-button ops-quiet", graphic) =>
    `<button type="button" class="${css}" ${nav(id)}>${graphic ? icon(graphic) : ""}${label}</button>`;
  const pill = (id, label = "전체") => link(id, `${label}${icon("arrow")}`, "ops-pill");
  const avatar = (name) => `<span class="ops-avatar" aria-hidden="true">${text(name[0])}</span>`;
  const money = () => payroll.reduce((total, person) => total + payFor(person), 0);
  const pending = (data) => data.requests.filter((entry) => entry.status === "pending");
  const person = (id) => payroll.find((member) => member.id === id);
  const validDate = (date) => {
    if (!/^2026-\d{2}-\d{2}$/.test(date)) return false;
    const value = new Date(date + "T00:00:00Z");
    return !Number.isNaN(value.getTime()) && value.toISOString().slice(0,10) === date;
  };
  const units = { day:"하루", half:"반나절", hour:"시간" };
  const kinds = { annual:"연차", academy:"학원 휴가" };
  const statuses = { pending:"승인 대기", approved:"승인 완료", rejected:"거절" };

  function remaining(staff, data) {
    if (staff.baseLeave == null && staff.academyLeave == null) return null;
    const paidDays = data.requests.filter((entry) => entry.staffId === staff.id && entry.status === "approved")
      .reduce((total, entry) => total + (entry.unit === "day" ? 1 : entry.unit === "half" ? 0.5 : entry.hours / 8), 0);
    return Math.max(0, (staff.baseLeave ?? staff.academyLeave) - (staff.used ?? 0) - paidDays);
  }

  function header(title, back) {
    return `<header class="ops-heading">${back ? `<button type="button" class="ops-back" aria-label="뒤로 가기" ${nav(back)}>${icon("back")}</button>` : ""}<h1>${title}</h1></header>`;
  }

  function operations(opts) {
    const data = read();
    const tuition = window.DemoTuition.metrics();
    const openLeave = pending(data).length;
    const problems = [
      ["staff-leave", openLeave, `휴가 승인 ${openLeave}건`],
      ["tuition", tuition.unpaid, `미납 ${tuition.unpaid}명`],
      ["learning", opts.reviewCount, `검사 대기 ${opts.reviewCount}건`],
    ];
    const groups = [
      ["돈", [
        ["tuition","wallet","수납 관리",tuition.outstanding ? `미수납 ${conciseWon(tuition.outstanding)}` : "미수납 없음", tuition.outstanding > 0],
        ["staff-pay","wages","근무·급여",`11월 예상 ${conciseWon(money())}`],
      ]],
      ["강사·수업", [
        ["staff-leave","plane","강사 휴가·대타",openLeave ? `승인 대기 ${openLeave}건` : "승인 대기 없음", openLeave > 0],
        ["timetable","calendar","수업 시간표",`반 ${new Set(opts.calendar.lessons.map((lesson) => lesson.groupKey ?? lesson.group)).size}개 · 주 ${opts.calendar.lessons.length}회`],
      ]],
      ["학원 알리기", [
        ["website","globe","홈페이지",opts.homepageEditLabel],
        ["banners","image","배너",`게시 중 ${opts.bannerCount}개`],
        ["notifications","notice","공지·발송",`이번 주 ${opts.weeklyNotices}건`],
      ]],
      ["학습", [
        ["learning","check","과제 검사",opts.reviewCount ? `대기 ${opts.reviewCount}건` : "대기 없음", opts.reviewCount > 0],
        ["grades","file","성적 리포트",opts.scoreLabel],
      ]],
    ];
    return `<div class="ops-page" data-staff-screen="operations">
      <header class="ops-heading"><h1>운영</h1><span>${text(opts.profile.name)}</span></header>
      ${problems.some(([, count]) => count) ? `<nav class="ops-alerts" aria-label="처리할 일">${problems.filter(([, count]) => count)
        .map(([id,, label]) => `<button type="button" ${nav(id)}><i aria-hidden="true"></i>${label}</button>`).join("")}</nav>` : ""}
      ${groups.map(([title, tiles]) => `<section class="ops-category"><h2>${title}</h2><div class="ops-tiles${tiles.length === 3 ? " ops-tiles-three" : ""}">
        ${tiles.map(([id, graphic, label, summary, urgent]) => `<button type="button" class="ops-tile" ${id === "banners" ? 'data-v3-banner-action="manage"' : nav(id)}>
          ${icon(graphic)}<strong>${label}</strong><small${urgent ? ' class="ops-urgent"' : ""}>${text(summary)}</small></button>`).join("")}</div></section>`).join("")}
      <button type="button" class="ops-settings" ${nav("settings")}>${icon("settings")}<strong>학원 설정</strong>${icon("arrow")}</button>
    </div>`;
  }

  function schoolTile() {
    return `<div class="ops-school-tiles"><button type="button" class="ops-settings" ${nav("school-schedule")}>${icon("school")}<strong>학교·내신 일정</strong>${icon("arrow")}</button>
      <button type="button" class="ops-settings" data-v3-calendar-action="exam-only">${icon("calendar")}<strong>캘린더 시험 일정</strong>${icon("arrow")}</button></div>`;
  }

  function teacherHome() {
    const data = read();
    const days = remaining(currentStaff, data);
    return `<section class="demo-v3-section ops-home-work" aria-labelledby="ops-teacher-home">
      <header class="demo-v3-section-heading"><h2 id="ops-teacher-home">내 근무·휴가</h2>${pill("my-work")}</header>
      <dl class="ops-metrics"><div><dt>이번 달 근무</dt><dd>${currentStaff.hours}<small>시간</small></dd></div>
      <div><dt>예상 급여</dt><dd>${amount(payFor(currentStaff) / 10000)}<small>만원</small></dd></div>
      <div><dt>남은 휴가</dt><dd>${amount(days)}<small>일</small></dd></div></dl>
      <div class="ops-actions">${action("my-statement","내 명세서",{icon:"file"})}${action("request","휴가 신청",{variant:"primary",icon:"plane"})}</div>
    </section>`;
  }

  function lessonsFor(staff, entry, lessons) {
    return lessons.filter((lesson) => lesson.teacher === staff.name && lesson.day === weekday(entry.date));
  }

  function substituteOptions(data, entry, lessons) {
    const member = person(entry.staffId);
    const coverage = lessonsFor(member, entry, lessons);
    if (!coverage.length) return [];
    return payroll.filter((staff) => staff.id !== member.id && staff.id !== "haneul"
      && !data.requests.some((leave) => leave.status === "approved" && leave.date === entry.date && leave.staffId === staff.id)
      && coverage.every((lesson) => {
        const [start, end] = lesson.time.split("–");
        const conflicts = (other) => {
          const [otherStart, otherEnd] = other.time.split("–");
          return start < otherEnd && otherStart < end;
        };
        return !lessonsFor(staff, entry, lessons).some(conflicts)
          && !data.requests.some((other) => other.substitute === staff.id && other.status === "approved" && other.date === entry.date
            && lessonsFor(person(other.staffId), other, lessons).some(conflicts));
      }));
  }

  function balances(data) {
    return `<section class="ops-balances"><h2>강사별 남은 휴가</h2><ul>${payroll.map((staff) => {
      const days = remaining(staff, data);
      const detail = staff.baseLeave != null ? `법정 연차 ${staff.baseLeave}일 중 ${amount(staff.baseLeave - days)}일 사용` :
        staff.academyLeave != null ? "주 12시간 · 법정 연차 대상 아님 · 학원 휴가" : "—";
      return `<li>${avatar(staff.name)}<span><strong>${staff.name}${staff.id === "haneul" ? " (원장)" : ""}</strong><small>${detail}</small></span>
        <b>${days == null ? "—" : `${amount(days)}일`}</b></li>`;
    }).join("")}</ul></section>`;
  }

  function approval(entry, data, ctx) {
    const staff = person(entry.staffId);
    const coverage = lessonsFor(staff, entry, ctx.lessons);
    const choices = substituteOptions(data, entry, ctx.lessons);
    const coverageLabel = coverage.map((lesson) => `${lesson.group} ${lesson.time}`).join(" · ");
    return `<article class="ops-card" data-ops-request="${text(entry.id)}">
      <header class="ops-person">${avatar(staff.name)}<div><h2>${staff.name} 선생님</h2><p>${dateText(entry.date)} · ${units[entry.unit]}${entry.unit === "hour" ? `${entry.hours}시간` : ""} · ${kinds[entry.kind]}</p></div></header>
      <p class="ops-secondary-text">사유: ${text(entry.reason || "미입력")}</p>
      <dl class="ops-request-info"><div><dt>그날 수업</dt><dd>${text(coverageLabel || "예정된 수업 없음")}</dd></div>
      ${coverage.length && choices.length ? `<div><dt><label for="substitute-${text(entry.id)}">대체 강사</label></dt><dd><select id="substitute-${text(entry.id)}">
        ${choices.map((member) => `<option value="${member.id}">${member.name} 선생님</option>`).join("")}</select></dd></div>` : ""}</dl>
      ${coverage.length ? `<p class="ops-available${choices.length ? "" : " ops-urgent"}">${choices.length === 1
        ? `${choices[0].name} 선생님은 그 시간 비어 있어요` : choices.length ? "해당 시간에 빈 강사만 표시해요" : "해당 시간에 비어 있는 강사가 없어요"}</p>` : ""}
      <div class="ops-actions">${action("reject","거절",{id:entry.id,variant:"danger"})}${(!coverage.length || choices.length)
        ? action("approve",coverage.length ? "승인하고 대타 배정" : "휴가 승인",{id:entry.id,variant:"primary"}) : ""}</div>
    </article>`;
  }

  function requestsList(entries) {
    if (!entries.length) return '<p class="ops-empty">등록된 휴가가 없어요.</p>';
    return `<ul class="ops-records">${entries.map((entry) => `<li><div><strong>${person(entry.staffId).name} · ${dateText(entry.date)}</strong>
      <small>${units[entry.unit]} · ${kinds[entry.kind]}${entry.substitute ? ` · 대타 ${person(entry.substitute).name}` : ""}</small></div>
      <b>${statuses[entry.status]}</b></li>`).join("")}</ul>`;
  }

  function leave(ctx) {
    const data = read();
    const waiting = pending(data);
    const tabs = [["pending",`승인 대기 ${waiting.length}`],["month","이번 달"],["staff","강사별 휴가"]];
    return `<div class="ops-page" data-staff-screen="leave">${header("강사 휴가·대타","operations")}
      <nav class="ops-segments" aria-label="휴가 보기">${tabs.map(([id,label]) => `<button type="button" aria-pressed="${tab === id}" data-staff-operation="leave-tab" data-staff-id="${id}">${label}</button>`).join("")}</nav>
      ${tab === "pending" ? `${waiting.map((entry) => approval(entry, data, ctx)).join("") || '<p class="ops-empty">승인 대기 중인 휴가가 없어요.</p>'}${balances(data)}`
        : tab === "month" ? requestsList(data.requests.filter((entry) => entry.date.startsWith("2026-11"))) : balances(data)}
    </div>`;
  }

  function staffCard(staff, data, lessons) {
    const classes = [...new Set(lessons.filter((lesson) => lesson.teacher === staff.name).map((lesson) => lesson.group))];
    const days = remaining(staff, data);
    return `<button type="button" class="ops-pay-row" data-staff-operation="open-staff" data-staff-id="${staff.id}">
      ${avatar(staff.name)}<div><strong>${staff.name}</strong><small>${text([staff.kind, ...classes].join(" · "))}</small>
      <span>${staff.hours}시간 · ${won(payFor(staff))} · 휴가 ${days == null ? "—" : `${amount(days)}일`}</span></div>${icon("arrow")}</button>`;
  }

  function pay(ctx) {
    const data = read();
    const staff = person(selectedStaff);
    return `<div class="ops-page" data-staff-screen="pay">${header("근무·급여","operations")}
      <div class="ops-pay-summary"><span>11월 예상 인건비</span><strong>${won(money())}</strong><small>최종 신고는 세무사 확인</small></div>
      ${staff ? `<section class="ops-card"><div class="ops-person">${avatar(staff.name)}<div><h2>${staff.name}</h2><p>${staff.kind}</p></div></div>
        <dl class="ops-request-info"><div><dt>이번 달 근무</dt><dd>${staff.hours}시간</dd></div><div><dt>예상 급여</dt><dd>${won(payFor(staff))}</dd></div>
        <div><dt>근무 확인</dt><dd>${data.approvedTime ? "승인 완료" : "승인 대기"}</dd></div></dl>
        <div class="ops-actions">${action("close-staff","강사 목록")}${staff.id === currentStaff.id && !data.approvedTime ? action("approve-time","근무 승인",{variant:"primary"}) : action("staff-statement","명세서",{id:staff.id})}</div></section>`
        : `<div class="ops-pay-list">${payroll.map((member) => staffCard(member, data, ctx.lessons)).join("")}</div>
          ${data.finalized ? '<p class="ops-empty">가상 11월 급여를 마감했어요.</p>' : action("finalize","11월 가상 급여 마감",{variant:"primary"})}`}
    </div>`;
  }

  function myWork() {
    const data = read();
    const label = data.attendance === "idle" ? "출근 체험" : data.attendance === "in" ? "퇴근 체험" : "오늘 퇴근 완료";
    return `<div class="ops-page" data-staff-screen="my-work">${header("내 근무·휴가","home")}
      <nav class="ops-segments" aria-label="내 근무·휴가 보기">${[["work","내 근무"],["leave","내 휴가"],["statement","내 명세서"]].map(([id,name]) =>
      `<button type="button" aria-pressed="${workTab === id}" data-staff-operation="work-tab" data-staff-id="${id}">${name}</button>`).join("")}</nav>
      ${workTab === "work" ? `<div class="ops-card"><h2>11월 근무</h2><p>${currentStaff.hours}시간 · ${data.approvedTime ? "승인 완료" : "승인 대기"}</p>
        ${data.attendance === "out" ? `<p>${label}</p>` : action("attend",label,{variant:"primary"})}</div>`
        : workTab === "leave" ? `<div class="ops-card"><h2>남은 휴가 ${amount(remaining(currentStaff, data))}일</h2>${requestsList(data.requests.filter((entry) => entry.staffId === currentStaff.id))}
          ${action("request","휴가 신청",{variant:"primary",icon:"plane"})}</div>` : statementMarkup(currentStaff)}
    </div>`;
  }

  function statementMarkup(staff) {
    return `<section class="ops-card"><h2>11월 예상 급여 · 가상 명세서</h2><dl class="ops-request-info">
      ${staff.basePay == null ? `<div><dt>시급 × 근무시간</dt><dd>${won(staff.wage)} × ${staff.hours}시간</dd></div>` : ""}
      <div><dt>예상 급여</dt><dd>${won(payFor(staff))}</dd></div></dl><p>최종 신고는 세무사 확인</p></section>`;
  }

  function request(opener, ctx) {
    ctx.openSheet("휴가 신청", '<label>휴가 날짜<input type="date" name="date" min="2026-11-16" value="2026-11-23" required></label>'
      + '<label>휴가 종류<select name="kind"><option value="annual">연차</option><option value="academy">학원 휴가</option></select></label>'
      + '<label>사용 단위<select name="unit"><option value="day">하루</option><option value="half">반나절</option><option value="hour">시간</option></select></label>'
      + '<label>시간 단위로 신청하는 경우<input name="hours" type="number" min="1" max="7" value="1"></label>'
      + '<label>사유<input name="reason" maxlength="100"></label>',
    (form) => {
      const date = form.get("date"), unit = form.get("unit"), kind = form.get("kind"), hours = Number(form.get("hours"));
      const data = read();
      if (!validDate(date) || date < today || !Object.hasOwn(units, unit) || !Object.hasOwn(kinds, kind)
        || (unit === "hour" && !(Number.isInteger(hours) && hours >= 1 && hours <= 7))) return "날짜와 휴가 시간을 확인해 주세요.";
      if (kind === "academy") return "이 가상 강사는 별도 학원 휴가가 없어요.";
      if (data.requests.some((entry) => entry.staffId === currentStaff.id && entry.date === date && entry.status !== "rejected")) return "같은 날짜에 휴가 기록이 있어요.";
      const days = unit === "day" ? 1 : unit === "half" ? 0.5 : hours / 8;
      if (days > remaining(currentStaff, data)) return "남은 휴가를 확인해 주세요.";
      data.requests.push({ id:crypto.randomUUID(), staffId:currentStaff.id, date, unit, kind, hours, reason:String(form.get("reason")).trim().slice(0,100), status:"pending" });
      write(data,ctx);
    },opener,{confirmLabel:"휴가 신청 보내기",successMessage:"가상 휴가 신청을 이 기기에 저장했어요."});
  }

  function handle(control, ctx) {
    const { staffOperation: command, staffId: id } = control.dataset;
    const data = read();
    if (ctx.role === "teacher") {
      if (command === "my-statement") {
        workTab = "statement";
        ctx.navigate("my-work");
      } else if (command === "request") request(control,ctx);
      else if (command === "work-tab" && ["work","leave","statement"].includes(id)) {
        workTab = id;
        ctx.rerender();
      } else if (command === "attend" && data.attendance !== "out") {
        data.attendance = data.attendance === "idle" ? "in" : "out";
        write(data,ctx,`가상 ${data.attendance === "in" ? "출근" : "퇴근"}을 기록했어요.`);
      }
      return;
    }
    if (ctx.role !== "owner") return;
    if (command === "leave-tab" && ["pending","month","staff"].includes(id)) {
      tab = id;
      ctx.rerender();
    } else if ((command === "open-staff" && person(id)) || command === "close-staff") {
      selectedStaff = command === "open-staff" ? id : undefined;
      ctx.rerender();
    } else if (command === "staff-statement" && person(id)) {
      ctx.openSheet("가상 명세서", statementMarkup(person(id)), undefined, control, {closeOnly:true});
    } else if (command === "approve-time" && selectedStaff === currentStaff.id) {
      data.approvedTime = true;
      write(data,ctx,"가상 근무 기록을 승인했어요.");
    } else if (command === "finalize") {
      ctx.openSheet("11월 가상 급여 마감", `<p>예상 급여 합계 ${won(money())}</p><p>최종 신고는 세무사 확인</p>`, () => {
        const current = read();
        current.finalized = true;
        write(current,ctx);
      }, control,{confirmLabel:"가상 마감하기"});
    } else if (command === "approve" || command === "reject") {
      const entry = data.requests.find((item) => item.id === id && item.status === "pending");
      if (!entry) return;
      const member = person(entry.staffId);
      const days = entry.unit === "day" ? 1 : entry.unit === "half" ? 0.5 : entry.hours / 8;
      if (command === "approve" && days > remaining(member, data)) {
        ctx.announce("남은 휴가를 확인해 주세요.");
        return;
      }
      const coverage = lessonsFor(member,entry,ctx.lessons);
      const substitute = control.closest("[data-ops-request]")?.querySelector("select")?.value;
      if (command === "approve" && coverage.length && !substituteOptions(data,entry,ctx.lessons).some((member) => member.id === substitute)) {
        ctx.announce("수업과 대체 강사 일정이 달라졌어요. 다시 확인해 주세요.");
        return;
      }
      entry.status = command === "approve" ? "approved" : "rejected";
      if (command === "approve" && coverage.length) entry.substitute = substitute;
      write(data,ctx,command === "approve" ? "가상 휴가를 승인했어요." : "가상 휴가 신청을 거절했어요.");
    }
  }

  function teachingToday(lessons) {
    const leaves = read().requests.filter((entry) => entry.date === today && entry.status === "approved");
    return lessons.filter((lesson) => lesson.day === weekday(today)).flatMap((lesson) => {
      const leave = leaves.find((entry) => person(entry.staffId)?.name === lesson.teacher);
      if (leave) return leave.substitute === currentStaff.id ? [{...lesson, substitute:true}] : [];
      return lesson.teacher === currentStaff.name ? [{...lesson, substitute:false}] : [];
    }).sort((a,b) => a.time.localeCompare(b.time));
  }

  window.DemoStaffOperations = Object.freeze({ operations, schoolTile, teacherHome, leave, pay, myWork, handle, teachingToday, reset,
    ownsStorage:(key) => key === storageKey });
})();
