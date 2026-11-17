/* Synthetic staff time, payroll and leave for the fixed-role demo. */
(() => {
  "use strict";

  const storageKey = "gradient-demo-staff-operations";
  const today = "2026-11-16";
  const calculator = window.AcademyWorkforceCalculator;
  const estimateLabel = calculator.payrollEstimateLabel;
  const payroll = [
    { id:"dohyeon", accountId:"demo-teacher", name:"이도현", kind:"시급 강사", hireDate:"2025-01-07", scenario:"hourly20" },
    { id:"haram", accountId:"demo-teacher-2", name:"김하람", kind:"시급 알바", hireDate:"2026-08-03", scenario:"hourly12", academyDays:3 },
    { id:"jimin", accountId:"demo-teacher-3", name:"박지민", kind:"비율제 프리랜서", hireDate:"2026-02-02", scenario:"freelancer40" },
    { id:"owner", accountId:"demo-owner", name:"김서윤", kind:"대표자", scenario:"representative" },
  ];
  const currentStaff = payroll[0];
  const representative = payroll.find(({ id }) => id === "owner");
  const payrollStaff = () => [...payroll, ...(window.DemoHiring?.employees() ?? [])];
  const defaultSettings = { fivePlus:true, company:"individual", includeRepresentative:false };
  const included = (staff, data) => staff !== representative || (data.settings.company === "corporation" && data.settings.includeRepresentative);
  const recruitmentTerms = (staff, wage) => wage != null && staff.recruitment.kind === "hourly"
    ? { ...staff.recruitment, rate:wage } : staff.recruitment;
  function payInput(staff, data, wage = data.hourlyRates[staff.id]) {
    const terms = staff.recruitment
      ? window.DemoHiring.payInput(recruitmentTerms(staff,wage),today.slice(0,7)) : calculator.scenarios[staff.scenario].payrollInput;
    const input = { ...terms, regularStaffCountAtLeastFive:data.settings.fivePlus };
    if (staff.recruitment) return input;
    if (wage == null || input.employment !== "hourly") return input;
    const updated = { ...input, hourlyRate:wage };
    const gross = calculator.calculatePayroll(updated).gross;
    updated.insurance = Object.fromEntries(Object.entries(input.insurance ?? {})
      .map(([name, value]) => [name, value == null ? value : gross]));
    if (input.withholding) updated.withholding = { ...input.withholding, taxableMonthlyPay:gross };
    return updated;
  }
  const payFor = (staff, data) => calculator.calculatePayroll(payInput(staff, data));
  // The demo clock is November 16. Two fixture weeks have finished, whereas
  // the payroll scenario projects four full weeks for the November estimate.
  const recordedWeekEnds = ["2026-11-08","2026-11-15"];
  const monthlyMinutes = (staff,data) => payInput(staff,data).workMinutes ?? 0;
  function recordedMinutes(staff,data) {
    const weeks = payInput(staff,data).weeks ?? [];
    return recordedWeekEnds.reduce((total,end,index) =>
      total + (end <= today && weeks[index]?.allScheduledDaysWorked ? weeks[index].scheduledMinutes : 0),0);
  }
  const weeklyHours = (staff, data) => payInput(staff,data).scheduledWeeklyMinutes / 60;
  const weekday = (date) => "일월화수목금토"[new Date(date + "T00:00:00Z").getUTCDay()];
  const dateText = (value) => {
    const [, month, day] = value.split("-").map(Number);
    return `${month}월 ${day}일(${weekday(value)})`;
  };
  const whole = new Intl.NumberFormat("ko-KR");
  const days = new Intl.NumberFormat("ko-KR", { maximumFractionDigits:2 });
  const amount = (value) => whole.format(value);
  const won = (value) => `${amount(value)}원`;
  const conciseWon = (value) => value % 10000 === 0 ? `${amount(value / 10000)}만원` : won(value);
  const duration = (minutes) => `${amount(Math.floor(minutes / 60))}시간${minutes % 60 ? ` ${amount(minutes % 60)}분` : ""}`;
  const estimated = (value) => value == null ? "확인 필요" : won(value);
  const initial = () => ({
    requests: [
      { id:"leave-demo-1", staffId:currentStaff.id, date:"2026-11-20", unit:"day", kind:"annual", reason:"개인 일정", status:"pending" },
      { id:"leave-demo-cover", staffId:"haram", date:today, unit:"day", kind:"academy", reason:"개인 일정", status:"approved", substitute:currentStaff.id },
    ],
    settings:{ ...defaultSettings },
    hourlyRates:{},
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
      if (Array.isArray(stored?.requests)) return { ...initial(), ...stored, settings:{ ...defaultSettings, ...stored.settings } };
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
    wallet:'<path d="M20 9V6H6a2 2 0 0 0 0 4h14v10H6a2 2 0 0 1-2-2V8m16 6h-4"/>',
    wages:'<path d="m4 5 4 14 4-10 4 10 4-14M3 10h18M3 14h18"/>',
    hiring:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18m-11 0v2h4v-2"/>',
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
  const money = (data) => payrollStaff().filter((staff) => included(staff,data)).reduce((total, staff) => total + payFor(staff,data).gross,0);
  const pending = (data) => data.requests.filter((entry) => entry.status === "pending");
  const person = (id) => payrollStaff().find((member) => member.id === id);
  const nameFor = (staff,ctx) => ctx?.staffName?.(staff.accountId) || staff.name;
  const ownsLesson = (staff,lesson) => lesson.teacherId ? lesson.teacherId === staff.accountId : lesson.teacher === staff.name;
  const validDate = (date) => {
    if (!/^2026-\d{2}-\d{2}$/.test(date)) return false;
    const value = new Date(date + "T00:00:00Z");
    return !Number.isNaN(value.getTime()) && value.toISOString().slice(0,10) === date;
  };
  const units = { day:"하루", half:"반나절", hour:"시간" };
  const kinds = { annual:"연차", academy:"학원 휴가" };
  const statuses = { pending:"승인 대기", approved:"승인 완료", rejected:"거절" };

  function leaveCharge(staff, entry, data) {
    const workDay = Math.round(weeklyHours(staff,data) * 60 / 5);
    return entry.unit === "day" ? workDay : entry.unit === "half" ? Math.round(workDay / 2) : entry.hours * 60;
  }

  function leaveFor(staff, data) {
    const sample = staff === currentStaff ? calculator.scenarios.leave20.leaveInput : {};
    const workDayMinutes = leaveCharge(staff, {unit:"day"}, data);
    const used = { annual:sample.usedMinutes ?? 0, academy:0 };
    for (const entry of data.requests) {
      if (entry.staffId === staff.id && entry.status === "approved" && Object.hasOwn(used,entry.kind)) {
        used[entry.kind] += leaveCharge(staff,entry,data);
      }
    }
    const employment = payInput(staff,data).employment;
    const leave = calculator.calculateLeave({
      completedMonthlyAttendance:0, priorYearAttendanceBasisPoints:0, ...sample,
      employment, regularStaffCountAtLeastFive:data.settings.fivePlus,
      scheduledWeeklyMinutes:weeklyHours(staff,data) * 60, hireDate:staff.hireDate ?? today,
      asOfDate:"2026-11-17", selfGrantedMinutes:0, usedMinutes:used.annual,
    });
    const academyMinutes = Math.max(0,(staff.academyDays ?? 0) * workDayMinutes - used.academy);
    return { ...leave, applies:staff !== representative && employment !== "freelancer", academyMinutes,
      academyDays:staff.academyDays && workDayMinutes ? academyMinutes / workDayMinutes : null };
  }

  function remainingLeave(leave) {
    if (!leave.applies) return "해당 없음";
    const statutory = duration(leave.remainingMinutes);
    if (leave.academyDays === null) return statutory;
    const academy = `${days.format(leave.academyDays)}일`;
    return leave.eligible ? `${statutory} · 학원 휴가 ${academy}` : academy;
  }

  function alerts(opts, data, tuition) {
    const openLeave = pending(data).length;
    const problems = [
      ["staff-leave", openLeave, `휴가 승인 ${openLeave}건`],
      ["tuition", tuition.unpaid, `미납 ${tuition.unpaid}명`],
      ["learning", opts.reviewCount, `검사 대기 ${opts.reviewCount}건`],
    ].filter(([, count]) => count);
    return problems.length ? `<nav class="ops-alerts" aria-label="처리할 일">${problems
      .map(([id,, label]) => `<button type="button" ${nav(id)}><i aria-hidden="true"></i>${label}</button>`).join("")}</nav>` : "";
  }

  function homeAlerts(opts) { return alerts(opts,read(),window.DemoTuition.metrics()); }

  function settings() {
    const { company, fivePlus, includeRepresentative } = read().settings;
    return `<section class="demo-setting-group ops-pay-settings"><h2>근무·급여</h2>
      <button type="button" class="demo-setting-row" data-staff-operation="headcount" role="switch" aria-checked="${fivePlus}" aria-label="상시 근로자 5인 이상">
        <span>상시 근로자 5인 이상</span><span data-setting-value>${fivePlus ? "켜짐" : "꺼짐"}</span><span class="demo-switch" aria-hidden="true"></span></button>
      <button type="button" class="demo-setting-row" data-staff-operation="company"><span>사업 형태</span><span data-setting-value>
        ${company === "corporation" ? "법인" : "개인사업자"}</span><span aria-hidden="true">›</span></button>
      ${company === "corporation" ? `<button type="button" class="demo-setting-row" data-staff-operation="representative" role="switch"
        aria-checked="${includeRepresentative}" aria-label="법인 대표 급여 계산에 포함">
        <span>법인 대표 급여 계산에 포함</span><span data-setting-value>${includeRepresentative ? "켜짐" : "꺼짐"}</span><span class="demo-switch" aria-hidden="true"></span></button>` : ""}
    </section>`;
  }

  function header(title) {
    return `<header class="ops-heading"><h1>${title}</h1></header>`;
  }

  function operations(opts) {
    selectedStaff = undefined;
    const data = read();
    const tuition = window.DemoTuition.metrics();
    const openLeave = pending(data).length;
    const groups = [
      ["돈", [
        ["tuition","wallet","수납 관리",tuition.outstanding ? `미수납 ${conciseWon(tuition.outstanding)}` : "미수납 없음", tuition.outstanding > 0],
        ["staff-pay","wages","근무·급여",`11월 예상 ${conciseWon(money(data))}`],
        ["hiring","hiring","강사 채용",`게시 중 ${window.DemoHiring?.metrics() ?? 0}건`],
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
      ${alerts(opts,data,tuition)}
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
    const leave = leaveFor(currentStaff,data);
    return `<section class="demo-v3-section ops-home-work" aria-labelledby="ops-teacher-home">
      <header class="demo-v3-section-heading"><h2 id="ops-teacher-home">내 근무·휴가</h2>${pill("my-work")}</header>
      <dl class="ops-metrics"><div><dt>11월 16일까지 근무</dt><dd>${amount(recordedMinutes(currentStaff,data) / 60)}<small>시간</small></dd></div>
      <div><dt>예상 급여</dt><dd>${amount(payFor(currentStaff,data).gross / 10000)}<small>만원</small></dd></div>
      <div><dt>남은 휴가</dt><dd>${amount(leave.remainingMinutes / 60)}<small>시간</small></dd></div></dl>
      <div class="ops-actions">${action("my-statement","내 명세서",{icon:"file"})}${action("request","휴가 신청",{variant:"primary",icon:"plane"})}</div>
    </section>`;
  }

  function lessonsFor(staff, entry, lessons) {
    return lessons.filter((lesson) => ownsLesson(staff,lesson) && lesson.day === weekday(entry.date));
  }

  function substituteOptions(data, entry, lessons) {
    const member = person(entry.staffId);
    const coverage = lessonsFor(member, entry, lessons);
    if (!coverage.length) return [];
    return payroll.filter((staff) => staff.id !== member.id && staff !== representative
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

  function balances(data,ctx) {
    return `<section class="ops-balances"><h2>강사별 남은 휴가</h2><ul>${payroll.map((staff) => {
      const leave = leaveFor(staff,data);
      const detail = !leave.applies ? staff.kind : leave.eligible ? `법정 연차 ${duration(leave.statutoryMinutes)}`
        : [weeklyHours(staff,data) && `주 ${weeklyHours(staff,data)}시간`, "법정 연차 대상 아님", leave.academyDays !== null && "학원 휴가"].filter(Boolean).join(" · ");
      const name = nameFor(staff,ctx);
      return `<li>${avatar(name)}<span><strong>${text(name)}${staff === representative ? " (대표자)" : ""}</strong><small>${detail}</small></span>
        <b>${remainingLeave(leave)}</b></li>`;
    }).join("")}</ul></section>`;
  }

  function approval(entry, data, ctx) {
    const staff = person(entry.staffId);
    const name = nameFor(staff,ctx);
    const coverage = lessonsFor(staff, entry, ctx.lessons);
    const choices = substituteOptions(data, entry, ctx.lessons);
    const coverageLabel = coverage.map((lesson) => `${lesson.group} ${lesson.time}`).join(" · ");
    return `<article class="ops-card" data-ops-request="${text(entry.id)}">
      <header class="ops-person">${avatar(name)}<div><h2>${text(name)} 선생님</h2><p>${dateText(entry.date)} · ${units[entry.unit]}${entry.unit === "hour" ? `${entry.hours}시간` : ""} · ${kinds[entry.kind]}</p></div></header>
      <p class="ops-secondary-text">사유: ${text(entry.reason || "미입력")}</p>
      <dl class="ops-request-info"><div><dt>그날 수업</dt><dd>${text(coverageLabel || "예정된 수업 없음")}</dd></div>
      ${coverage.length && choices.length ? `<div><dt><label for="substitute-${text(entry.id)}">대체 강사</label></dt><dd><select id="substitute-${text(entry.id)}">
        ${choices.map((member) => `<option value="${member.id}">${text(nameFor(member,ctx))} 선생님</option>`).join("")}</select></dd></div>` : ""}</dl>
      ${coverage.length ? `<p class="ops-available${choices.length ? "" : " ops-urgent"}">${choices.length === 1
        ? `${text(nameFor(choices[0],ctx))} 선생님은 그 시간 비어 있어요` : choices.length ? "해당 시간에 빈 강사만 표시해요" : "해당 시간에 비어 있는 강사가 없어요"}</p>` : ""}
      <div class="ops-actions">${action("reject","거절",{id:entry.id,variant:"danger"})}${(!coverage.length || choices.length)
        ? action("approve",coverage.length ? "승인하고 대타 배정" : "휴가 승인",{id:entry.id,variant:"primary"}) : ""}</div>
    </article>`;
  }

  function requestsList(entries,ctx) {
    if (!entries.length) return '<p class="ops-empty">등록된 휴가가 없어요.</p>';
    return `<ul class="ops-records">${entries.map((entry) => `<li><div><strong>${text(nameFor(person(entry.staffId),ctx))} · ${dateText(entry.date)}</strong>
      <small>${units[entry.unit]} · ${kinds[entry.kind]}${entry.substitute ? ` · 대타 ${text(nameFor(person(entry.substitute),ctx))}` : ""}</small></div>
      <b>${statuses[entry.status]}</b></li>`).join("")}</ul>`;
  }

  function leave(ctx) {
    const data = read();
    const waiting = pending(data);
    const tabs = [["pending",`승인 대기 ${waiting.length}`],["month","이번 달"],["staff","강사별 휴가"]];
    return `<div class="ops-page" data-staff-screen="leave">${header("강사 휴가·대타")}
      <nav class="ops-segments" aria-label="휴가 보기">${tabs.map(([id,label]) => `<button type="button" aria-pressed="${tab === id}" data-staff-operation="leave-tab" data-staff-id="${id}">${label}</button>`).join("")}</nav>
      ${tab === "pending" ? `${waiting.map((entry) => approval(entry, data, ctx)).join("") || '<p class="ops-empty">승인 대기 중인 휴가가 없어요.</p>'}${balances(data,ctx)}`
        : tab === "month" ? requestsList(data.requests.filter((entry) => entry.date.startsWith("2026-11")),ctx) : balances(data,ctx)}
    </div>`;
  }

  function staffCard(staff, data, ctx) {
    const name = nameFor(staff,ctx);
    const classes = [...new Set(ctx.lessons.filter((lesson) => ownsLesson(staff,lesson)).map((lesson) => lesson.group))];
    const leave = leaveFor(staff,data);
    if (!included(staff,data)) return `<div class="ops-pay-row ops-representative">
      ${avatar(name)}<div><strong>${text(name)}</strong><span>대표자 · 급여 계산 제외</span><span>휴가 ${remainingLeave(leave)}</span></div></div>`;
    const forecast = monthlyMinutes(staff,data);
    const pay = payFor(staff,data);
    const hiringForecast = staff.recruitment ? window.DemoHiring.forecasts(recruitmentTerms(staff,data.hourlyRates[staff.id])) : null;
    return `<button type="button" class="ops-pay-row" data-staff-operation="open-staff" data-staff-id="${staff.id}">
      ${avatar(name)}<div><strong>${text(name)}</strong>${wageBadge(pay)}<small>${text([staff.kind, ...classes].join(" · "))}</small>
      ${forecast && !hiringForecast ? `<span>11월 16일까지 ${duration(recordedMinutes(staff,data))} · 월 예상 ${duration(forecast)}</span>` : ""}
      ${hiringForecast ? `<span>첫 달(${Number(hiringForecast.first.slice(5))}월) ${won(hiringForecast.firstGross)} · 다음 달(${Number(hiringForecast.next.slice(5))}월) ${won(hiringForecast.nextGross)}</span>` : ""}
      <span>${won(pay.gross)} · 휴가 ${remainingLeave(leave)}</span></div>${icon("arrow")}</button>`;
  }

  const wageBadge = (pay) => pay.minimumWageWarning ? '<b class="ops-wage-badge">최저임금 미달</b>' : "";

  function staffProfile(staff, data) {
    const input = payInput(staff,data);
    return `<dl class="ops-request-info ops-staff-profile">
      <div><dt>고용형태</dt><dd>${staff.kind}</dd></div>
      <div><dt>주 소정근로시간</dt><dd>${amount(weeklyHours(staff,data))}시간</dd></div>
      <div><dt>입사일</dt><dd>${staff.hireDate ?? "—"}</dd></div>
      ${input.hourlyRate != null ? `<div><dt>시급</dt><dd>${won(input.hourlyRate)}</dd></div>` : ""}</dl>`;
  }

  function workRecord(staff, data) {
    const input = payInput(staff,data);
    const leave = leaveFor(staff,data);
    return `<section class="ops-card"><h2>11월 근무 기록</h2><dl class="ops-request-info">
      <div><dt>주 소정근로시간</dt><dd>${duration(input.scheduledWeeklyMinutes)}</dd></div>
      <div><dt>11월 16일까지 실근무</dt><dd>${duration(recordedMinutes(staff,data))}</dd></div>
      <div><dt>이번 달 예상 근무</dt><dd>${duration(input.workMinutes ?? 0)}</dd></div>
      <div><dt>주휴</dt><dd>${(input.weeks?.length ?? 0) ? `${duration(Math.round(payFor(staff,data).weeklyHolidayMinutes / input.weeks.length))} / 주` : "해당 없음"}</dd></div>
      <div><dt>법정 연차</dt><dd>${leave.eligible ? duration(leave.statutoryMinutes) : leave.applies ? "대상 아님" : "해당 없음"}</dd></div>
      ${leave.academyDays !== null ? `<div><dt>남은 학원 휴가</dt><dd>${days.format(leave.academyDays)}일</dd></div>` : ""}
      <div><dt>근무 확인</dt><dd>${staff === currentStaff && data.approvedTime ? "승인 완료" : "승인 대기"}</dd></div></dl></section>`;
  }

  function pay(ctx) {
    const data = read();
    const selected = person(selectedStaff);
    const staff = selected && included(selected,data) ? selected : null;
    const { fivePlus, company } = data.settings;
    return `<div class="ops-page" data-staff-screen="pay">${header("근무·급여")}
      <div class="ops-pay-criteria"><span>상시 ${fivePlus ? "5인 이상" : "5인 미만"} · ${company === "corporation" ? "법인" : "개인사업자"}</span>${pill("settings","학원 설정")}</div>
      <div class="ops-pay-summary"><span>11월 예상 인건비</span><strong>${won(money(data))}</strong><small>${text(estimateLabel)}</small></div>
      ${staff ? `<section class="ops-card"><div class="ops-person">${avatar(nameFor(staff,ctx))}<div><h2>${text(nameFor(staff,ctx))}</h2>${wageBadge(payFor(staff,data))}<p>${staff.kind}</p></div></div>
        ${staffProfile(staff,data)}
        <div class="ops-actions">${action("close-staff","강사 목록")}
          ${payInput(staff,data).hourlyRate == null ? "" : action("edit-wage","시급 편집",{id:staff.id})}
          ${action("staff-statement","명세서",{id:staff.id,variant:"primary"})}</div></section>
        ${workRecord(staff,data)}
        ${staff === currentStaff && !data.approvedTime ? action("approve-time","근무 승인") : ""}${statementMarkup(staff,data,ctx)}`
        : `<div class="ops-pay-list">${payrollStaff().map((member) => staffCard(member,data,ctx)).join("")}</div>
          ${data.finalized ? '<p class="ops-empty">가상 11월 급여를 마감했어요.</p>' : action("finalize","11월 가상 급여 마감",{variant:"primary"})}`}
    </div>`;
  }

  function myWork(ctx) {
    const data = read();
    const label = data.attendance === "idle" ? "출근 체험" : data.attendance === "in" ? "퇴근 체험" : "오늘 퇴근 완료";
    return `<div class="ops-page" data-staff-screen="my-work">${header("내 근무·휴가")}
      <nav class="ops-segments" aria-label="내 근무·휴가 보기">${[["work","내 근무"],["leave","내 휴가"],["statement","내 명세서"]].map(([id,name]) =>
      `<button type="button" aria-pressed="${workTab === id}" data-staff-operation="work-tab" data-staff-id="${id}">${name}</button>`).join("")}</nav>
      ${workTab === "work" ? `${workRecord(currentStaff,data)}
        ${data.attendance === "out" ? `<p>${label}</p>` : action("attend",label,{variant:"primary"})}`
        : workTab === "leave" ? `<div class="ops-card"><h2>남은 휴가 ${duration(leaveFor(currentStaff,data).remainingMinutes)}</h2>${requestsList(data.requests.filter((entry) => entry.staffId === currentStaff.id),ctx)}
          ${action("request","휴가 신청",{variant:"primary",icon:"plane"})}</div>` : statementMarkup(currentStaff,data,ctx)}
    </div>`;
  }

  function statementMarkup(staff, data, ctx) {
    const input = payInput(staff,data);
    const pay = payFor(staff,data);
    const freelance = input.employment === "freelancer";
    const payments = input.tuitionTransactions ?? [];
    const refunds = payments.filter(({ amount }) => amount < 0);
    const rows = (items) => items.map(({key,label,amount:lineAmount,formula}) => {
      const basic = { hourly:"기본급 (시급)", fixed:"기본급 (월급)" }[key];
      return `<div><dt>${text(basic ?? label)}${formula ? `<small>${text(formula)}</small>` : ""}</dt><dd>${estimated(lineAmount)}</dd></div>`;
    }).join("");
    return `<section class="ops-card ops-statement" aria-label="${text(nameFor(staff,ctx))} 급여 명세서"><h2>11월 예상 급여 · 가상 명세서</h2>
      <p>${text(estimateLabel)}</p>
      ${payments.length ? `<p>수납 ${won(payments.filter(({ amount }) => amount > 0).reduce((sum, entry) => sum + entry.amount,0))}
        · 환불 ${refunds.length}건 (${won(refunds.reduce((sum, entry) => sum + entry.amount,0))})</p>` : ""}
      <h3>지급 항목</h3><dl class="ops-request-info">${rows(pay.earnings)}<div><dt>지급 합계</dt><dd>${won(pay.gross)}</dd></div></dl>
      <h3>공제 항목</h3><dl class="ops-request-info">${rows(pay.deductions)}<div><dt>공제 합계${freelance ? " (3.3%)" : ""}</dt><dd>${estimated(pay.deductionTotal)}</dd></div></dl>
      <dl class="ops-request-info"><div><dt>실수령 예정액</dt><dd>${estimated(pay.net)}</dd></div>
      ${pay.minimumHourlyRate == null ? "" : `<div><dt>최저임금</dt><dd>${won(pay.minimumHourlyRate)} / 시간</dd></div>
        <div><dt>비교 시급</dt><dd>${estimated(pay.effectiveHourlyRate)} / 시간</dd></div>`}</dl>
      ${pay.minimumWageWarning ? '<p class="ops-low-wage" role="status">최저임금보다 낮아요.</p>' : ""}
    </section>`;
  }

  function editWage(staff, opener, ctx) {
    const data = read();
    const input = payInput(staff,data);
    if (input.hourlyRate == null) return;
    const { minimumHourlyRate } = payFor(staff,data);
    const options = { confirmLabel:"시급 저장" };
    let pendingRate;
    const warns = (rate) => Number.isSafeInteger(rate) && rate >= 1 && rate <= 1000000
      && calculator.calculatePayroll(payInput(staff,read(),rate)).minimumWageWarning;
    ctx.openSheet("시급 편집", `<label>시급 (원)<input type="number" inputmode="numeric" name="hourly-rate"
      value="${input.hourlyRate}" required min="1" max="1000000" step="1"></label>
      <p>2026년 최저임금 ${won(minimumHourlyRate)} / 시간</p><p data-ops-wage-warning class="ops-low-wage" role="status" hidden>최저임금보다 낮아요.</p>`,
    (fields) => {
      const value = Number(fields.get("hourly-rate"));
      if (!Number.isSafeInteger(value) || value < 1 || value > 1000000) return "시급을 1원 이상 입력해 주세요.";
      if (warns(value) && pendingRate !== value) {
        pendingRate = value;
        warning.hidden = true;
        options.confirmLabel = "그대로 저장";
        return "최저임금보다 낮아요. 그래도 저장할까요?";
      }
      const current = read();
      current.hourlyRates[staff.id] = value;
      write(current,ctx);
    }, opener, options);
    const sheet = document.getElementById("dialog");
    const wage = sheet.querySelector('[name="hourly-rate"]');
    const warning = sheet.querySelector("[data-ops-wage-warning]");
    const confirm = sheet.querySelector("[data-confirm]");
    const alert = sheet.querySelector("[role=alert]");
    warning.hidden = !warns(Number(wage.value));
    wage.addEventListener("input",() => {
      pendingRate = undefined;
      options.confirmLabel = "시급 저장";
      confirm.textContent = options.confirmLabel;
      alert.hidden = true;
      warning.hidden = !warns(Number(wage.value));
    });
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
      const leave = leaveFor(currentStaff,data);
      if (!leave.eligible) return "학원 설정과 법정 연차 대상 여부를 확인해 주세요.";
      if (leaveCharge(currentStaff,{unit,hours},data) > leave.remainingMinutes) return "남은 휴가를 확인해 주세요.";
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
    if (command === "headcount") {
      data.settings.fivePlus = !data.settings.fivePlus;
      write(data,ctx,"학원 설정을 저장했어요.");
    } else if (command === "company") {
      ctx.openSheet("사업 형태", `<label>사업 형태<select name="company">
        <option value="individual"${data.settings.company === "individual" ? " selected" : ""}>개인사업자</option>
        <option value="corporation"${data.settings.company === "corporation" ? " selected" : ""}>법인</option></select></label>`,
      (form) => {
        const company = form.get("company");
        if (!["individual","corporation"].includes(company)) return "사업 형태를 선택해 주세요.";
        const current = read();
        current.settings.company = company;
        if (company === "individual") current.settings.includeRepresentative = false;
        write(current,ctx);
      }, control);
    } else if (command === "representative" && data.settings.company === "corporation") {
      data.settings.includeRepresentative = !data.settings.includeRepresentative;
      write(data,ctx,"학원 설정을 저장했어요.");
    } else if (command === "leave-tab" && ["pending","month","staff"].includes(id)) {
      tab = id;
      ctx.rerender();
    } else if ((command === "open-staff" && person(id) && included(person(id),data)) || command === "close-staff") {
      selectedStaff = command === "open-staff" ? id : undefined;
      ctx.rerender();
    } else if (command === "staff-statement" && person(id) && included(person(id),data)) {
      ctx.openSheet("가상 명세서", statementMarkup(person(id),data,ctx), undefined, control, {closeOnly:true});
      const sheet = document.querySelector("#dialog[open]");
      const heading = sheet?.querySelector("#dialog-title");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({preventScroll:true});
        sheet.scrollTop = 0;
      }
    } else if (command === "edit-wage" && person(id) && included(person(id),data)) {
      editWage(person(id),control,ctx);
    } else if (command === "approve-time" && selectedStaff === currentStaff.id) {
      data.approvedTime = true;
      write(data,ctx,"가상 근무 기록을 승인했어요.");
    } else if (command === "finalize") {
      ctx.openSheet("11월 가상 급여 마감", `<p>예상 급여 합계 ${won(money(data))}</p><p>최종 신고는 세무사 확인</p>`, () => {
        const current = read();
        current.finalized = true;
        write(current,ctx);
      }, control,{confirmLabel:"가상 마감하기"});
    } else if (command === "approve" || command === "reject") {
      const entry = data.requests.find((item) => item.id === id && item.status === "pending");
      if (!entry) return;
      const member = person(entry.staffId);
      const leave = leaveFor(member,data);
      const remaining = entry.kind === "academy" ? leave.academyMinutes : leave.remainingMinutes;
      if (command === "approve" && (!leave.applies || (entry.kind === "annual" && !leave.eligible) || leaveCharge(member,entry,data) > remaining)) {
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
      const leave = leaves.find((entry) => person(entry.staffId) && ownsLesson(person(entry.staffId),lesson));
      if (leave) return leave.substitute === currentStaff.id ? [{...lesson, substitute:true}] : [];
      return ownsLesson(currentStaff,lesson) ? [{...lesson, substitute:false}] : [];
    }).sort((a,b) => a.time.localeCompare(b.time));
  }

  window.DemoStaffOperations = Object.freeze({ operations, homeAlerts, settings, schoolTile, teacherHome, leave, pay, myWork, handle, teachingToday, reset,
    ownsStorage:(key) => key === storageKey });
})();
