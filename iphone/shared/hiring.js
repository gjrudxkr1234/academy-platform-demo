/* Shared, synthetic records for the fixed owner and teacher demos. */
(() => {
  "use strict";

  const storageKey = "gradient-demo-hiring-v1";
  const calculator = window.AcademyWorkforceCalculator;
  const won = value => `${value.toLocaleString("ko-KR")}원`;
  const applicantName = "윤가온";
  const subjects = ["수학", "영어", "과학"];
  const payKinds = { hourly:"시급", fixed:"월급", session:"회당", students:"학생당", commission:"수납 비율" };
  const dayLabels = { 1:"월", 2:"화", 3:"수", 4:"목", 5:"금", 6:"토", 7:"일" };
  const weekdays = [1, 2, 3, 4, 5];
  const statuses = { applied:"지원 접수", interview:"면접 제안", accepted:"면접 수락",
    contract:"근로계약서 초안 동의 대기", invited:"초대 수락 대기", hired:"채용 완료" };
  const demoDate = "2026-11-16";
  const defaultStart = "2026-11-20";
  const dayMs = 86_400_000;
  const classification = "회당·학생당·비율제 계약이어도 실제 근무 방식에 따라 근로자로 인정될 수 있어요. 근로자라면 최저임금 등 근로기준이 적용돼요.";
  const initial = () => ({ verified:false, publicEnabled:false, listings:[], applications:[] });
  const samples = [
    { id:"sample-math", title:"중등 수학 강사", subject:"수학", location:"가상학원 · 경기", time:"16:00–19:00", kind:"hourly", rate:25000, quantity:6, startsOn:defaultStart, workdays:[1,3] },
    { id:"sample-english", title:"초등 영어 강사", subject:"영어", location:"가상학원 · 서울", time:"화·목 15:00–18:00", kind:"session", rate:70000, quantity:8, startsOn:defaultStart, workdays:[2,4] },
  ];
  const text = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;",
  })[character]);
  const action = (label, type, id = "", css = "", disabled = false) =>
    `<button type="button" class="hiring-button ${css}" data-hiring-action="${type}" data-hiring-id="${text(id)}"${disabled ? " disabled" : ""}>${label}</button>`;
  const option = (value, label, selected) => `<option value="${text(value)}"${value === selected ? " selected" : ""}>${label}</option>`;
  const employee = kind => kind === "hourly" || kind === "fixed";

  let memory;
  let subjectFilter = "";
  let typeFilter = "";

  const dateValue = value => Date.parse(`${value}T00:00:00Z`);
  const dayKey = value => new Date(value).toISOString().slice(0,10);
  const weekday = value => (new Date(value).getUTCDay() + 6) % 7 + 1;
  function validStart(value) {
    const time = dateValue(value);
    return /^202[67]-\d{2}-\d{2}$/.test(value) && Number.isFinite(time) && dayKey(time) === value;
  }

  function normalize(data) {
    const applications = data.applications.map(application => application.state === "hired" && !application.consents?.teacher
      ? { ...application, state:"contract", consents:{ owner:false, teacher:false } } : application);
    const listings = data.listings.map(entry => {
      const listing = { startsOn:defaultStart, workdays:weekdays, ...entry };
      if (listing.state === "filled" && !applications.some(application => application.listingId === listing.id && application.state === "hired")) {
        listing.state = "posted";
      }
      if (listing.state === "posted" && publishingIssue(listing)) listing.state = "draft";
      return listing;
    });
    return { ...data, listings, applications };
  }

  function read() {
    try {
      const value = localStorage.getItem(storageKey);
      if (value) return normalize(JSON.parse(value));
    } catch { /* The active role can continue using memory. */ }
    return memory ??= initial();
  }

  function store(data, context) {
    memory = data;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* Storage may be unavailable in private browsing. */ }
    context.rerender();
  }

  function reset() {
    memory = undefined;
    subjectFilter = "";
    typeFilter = "";
    try { localStorage.removeItem(storageKey); } catch { /* Cleared in memory. */ }
  }

  function monthPeriod(month, startsOn) {
    const first = dateValue(`${month}-01`);
    const boundary = new Date(first);
    boundary.setUTCMonth(boundary.getUTCMonth() + 1);
    const end = boundary.getTime();
    const start = dateValue(startsOn);
    const days = (end - first) / dayMs;
    const activeDays = Math.max(0, (end - Math.max(start, first)) / dayMs);
    return { first, end, start, days, activeDays, fraction:activeDays / days, nextMonth:dayKey(end).slice(0,7) };
  }

  function monthlyPaidMinutes(scheduledWeeklyMinutes) {
    const holiday = calculator.weeklyPaidHolidayMinutes({ scheduledMinutes:scheduledWeeklyMinutes, allScheduledDaysWorked:true });
    return Math.round((scheduledWeeklyMinutes + holiday) * 365 / 7 / 12 / 60) * 60;
  }

  function payInput(listing, month) {
    const { kind, rate, quantity, startsOn, workdays } = listing;
    const { first, end, start, days, activeDays, fraction } = monthPeriod(month, startsOn);
    const common = { month, employment:"freelancer", scheduledWeeklyMinutes:0 };
    if (!employee(kind)) {
      if (kind === "session") return { ...common, perSessionRate:rate, sessionCount:Math.round(quantity * fraction) };
      if (kind === "students") return { ...common, perStudentRate:rate,
        studentAssignments:Array.from({ length:quantity }, (_, index) => ({
          studentId:`synthetic-${index}`, daysAssigned:activeDays, shareBasisPoints:10000,
        })) };
      return { ...common, tuitionCommissionBasisPoints:rate * 100,
        tuitionTransactions:[{ amount:Math.round(quantity * fraction), shareBasisPoints:10000 }] };
    }
    const scheduledWeeklyMinutes = quantity * 60;
    const perDay = Math.floor(scheduledWeeklyMinutes / workdays.length);
    const extraMinutes = scheduledWeeklyMinutes % workdays.length;
    let workMinutes = 0;
    for (let day = Math.max(first, start); day < end; day += dayMs) {
      const index = workdays.indexOf(weekday(day));
      if (index !== -1) workMinutes += perDay + Number(index < extraMinutes);
    }
    const weeks = [];
    const firstSunday = first + (7 - weekday(first)) * dayMs;
    for (let sunday = firstSunday; sunday < end; sunday += 7 * dayMs) {
      weeks.push({ scheduledMinutes:scheduledWeeklyMinutes,
        allScheduledDaysWorked:workdays.every(day => sunday - (7 - day) * dayMs >= start) });
    }
    const input = { ...common, employment:kind === "fixed" ? "salaried" : "hourly", scheduledWeeklyMinutes, workMinutes, weeks };
    if (kind === "hourly") return { ...input, hourlyRate:rate };
    const paidMinutes = monthlyPaidMinutes(scheduledWeeklyMinutes);
    return { ...input, fixedMonthlyPay:Math.round(rate * activeDays / days),
      minimumWageIncludablePay:rate, minimumWagePaidMinutes:paidMinutes, weeklyHolidayIncludedInFixed:true };
  }

  function publishingIssue(listing) {
    if (!employee(listing.kind)) return "";
    const month = (listing.startsOn > demoDate ? listing.startsOn : demoDate).slice(0,7);
    const { minimumHourlyRate, effectiveHourlyRate, minimumWageWarning } = calculator.calculatePayroll(payInput(listing, month));
    if (minimumHourlyRate == null || effectiveHourlyRate == null) return "최저임금 기준을 확인할 수 없어 게시할 수 없어요.";
    if (!minimumWageWarning) return "";
    const hours = listing.kind === "fixed" ? ` · 월 유급 ${monthlyPaidMinutes(listing.quantity * 60) / 60}시간(주휴 포함)` : "";
    return `최저임금 미달 · 비교 시급 ${won(Math.floor(effectiveHourlyRate))} · 기준 ${won(minimumHourlyRate)}${hours}. 게시할 수 없어요.`;
  }

  const estimate = (listing, month) => calculator.calculatePayroll(payInput(listing, month));
  const rateText = listing => listing.kind === "commission" ? `${listing.rate}%` : won(listing.rate);
  const basisText = listing => ({
    hourly:`주 ${listing.quantity}시간 · 시작일부터 근무시간·주휴 반영`,
    fixed:`주 ${listing.quantity}시간 · 월급 × 재직일수 ÷ 월 일수`,
    session:`월 ${listing.quantity}회 · 기간에 따른 예상 횟수 반영`,
    students:`월 ${listing.quantity}명 · 기간 반영`,
    commission:`월 순수납 ${won(listing.quantity)} · 기간 반영`,
  })[listing.kind];
  const monthLabel = month => `${Number(month.slice(5))}월`;
  function forecasts(listing) {
    const first = listing.startsOn.slice(0,7);
    const { nextMonth:next } = monthPeriod(first, listing.startsOn);
    return { first, next, firstGross:estimate(listing, first).gross, nextGross:estimate(listing, next).gross };
  }
  function paySummary(listing) {
    const { first, next, firstGross, nextGross } = forecasts(listing);
    return `<dl class="hiring-pay"><div><dt>첫 달 예상 · ${monthLabel(first)}</dt><dd data-hiring-gross="${firstGross}">${won(firstGross)}</dd></div>
      <div><dt>다음 달 예상 · ${monthLabel(next)}</dt><dd data-hiring-next-gross="${nextGross}">${won(nextGross)}</dd></div></dl>
      <p class="hiring-note">${payKinds[listing.kind]} ${rateText(listing)} · ${basisText(listing)} · 세전 예시${listing.kind === "hourly" ? " · 공휴일·결근 미반영" : ""}</p>
      ${employee(listing.kind) ? "" : `<p class="hiring-classification"><strong>근로자성 안내</strong> ${classification}</p>`}`;
  }

  const metrics = () => read().listings.filter(listing => listing.state === "posted").length;

  function card(listing, content) {
    const days = employee(listing.kind) ? listing.workdays.map(day => dayLabels[day]).join("·") + " " : "";
    return `<section class="hiring-card"><header><small>${text(listing.subject)} · ${text(listing.location)}</small><h2>${text(listing.title)}</h2>
      <p>${days}${text(listing.time)} · 시작 ${text(listing.startsOn)}</p></header>${paySummary(listing)}${content}</section>`;
  }

  function documentTitle(listing) {
    return employee(listing.kind) ? "근로계약서 초안" : "가상 용역계약 초안";
  }

  function agreementStatus(application, listing) {
    if (!application.consents) return "";
    return `<p class="hiring-note">${documentTitle(listing)} · 원장 ${application.consents.owner ? "동의 완료" : "동의 대기"} · 강사 ${application.consents.teacher ? "동의 완료" : "동의 대기"}</p>`;
  }

  function ownerAppActions(application, listing) {
    if (application.state === "applied") return action("면접 제안", "interview", listing.id);
    if (application.state === "accepted") return action("채용 확정", "hire", listing.id, "hiring-primary");
    if (application.state !== "contract") return "";
    if (!application.consents.owner) return action(`${documentTitle(listing)} 확인`, "agree", listing.id, "hiring-primary");
    return action("체험 초대 보내기", "invite", listing.id, "hiring-primary", !application.consents.teacher);
  }

  function owner() {
    const data = read();
    return `<div class="hiring-page" data-hiring-screen="owner"><header class="hiring-heading"><h1>강사 채용</h1>
      ${action("공고 작성", "create", "", "hiring-primary")}</header>
      <section class="hiring-card hiring-settings"><h2>게시 설정</h2>
        <div><span><strong>학원 확인</strong><small>${data.verified ? "가상 학원 확인 완료" : "공고 게시 전 가상 학원 확인이 필요해요."}</small></span>
        ${data.verified ? "" : action("학원 확인", "verify")}</div>
        <div><span><strong>공개 공고</strong><small>켜면 공개 게시를 체험할 수 있어요.</small></span>
        <button class="hiring-button" type="button" role="switch" aria-checked="${data.publicEnabled}" aria-label="공개 공고" data-hiring-action="public">${data.publicEnabled ? "켜짐" : "꺼짐"}</button></div>
      </section>
      ${data.listings.length ? data.listings.map(listing => {
        const listingApps = data.applications.filter(application => application.listingId === listing.id);
        const status = { draft:"작성 중", posted:"게시 중", filled:"채용 완료" }[listing.state];
        const issue = publishingIssue(listing);
        return card(listing, `${issue ? `<p class="hiring-wage-warning" role="status">${issue}</p>` : ""}
          <div class="hiring-list-footer"><span class="hiring-chip">${status}</span>
          <div class="hiring-actions">${listing.state === "draft" ? action("수정", "edit", listing.id) + action("게시", "post", listing.id, "hiring-primary", Boolean(issue)) : ""}</div></div>
          ${listingApps.length ? `<section class="hiring-apps"><h3>지원자</h3>${listingApps.map(application => `<div class="hiring-app"><div>
            <strong>${applicantName}</strong><small>가상 지원자 · ${statuses[application.state]}${application.interview ? ` · ${text(application.interview)}` : ""}</small></div>
            <div class="hiring-actions">${ownerAppActions(application, listing)}</div></div>${agreementStatus(application, listing)}`).join("")}</section>` : ""}`);
      }).join("") : '<p class="hiring-empty">작성한 공고가 없어요.</p>'}</div>`;
  }

  function visibleToApplicant(listing, data) {
    if (publishingIssue(listing)) return false;
    return listing.state === "posted" && data.publicEnabled ||
      data.applications.some(application => application.listingId === listing.id);
  }

  function applicantActions(application, listing) {
    if (!application) return action("지원하기", "apply", listing.id, "hiring-primary");
    if (application.state === "interview") return action("면접 수락", "accept", listing.id, "hiring-primary");
    if (application.state === "contract" && !application.consents.teacher) {
      return action(`${documentTitle(listing)} 확인`, "agree", listing.id, "hiring-primary");
    }
    return application.state === "invited" ? action("초대 수락", "join", listing.id, "hiring-primary") : "";
  }

  function teacher() {
    const data = read();
    const visible = [...data.listings.filter(listing => visibleToApplicant(listing, data)), ...samples];
    const filtered = visible.filter(listing => (!subjectFilter || listing.subject === subjectFilter) && (!typeFilter || listing.kind === typeFilter));
    return `<div class="hiring-page" data-hiring-screen="teacher"><header class="hiring-heading"><h1>커리어</h1></header>
      <p class="hiring-note">가상 지원자 <strong>${applicantName}</strong>의 커리어 체험</p>
      <div class="hiring-filters"><label>과목<select data-hiring-filter="subject">${option("", "전체 과목", subjectFilter)}${subjects.map(subject => option(subject, subject, subjectFilter)).join("")}</select></label>
      <label>보상 방식<select data-hiring-filter="pay">${option("", "전체 보상", typeFilter)}${Object.entries(payKinds).map(([kind, name]) => option(kind, name, typeFilter)).join("")}</select></label></div>
      ${filtered.length ? filtered.map(listing => {
        const application = data.applications.find(entry => entry.listingId === listing.id);
        return card(listing, `<div class="hiring-list-footer">${application ? `<span class="hiring-chip">${statuses[application.state]}</span>` : ""}
        <div class="hiring-actions">${applicantActions(application, listing)}</div></div>
        ${application?.interview ? `<p class="hiring-note">면접 일정 · ${text(application.interview)}</p>` : ""}
        ${application ? agreementStatus(application, listing) : ""}`);
      }).join("") : '<p class="hiring-empty">선택한 조건의 공고가 없어요.</p>'}</div>`;
  }

  const defaultListing = { title:"", subject:"수학", location:"", time:"", kind:"hourly", rate:20000, quantity:20,
    startsOn:defaultStart, workdays:weekdays };

  function edit(listing, opener, context) {
    const entry = listing ?? defaultListing;
    const input = (label, name) => `<label>${label}<input name="${name}" value="${text(entry[name])}" maxlength="80" required></label>`;
    context.openSheet(listing ? "공고 수정" : "공고 작성", `${input("공고 제목", "title")}
      <label>과목<select name="subject">${subjects.map(subject => option(subject, subject, entry.subject)).join("")}</select></label>
      ${input("지역·근무 장소", "location")}${input("근무 시간", "time")}
      <label>근무 시작일<input name="startsOn" type="date" min="2026-01-01" max="2027-12-31" value="${entry.startsOn}" required></label>
      <fieldset class="hiring-days"><legend>근무 요일</legend>${Object.entries(dayLabels).map(([day, label]) =>
        `<label><input name="workday" type="checkbox" value="${day}"${entry.workdays.includes(Number(day)) ? " checked" : ""}>${label}</label>`).join("")}</fieldset>
      <label>보상 방식<select name="kind">${Object.entries(payKinds).map(([kind, name]) => option(kind, name, entry.kind)).join("")}</select></label>
      <label>보상 금액 또는 비율<input name="rate" value="${entry.rate}" type="number" min="1" max="100000000" required></label>
      <label>계산 기준 수량<input name="quantity" value="${entry.quantity}" type="number" min="1" max="100000000" required></label>
      <p class="hiring-note">시급·월급은 주 소정근로시간, 회당은 월 횟수, 학생당은 월 인원, 수납 비율은 월 순수납액(원)을 입력해 주세요.</p>
      <p class="hiring-wage-warning" data-hiring-wage-warning role="status" hidden></p>
      <p class="hiring-classification" data-hiring-classification hidden><strong>근로자성 안내</strong> ${classification}</p>`,
    form => {
      const fields = Object.fromEntries(["title", "subject", "location", "time", "kind", "startsOn"].map(key => [key, String(form.get(key) ?? "").trim()]));
      const rate = Number(form.get("rate"));
      const quantity = Number(form.get("quantity"));
      const workdays = form.getAll("workday").map(Number).filter(day => Object.hasOwn(dayLabels, day));
      const maxQuantity = { hourly:168, fixed:168, session:124, students:300, commission:100000000 };
      if (!fields.title || !fields.location || !fields.time || !subjects.includes(fields.subject) || !Object.hasOwn(payKinds, fields.kind)) {
        return "제목, 과목, 근무 장소와 시간을 확인해 주세요.";
      }
      if (!validStart(fields.startsOn) || employee(fields.kind) && !workdays.length) return "근무 시작일과 근무 요일을 확인해 주세요.";
      if (!Number.isInteger(rate) || rate < 1 || rate > (fields.kind === "commission" ? 100 : 10000000) ||
          !Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity[fields.kind]) return "보상 금액과 계산 기준 수량을 확인해 주세요.";
      const data = read();
      const value = { ...fields, rate, quantity, workdays, id:listing?.id ?? crypto.randomUUID(), state:"draft" };
      data.listings = listing ? data.listings.map(item => item.id === listing.id && item.state === "draft" ? value : item) : [value, ...data.listings];
      store(data, context);
    }, opener, { confirmLabel:"공고 저장" });
    const sheet = document.querySelector("#dialog[open]");
    const warning = sheet?.querySelector("[data-hiring-wage-warning]");
    const classificationNote = sheet?.querySelector("[data-hiring-classification]");
    const form = sheet?.querySelector("form");
    if (!form || !warning || !classificationNote) return;
    function updateWarning() {
      const details = new FormData(form);
      const kind = details.get("kind");
      const rate = Number(details.get("rate"));
      const quantity = Number(details.get("quantity"));
      const startsOn = String(details.get("startsOn"));
      const workdays = details.getAll("workday").map(Number);
      const issue = employee(kind) && rate > 0 && quantity > 0 && workdays.length && validStart(startsOn)
        ? publishingIssue({ kind, rate, quantity, startsOn, workdays }) : "";
      warning.textContent = issue;
      warning.hidden = !issue;
      classificationNote.hidden = employee(kind);
    }
    form.addEventListener("input", updateWarning);
    form.addEventListener("change", updateWarning);
    updateWarning();
  }

  function confirmHire(listing, opener, context) {
    context.openSheet("채용 확정", `<p>가상 지원자 ${applicantName}의 ${documentTitle(listing)}을 준비해요.</p>
      <p>원장과 강사가 동의한 후 체험 초대를 수락하면 근무·급여 강사 목록에 반영돼요.</p>${paySummary(listing)}`, () => {
      const data = read();
      const application = data.applications.find(entry => entry.listingId === listing.id && entry.state === "accepted");
      if (!application || data.listings.find(entry => entry.id === listing.id)?.state !== "posted") return "이미 지원 상태가 바뀌었어요.";
      if (data.applications.some(entry => ["contract", "invited", "hired"].includes(entry.state))) return "이미 이 가상 지원자의 채용 절차를 진행했어요.";
      application.state = "contract";
      application.consents = { owner:false, teacher:false };
      store(data, context);
    }, opener, { confirmLabel:"채용 확정" });
  }

  function agree(listing, opener, context) {
    const who = context.role === "owner" ? "원장" : "강사";
    context.openSheet(documentTitle(listing), `<p>${text(listing.title)} · 가상 지원자 ${applicantName}</p>
      <p>근무 시작일 ${text(listing.startsOn)} · ${text(listing.time)}</p>${paySummary(listing)}
      <label><input name="agreed" type="checkbox"> ${who}가 계약서 초안을 확인했어요.</label>`, form => {
      if (!form.has("agreed")) return "계약서 초안을 확인해 주세요.";
      const data = read();
      const application = data.applications.find(entry => entry.listingId === listing.id && entry.state === "contract");
      if (!application) return "이미 지원 상태가 바뀌었어요.";
      application.consents[context.role] = true;
      store(data, context);
    }, opener, { confirmLabel:`${who} 동의` });
  }

  function handle(control, context) {
    const { hiringAction:type, hiringId:id } = control.dataset;
    const data = read();
    const listing = data.listings.find(entry => entry.id === id);
    const application = data.applications.find(entry => entry.listingId === id);
    if (context.role === "owner") {
      if (type === "create" || type === "edit" && listing?.state === "draft") return edit(listing, control, context);
      if (type === "verify" && !data.verified) return context.openSheet("학원 확인", '<p>가상 학원 이름과 운영자 정보의 일치를 확인합니다.</p><label><input name="verified" type="checkbox"> 가상 학원 운영자임을 확인했어요.</label>', form => {
        if (!form.has("verified")) return "가상 학원 운영 여부를 확인해 주세요.";
        store({ ...read(), verified:true }, context);
      }, control, { confirmLabel:"가상 확인 완료" });
      if (type === "public") return store({ ...data, publicEnabled:!data.publicEnabled }, context);
      if (type === "post" && listing?.state === "draft") {
        const issue = publishingIssue(listing);
        if (issue) return context.announce(issue);
        if (!data.verified) return context.announce("공고 게시 전에 학원 확인을 완료해 주세요.");
        if (!data.publicEnabled) return context.announce("게시 설정에서 공개 공고를 켜 주세요.");
        listing.state = "posted";
        return store(data, context);
      }
      if (type === "interview" && application?.state === "applied" && listing?.state === "posted") {
        return context.openSheet("면접 제안", '<label>면접 일정<input name="interview" type="datetime-local" required></label>', form => {
          const interview = form.get("interview");
          if (typeof interview !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(interview)) return "면접 일정을 입력해 주세요.";
          const latest = read();
          const current = latest.applications.find(entry => entry.listingId === id && entry.state === "applied");
          if (!current) return "이미 지원 상태가 바뀌었어요.";
          Object.assign(current, { state:"interview", interview:interview.replace("T", " ") });
          store(latest, context);
        }, control, { confirmLabel:"면접 제안" });
      }
      if (type === "hire" && application?.state === "accepted" && listing?.state === "posted") return confirmHire(listing, control, context);
      if (type === "agree" && application?.state === "contract" && listing) return agree(listing, control, context);
      if (type === "invite" && application?.state === "contract" && application.consents.owner && application.consents.teacher && listing?.state === "posted") {
        application.state = "invited";
        return store(data, context);
      }
      return;
    }
    if (context.role !== "teacher") return;
    if (type === "apply" && !application && (listing?.state === "posted" && visibleToApplicant(listing, data) || samples.some(entry => entry.id === id))) {
      return context.openSheet("공고 지원", `<p>별도 가상 지원자 ${applicantName}으로 이 공고에 지원합니다.</p>`, () => {
        const latest = read();
        if (latest.applications.some(entry => entry.listingId === id)) return "이미 지원한 공고예요.";
        const current = latest.listings.find(entry => entry.id === id);
        if (current && (current.state !== "posted" || !visibleToApplicant(current, latest))) return "현재 게시 중인 공고만 지원할 수 있어요.";
        latest.applications.push({ listingId:id, state:"applied" });
        store(latest, context);
      }, control, { confirmLabel:"가상 지원" });
    }
    if (type === "accept" && application?.state === "interview") {
      application.state = "accepted";
      return store(data, context);
    }
    if (type === "agree" && application?.state === "contract" && listing) return agree(listing, control, context);
    if (type === "join" && application?.state === "invited" && listing?.state === "posted") {
      return context.openSheet("체험 초대 수락", `<p>${applicantName}이 초대를 수락하면 근무·급여 강사 목록에 추가돼요.</p>`, () => {
        const latest = read();
        const current = latest.applications.find(entry => entry.listingId === id && entry.state === "invited");
        const terms = latest.listings.find(entry => entry.id === id && entry.state === "posted");
        if (!current?.consents.owner || !current.consents.teacher || !terms || latest.applications.some(entry => entry.state === "hired")) return "채용 상태를 다시 확인해 주세요.";
        terms.state = "filled";
        Object.assign(current, { state:"hired", compensation:{ ...terms } });
        store(latest, context);
      }, control, { confirmLabel:"초대 수락" });
    }
  }

  function filter(control, context) {
    if (context.role !== "teacher") return;
    if (control.dataset.hiringFilter === "subject") subjectFilter = control.value;
    else typeFilter = control.value;
    context.rerender();
    document.querySelector(`[data-hiring-filter="${control.dataset.hiringFilter}"]`)?.focus();
  }

  const employees = () => read().applications.filter(application => application.state === "hired")
    .map(({ listingId, compensation }) => ({ id:`career-${listingId}`, name:applicantName, hireDate:compensation.startsOn,
      kind:employee(compensation.kind) ? `${payKinds[compensation.kind]} 강사` : `${payKinds[compensation.kind]} 프리랜서`,
      recruitment:compensation }));
  window.DemoHiring = Object.freeze({ owner, teacher, handle, filter, metrics, employees, payInput, forecasts, reset, ownsStorage:key => key === storageKey });
})();
