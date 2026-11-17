/* Shared, synthetic records for the fixed owner and teacher demos. */
(() => {
  "use strict";

  const storageKey = "gradient-demo-hiring-v1";
  const calculator = window.AcademyWorkforceCalculator;
  const won = value => `${value.toLocaleString("ko-KR")}원`;
  const sampleTeacher = "이도현";
  const subjects = ["수학", "영어", "과학"];
  const payKinds = { hourly:"시급", fixed:"월급", session:"회당", students:"학생당", commission:"수납 비율" };
  const statuses = { applied:"지원 접수", interview:"면접 제안", accepted:"면접 수락", hired:"채용 완료" };
  const date = "2026-11";
  const initial = () => ({
    verified:false, publicEnabled:false, listings:[], applications:[],
  });
  const samples = [
    { id:"sample-math", title:"중등 수학 강사", subject:"수학", location:"가상학원 · 경기", time:"월·수 16:00–19:00", kind:"hourly", rate:25000, quantity:6 },
    { id:"sample-english", title:"초등 영어 강사", subject:"영어", location:"가상학원 · 서울", time:"화·목 15:00–18:00", kind:"session", rate:70000, quantity:8 },
  ];
  const text = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;",
  })[character]);
  const action = (label, type, id = "", css = "") =>
    `<button type="button" class="hiring-button ${css}" data-hiring-action="${type}" data-hiring-id="${text(id)}">${label}</button>`;
  const option = (value, label, selected) => `<option value="${text(value)}"${value === selected ? " selected" : ""}>${label}</option>`;

  let memory;
  let subjectFilter = "";
  let typeFilter = "";

  function read() {
    try {
      const value = localStorage.getItem(storageKey);
      if (value) return JSON.parse(value);
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

  function payInput({ kind, rate, quantity }) {
    const common = { month:date, employment:"hourly", scheduledWeeklyMinutes:0 };
    if (kind === "hourly") {
      const scheduledMinutes = quantity * 60;
      return { ...common, hourlyRate:rate, scheduledWeeklyMinutes:scheduledMinutes, workMinutes:scheduledMinutes * 4,
        weeks:Array.from({ length:4 }, () => ({ scheduledMinutes, allScheduledDaysWorked:true })) };
    }
    if (kind === "fixed") return { ...common, employment:"salaried", fixedMonthlyPay:rate, scheduledWeeklyMinutes:quantity * 60 };
    if (kind === "session") return { ...common, employment:"freelancer", perSessionRate:rate, sessionCount:quantity };
    if (kind === "students") return { ...common, employment:"freelancer", perStudentRate:rate,
      studentAssignments:Array.from({ length:quantity }, (_, index) => ({
        studentId:`synthetic-${index}`, daysAssigned:30, shareBasisPoints:10000,
      })) };
    return { ...common, employment:"freelancer", tuitionCommissionBasisPoints:rate * 100,
      tuitionTransactions:[{ amount:quantity, shareBasisPoints:10000 }] };
  }

  const estimate = listing => calculator.calculatePayroll(payInput(listing));
  const rateText = listing => listing.kind === "commission" ? `${listing.rate}%` : won(listing.rate);
  const basisText = listing => ({
    hourly:`주 ${listing.quantity}시간 · 4주 개근 기준`,
    fixed:`주 ${listing.quantity}시간`,
    session:`월 ${listing.quantity}회 기준`,
    students:`월 ${listing.quantity}명 기준`,
    commission:`월 순수납 ${won(listing.quantity)} 기준`,
  })[listing.kind];
  const paySummary = listing => {
    const { gross } = estimate(listing);
    return `<dl class="hiring-pay"><div><dt>${payKinds[listing.kind]} 조건</dt><dd>${rateText(listing)}</dd></div>
    <div><dt>월 지급 예상액</dt><dd data-hiring-gross="${gross}">${won(gross)}</dd></div></dl>
    <p class="hiring-note">${basisText(listing)} · 세전 예시</p>`;
  };

  function metrics() {
    return read().listings.filter(listing => listing.state === "posted").length;
  }

  function card(listing, content) {
    return `<section class="hiring-card"><header><small>${text(listing.subject)} · ${text(listing.location)}</small><h2>${text(listing.title)}</h2>
      <p>${text(listing.time)}</p></header>${paySummary(listing)}${content}</section>`;
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
        return card(listing, `<div class="hiring-list-footer"><span class="hiring-chip">${status}</span>
          <div class="hiring-actions">${listing.state === "draft" ? action("수정", "edit", listing.id) + action("게시", "post", listing.id, "hiring-primary") : ""}</div></div>
          ${listingApps.length ? `<section class="hiring-apps"><h3>지원자</h3>${listingApps.map(application => `<div class="hiring-app"><div><strong>${sampleTeacher}</strong><small>${statuses[application.state]}${application.interview ? ` · ${text(application.interview)}` : ""}</small></div><div class="hiring-actions">${application.state === "applied" ? action("면접 제안", "interview", listing.id) : ""}
          ${application.state === "accepted" ? action("채용 확정", "hire", listing.id, "hiring-primary") : ""}</div></div>`).join("")}</section>` : ""}`);
      }).join("") : '<p class="hiring-empty">작성한 공고가 없어요.</p>'}</div>`;
  }

  function teacher() {
    const data = read();
    const visible = [...data.listings.filter(listing => listing.state === "posted" && data.publicEnabled ||
      data.applications.some(application => application.listingId === listing.id)), ...samples];
    const filtered = visible.filter(listing => (!subjectFilter || listing.subject === subjectFilter) && (!typeFilter || listing.kind === typeFilter));
    return `<div class="hiring-page" data-hiring-screen="teacher"><header class="hiring-heading"><h1>커리어</h1></header>
      <div class="hiring-filters"><label>과목<select data-hiring-filter="subject">${option("", "전체 과목", subjectFilter)}${subjects.map(subject => option(subject, subject, subjectFilter)).join("")}</select></label>
      <label>보상 방식<select data-hiring-filter="pay">${option("", "전체 보상", typeFilter)}${Object.entries(payKinds).map(([kind, name]) => option(kind, name, typeFilter)).join("")}</select></label></div>
      ${filtered.length ? filtered.map(listing => {
        const application = data.applications.find(entry => entry.listingId === listing.id);
        return card(listing, `<div class="hiring-list-footer">${application ? `<span class="hiring-chip">${statuses[application.state]}</span>` : ""}
        <div class="hiring-actions">${!application ? action("지원하기", "apply", listing.id, "hiring-primary") :
        application.state === "interview" ? action("면접 수락", "accept", listing.id, "hiring-primary") : ""}</div></div>
        ${application?.interview ? `<p class="hiring-note">면접 일정 · ${text(application.interview)}</p>` : ""}`);
      }).join("") : '<p class="hiring-empty">선택한 조건의 공고가 없어요.</p>'}</div>`;
  }

  const defaultListing = { title:"", subject:"수학", location:"", time:"", kind:"hourly", rate:20000, quantity:12 };

  function edit(listing, opener, context) {
    const entry = listing ?? defaultListing;
    const input = (label, name) => `<label>${label}<input name="${name}" value="${text(entry[name])}" maxlength="80" required></label>`;
    context.openSheet(listing ? "공고 수정" : "공고 작성", `${input("공고 제목", "title")}
      <label>과목<select name="subject">${subjects.map(subject => option(subject, subject, entry.subject)).join("")}</select></label>
      ${input("지역·근무 장소", "location")}${input("근무 요일·시간", "time")}
      <label>보상 방식<select name="kind">${Object.entries(payKinds).map(([kind, name]) => option(kind, name, entry.kind)).join("")}</select></label>
      <label>보상 금액 또는 비율<input name="rate" value="${entry.rate}" type="number" min="1" max="100000000" required></label>
      <label>계산 기준 수량<input name="quantity" value="${entry.quantity}" type="number" min="1" max="100000000" required></label>
      <p class="hiring-note">시급·월급은 주 시간, 회당은 월 횟수, 학생당은 월 인원, 수납 비율은 월 순수납액(원)을 입력해 주세요.</p>`,
    (form) => {
      const fields = Object.fromEntries(["title", "subject", "location", "time", "kind"].map(key => [key, String(form.get(key) ?? "").trim()]));
      const rate = Number(form.get("rate"));
      const quantity = Number(form.get("quantity"));
      const maxQuantity = { hourly:168, fixed:168, session:124, students:300, commission:100000000 };
      if (!fields.title || !fields.location || !fields.time || !subjects.includes(fields.subject) || !Object.hasOwn(payKinds, fields.kind)) {
        return "제목, 과목, 근무 장소와 시간을 확인해 주세요.";
      }
      if (!Number.isInteger(rate) || rate < 1 || rate > (fields.kind === "commission" ? 100 : 10000000) ||
          !Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity[fields.kind]) return "보상 금액과 계산 기준 수량을 확인해 주세요.";
      const data = read();
      const value = { ...fields, rate, quantity, id:listing?.id ?? crypto.randomUUID(), state:"draft" };
      data.listings = listing ? data.listings.map(item => item.id === listing.id && item.state === "draft" ? value : item) : [value, ...data.listings];
      store(data, context);
    }, opener, { confirmLabel:"공고 저장" });
  }

  function handle(control, context) {
    const { hiringAction:type, hiringId:id } = control.dataset;
    const data = read();
    const listing = data.listings.find(entry => entry.id === id);
    const application = data.applications.find(entry => entry.listingId === id);
    if (context.role === "owner") {
      if (type === "create" || type === "edit" && listing?.state === "draft") return edit(listing, control, context);
      if (type === "verify" && !data.verified) return context.openSheet("학원 확인", '<p>가상 학원 이름과 운영자 정보의 일치를 확인합니다.</p><label><input name="verified" type="checkbox"> 가상 학원 운영자임을 확인했어요.</label>', (form) => {
        if (!form.has("verified")) return "가상 학원 운영 여부를 확인해 주세요.";
        store({ ...read(), verified:true }, context);
      }, control, { confirmLabel:"가상 확인 완료" });
      if (type === "public") return store({ ...data, publicEnabled:!data.publicEnabled }, context);
      if (type === "post" && listing?.state === "draft") {
        if (!data.verified) return context.announce("공고 게시 전에 학원 확인을 완료해 주세요.");
        if (!data.publicEnabled) return context.announce("게시 설정에서 공개 공고를 켜 주세요.");
        listing.state = "posted";
        return store(data, context);
      }
      if (type === "interview" && application?.state === "applied" && listing?.state === "posted") {
        return context.openSheet("면접 제안", '<label>면접 일정<input name="interview" type="datetime-local" required></label>', (form) => {
          const interview = form.get("interview");
          if (typeof interview !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(interview)) return "면접 일정을 입력해 주세요.";
          const latest = read();
          const current = latest.applications.find(entry => entry.listingId === id && entry.state === "applied");
          if (!current) return "이미 지원 상태가 바뀌었어요.";
          Object.assign(current, { state:"interview", interview:interview.replace("T", " ") });
          store(latest, context);
        }, control, { confirmLabel:"면접 제안" });
      }
      if (type === "hire" && application?.state === "accepted" && listing?.state === "posted") {
        return context.openSheet("채용 확정", `<p>${text(sampleTeacher)} 선생님을 채용하면 공고의 보상 조건과 예상 급여가 근무·급여에 반영됩니다.</p>${paySummary(listing)}`, () => {
          const latest = read();
          const currentListing = latest.listings.find(entry => entry.id === id && entry.state === "posted");
          const currentApp = latest.applications.find(entry => entry.listingId === id && entry.state === "accepted");
          if (!currentListing || !currentApp) return "이미 지원 상태가 바뀌었어요.";
          Object.assign(currentListing, { state:"filled" });
          Object.assign(currentApp, { state:"hired", compensation:{ ...currentListing } });
          store(latest, context);
        }, control, { confirmLabel:"채용 확정" });
      }
      return;
    }
    if (context.role !== "teacher") return;
    if (type === "apply" && !application && (listing?.state === "posted" && data.publicEnabled || samples.some(entry => entry.id === id))) {
      return context.openSheet("공고 지원", '<p>가상 프로필 이도현으로 이 공고에 지원합니다.</p>', () => {
        const latest = read();
        if (latest.applications.some(entry => entry.listingId === id)) return "이미 지원한 공고예요.";
        latest.applications.push({ listingId:id, state:"applied" });
        store(latest, context);
      }, control, { confirmLabel:"가상 지원" });
    }
    if (type === "accept" && application?.state === "interview") {
      application.state = "accepted";
      store(data, context);
    }
  }

  function filter(control, context) {
    if (context.role !== "teacher") return;
    if (control.dataset.hiringFilter === "subject") subjectFilter = control.value;
    else typeFilter = control.value;
    context.rerender();
    document.querySelector(`[data-hiring-filter="${control.dataset.hiringFilter}"]`)?.focus();
  }

  const hired = () => read().applications.filter(application => application.state === "hired");
  const gross = () => hired().reduce((total, application) => total + estimate(application.compensation).gross, 0);
  function workforce() {
    const rows = hired();
    return rows.length ? `<section class="hiring-workforce" aria-label="채용 급여"><h2>채용 급여</h2>${rows.map(({ compensation }) =>
      `<article class="hiring-card"><h3>${sampleTeacher} · ${text(compensation.title)}</h3>${paySummary(compensation)}</article>`).join("")}</section>` : "";
  }

  window.DemoHiring = Object.freeze({ owner, teacher, handle, filter, metrics, workforce, gross, reset, ownsStorage:key => key === storageKey });
})();
