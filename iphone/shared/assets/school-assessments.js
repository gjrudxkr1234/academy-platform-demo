"use strict";

// 가상 학교의 고정 시연 데이터입니다. 실제 학교나 외부 서비스에 연결하지 않습니다.
const DemoSchoolAssessments = (() => {
  const demoDate = "2026-11-16";
  const weekEnd = "2026-11-22";
  const schools = {
    naru: {
      name: "별담나루 가상중학교", grade: "2학년",
      courses: {
        math: { name: "수학", teacher: "김하늘", written: 60, assessment: "함수 그래프", scope: ["일차함수의 그래프", "도형의 성질 2단원"] },
        english: { name: "영어", teacher: "이소담", written: 50, assessment: "말하기 평가", scope: ["교과서 5–6과", "자기소개 발표"] },
        science: { name: "과학", teacher: "박해솔", written: 60, assessment: "탐구 결과 정리", scope: ["전기와 자기", "자료 해석 1단원"] },
      },
    },
    moon: {
      name: "푸른달빛 가상중학교", grade: "1학년",
      courses: {
        math: { name: "수학", teacher: "윤여울", written: 50, assessment: "수와 식 설명하기", scope: ["정수와 유리수", "문자와 식"] },
      },
    },
  };
  const studentSchool = { jiwoo: "naru", minjun: "moon" };
  const types = { performance: "수행평가", written: "지필평가" };
  const reasons = { date: "일정 오류", privacy: "개인정보", prohibited: "금지 자료", other: "기타" };
  const supplies = {
    none: [],
    chart: ["그래프 용지", "자"],
    tools: ["연필", "지우개"],
    book: ["교과서"],
  };

  let demo = fresh();

  function fresh() {
    return {
      school: "naru",
      academySummary: false,
      summary: {},
      checks: {},
      plans: {},
      events: [
        { id: "naru-performance", school: "naru", course: "math", type: "performance", date: "2026-11-17", scope: "일차함수의 그래프", supplies: "chart", reporter: "classmate-a", confirmations: [], approved: true },
        { id: "naru-english", school: "naru", course: "english", type: "written", date: "2026-11-19", scope: "교과서 5–6과", supplies: "tools", reporter: "classmate-a", confirmations: ["classmate-b", "classmate-c"], approved: false },
        { id: "naru-written", school: "naru", course: "math", type: "written", date: "2026-11-21", scope: "도형의 성질 2단원", supplies: "tools", reporter: "classmate-c", confirmations: ["classmate-a"], approved: false },
        { id: "moon-performance", school: "moon", course: "math", type: "performance", date: "2026-11-20", scope: "정수와 유리수", supplies: "book", reporter: "classmate-b", confirmations: [], approved: true },
      ],
      nextId: 1,
    };
  }

  function isStaff() {
    return role === "owner" || role === "teacher";
  }

  function schoolId() {
    if (role === "owner") return demo.school;
    return studentSchool[role === "parent" ? child : "jiwoo"];
  }

  function isConfirmed(entry) {
    return entry.approved || entry.confirmations.length >= 2;
  }

  function dayOffset(date) {
    return Math.round((Date.parse(date) - Date.parse(demoDate)) / 86_400_000);
  }

  function dateLabel(date) {
    const [, month, day] = date.split("-").map(Number);
    return `${month}월 ${day}일`;
  }

  function schoolEvents() {
    return demo.events.filter((entry) => entry.school === schoolId() && (isStaff() || !entry.hidden))
      .toSorted((a, b) => a.date.localeCompare(b.date));
  }

  function dateBadge(entry) {
    const days = dayOffset(entry.date);
    return badge(days === 0 ? "D-DAY" : `D-${days}`, days <= 1 ? "red" : days <= 3 ? "orange" : "neutral");
  }

  function eventTitle(entry) {
    return `${schools[entry.school].courses[entry.course].name} ${types[entry.type]}`;
  }

  function schoolPicker() {
    return `<div class="parent-picker" aria-label="가상 학교 선택">${Object.entries(schools).map(([id, school]) =>
      `<button type="button" class="secondary" data-action="school-demo-switch" data-id="${id}" aria-pressed="${id === schoolId()}">${escapeHtml(school.name)}</button>`).join("")}</div>`;
  }

  function checklist(entry) {
    const required = supplies[entry.supplies];
    if (!required.length) return "";
    if (role !== "student" || !isConfirmed(entry)) {
      return `<div><dt>준비물</dt><dd>${escapeHtml(required.join(" · "))}</dd></div>`;
    }
    return `<fieldset class="school-checklist"><legend>내 준비물 체크리스트</legend>
      ${required.map((supply, index) => {
        const id = `${entry.id}:${index}`;
        return `<label><input type="checkbox" data-action="school-demo-check" data-id="${id}" ${demo.checks[id] ? "checked" : ""}> ${escapeHtml(supply)}</label>`;
      }).join("")}
    </fieldset>`;
  }

  function eventCard(entry) {
    const course = schools[entry.school].courses[entry.course];
    const confirmed = !entry.hidden && isConfirmed(entry);
    let actions = "";
    if (role === "student" && !confirmed && entry.reporter !== "jiwoo" && !entry.confirmations.includes("jiwoo")) {
      actions += button("같은 일정 확인", "school-demo-confirm", { id: entry.id });
    }
    if (role === "student" && !entry.report) actions += button("신고", "school-demo-flag", { id: entry.id, variant: "text-button" });
    if (isStaff() && !entry.hidden && !confirmed) actions += button("일정 승인", "school-demo-approve", { id: entry.id, variant: "primary" });
    if (isStaff() && entry.report) actions += button("신고 검토 완료", "school-demo-dismiss", { id: entry.id });
    if (isStaff() && !entry.hidden) actions += button("일정 숨기기", "school-demo-hide", { id: entry.id, variant: "text-button" });
    if (role === "owner") actions += button("일정 삭제", "school-demo-delete", { id: entry.id, variant: "text-button danger" });
    const state = entry.hidden ? badge("숨김", "neutral") : confirmed ? badge("확정", "green") : badge("확인 중", "orange");
    const reportState = !entry.report ? "" : isStaff()
      ? badge(`신고 1건 · ${reasons[entry.report]}`, "red") : badge("신고 접수", "neutral");
    return `<li class="school-event" id="school-event-${entry.id}" tabindex="-1">
      <div class="school-event-head">
        <div><p class="school-event-date"><time datetime="${entry.date}">${dateLabel(entry.date)}</time> · ${escapeHtml(course.teacher)} 선생님</p>
        <h3>${escapeHtml(eventTitle(entry))}</h3></div>
        <div class="school-statuses">${confirmed ? dateBadge(entry) : ""}${state}${reportState}</div>
      </div>
      <dl class="school-event-details"><div><dt>범위</dt><dd>${escapeHtml(entry.scope)}</dd></div>${role !== "student" || !confirmed ? checklist(entry) : ""}</dl>
      ${role === "student" && confirmed ? checklist(entry) : ""}
      <div class="school-event-footer"><span class="note">확인 ${entry.confirmations.length}명${entry.approved ? " · 학원 승인" : ""}</span>
        ${actions ? `<div class="actions">${actions}</div>` : ""}</div>
    </li>`;
  }

  function courseList(school) {
    return list(Object.entries(school.courses).map(([courseId, course]) => {
      const { written, assessment } = demo.plans[`${schoolId()}:${courseId}`] ?? course;
      return item(course.name, `${course.teacher} 선생님 · 지필 ${written}% · 수행 ${100 - written}% · ${assessment}`);
    }));
  }

  function portalAlerts(entries) {
    const due = entries.filter((entry) => isConfirmed(entry) && [1, 3].includes(dayOffset(entry.date)));
    const body = list(due.map((entry) => item(eventTitle(entry), `${dateLabel(entry.date)} · ${entry.scope}`, dateBadge(entry))), "오늘 예정된 D-3·D-1 알림이 없습니다.");
    return panel("포털 마감 알림", body + '<p class="note">확정된 일정의 D-3·D-1에 포털에서 알려줍니다.</p>');
  }

  function academySummaryControl() {
    return panel("보호자 주간 요약", `<label class="school-summary-toggle">
      <input type="checkbox" data-action="school-demo-academy-summary" ${demo.academySummary ? "checked" : ""}> 학원에서 주간 요약 허용
      </label><p class="note">허용한 뒤 보호자가 자녀별 주간 요약을 켤 수 있습니다.</p>`, "", "stack");
  }

  function guardianSummary(school, entries) {
    if (!demo.academySummary) {
      return childPicker() + panel("내신 일정 주간 요약", '<p class="note">학원에서 주간 요약을 켜면 자녀별로 설정할 수 있습니다.</p>');
    }
    const enabled = demo.summary[child] === true;
    const toggle = `<label class="school-summary-toggle"><input type="checkbox" data-school-summary ${enabled ? "checked" : ""}> ${escapeHtml(studentName(child))} 학생 주간 요약 켜기</label>`;
    const upcoming = entries.filter((entry) => isConfirmed(entry) && entry.date >= demoDate && entry.date <= weekEnd);
    const rows = upcoming.map((entry) => {
      const preparation = supplies[entry.supplies];
      const details = [dateLabel(entry.date), entry.scope, ...preparation].join(" · ");
      return item(eventTitle(entry), details, dateBadge(entry));
    });
    const summary = enabled
      ? `<p class="note">${dateLabel(demoDate)}–${dateLabel(weekEnd)} · 자녀의 확정 일정만 표시합니다.</p>` + list(rows, "이번 주 확정된 일정이 없습니다.")
      : '<p class="note">주간 요약이 꺼져 있습니다. 켜면 연결된 자녀의 확정 일정을 확인할 수 있습니다.</p>';
    const settings = `<div class="actions school-summary-settings">${toggle}${button("주간 요약 설정 저장", "school-demo-summary")}</div>`;
    return childPicker() + panel("내신 일정 주간 요약",
      `<p class="school-context">${escapeHtml(school.name)} · ${escapeHtml(school.grade)}</p>` + settings + summary);
  }

  function view() {
    const school = schools[schoolId()];
    const entries = schoolEvents();
    const title = `<section class="hero school-hero"><div>
      <div class="school-hero-title"><h1>내신 일정</h1>${badge("기능 체험", "purple")}</div>
      <p>시험 범위와 수행평가 준비물을 내 학교 일정에서 확인하세요.</p>
      <p class="school-demo-note">가상 학교와 ${dateLabel(demoDate)} 기준의 화면입니다. 체험 데이터는 이 화면에서만 바뀝니다.</p>
    </div>${role === "student" ? button("일정 제보 체험", "school-demo-report", { variant: "primary" }) : ""}</section>`;
    if (role === "parent") return title + guardianSummary(school, entries);
    const schedule = entries.length ? `<ul class="school-events">${entries.map(eventCard).join("")}</ul>` : '<p class="empty">아직 일정이 없습니다.</p>';
    const academic = panel("학교 과목·평가계획", courseList(school) +
      '<p class="note">학원 교직원이 확인해 직접 입력하는 가상 평가계획입니다.</p>',
      isStaff() ? button("평가계획 입력", "school-demo-plan", { variant: "text-button" }) : "", "stack");
    return title + (role === "owner" ? schoolPicker() : "") +
      `<div class="columns"><div>${panel(isStaff() ? "내신 일정 관리" : "내 학교 일정",
        `<p class="school-context">${escapeHtml(school.name)} · ${escapeHtml(school.grade)}</p>` + schedule, badge("가상 일정", "purple"))}</div>
        <div>${isStaff() ? panel("제보 검토 기준", '<p>같은 학원·학교의 다른 학생 2명이 확인하거나 선생님·원장이 승인하면 확정됩니다.</p><p class="note">개인정보·금지 자료 신고가 접수된 일정은 확인 전까지 숨깁니다.</p>') : portalAlerts(entries)}
          ${academic}${role === "owner" ? academySummaryControl() : ""}</div></div>`;
  }

  function options(values) {
    return Object.entries(values).map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  }

  function report() {
    const school = schools[schoolId()];
    const courseOptions = Object.fromEntries(Object.entries(school.courses).map(([id, course]) => [id, course.name]));
    const supplyOptions = Object.fromEntries(Object.entries(supplies).map(([id, values]) => [id, values.join(" · ") || "준비물 없음"]));
    openDialog("학교 일정 제보 체험", `
      <p class="note">${escapeHtml(school.name)} · 예시만 선택할 수 있습니다. 실제 학교 공지나 파일은 받지 않습니다.</p>
      <label>과목<select id="school-demo-course" name="course">${options(courseOptions)}</select></label>
      <label>유형<select name="type">${options(types)}</select></label>
      <label>날짜<input class="school-date-input" type="date" name="date" value="2026-11-20" min="${demoDate}" max="2026-11-30" required></label>
      <label>범위<select id="school-demo-scope" name="scope"></select></label>
      <label>준비물<select name="supplies">${options(supplyOptions)}</select></label>
      <p class="note">시험 문제·답안·수행평가 자료는 공유할 수 없습니다.</p>
      <p class="school-demo-error" role="status" hidden></p>`, "제보 남기기", (values) => {
      const dateField = dialog.querySelector('[name="date"]');
      if (!dateField.reportValidity()) return false;
      const [course, type, date, scope, preparation] = ["course", "type", "date", "scope", "supplies"].map((key) => values.get(key));
      if (demo.events.some((entry) => entry.school === schoolId() && entry.course === course && entry.type === type && entry.date === date && entry.scope === scope)) {
        const error = dialog.querySelector(".school-demo-error");
        error.textContent = "같은 일정이 있습니다. 목록에서 기존 일정을 확인해 주세요.";
        error.hidden = false;
        return false;
      }
      const id = `report-${demo.nextId++}`;
      demo.events.push({ id, school: schoolId(), course, type, date, scope, supplies: preparation, reporter: "jiwoo", confirmations: [], approved: false });
      render();
      dialog.addEventListener("close", () => content.querySelector(`#school-event-${id}`)?.focus(), { once: true });
      announce("가상 일정을 제보했습니다. 확인 중입니다.");
    });
    const courseSelect = dialog.querySelector("#school-demo-course");
    const scopeSelect = dialog.querySelector("#school-demo-scope");
    const refreshScope = () => {
      scopeSelect.innerHTML = options(Object.fromEntries(school.courses[courseSelect.value].scope.map((range) => [range, range])));
    };
    courseSelect.addEventListener("change", refreshScope);
    refreshScope();
  }

  function manualPlan() {
    const selectedSchool = schoolId();
    const school = schools[selectedSchool];
    const courseOptions = Object.fromEntries(Object.entries(school.courses).map(([id, course]) => [id, course.name]));
    const assessmentOptions = Object.fromEntries(Object.entries(school.courses).map(([id, course]) => [id, course.assessment]));
    openDialog("평가계획 입력 체험", `
      <p class="note">${escapeHtml(school.name)} · 교직원이 확인한 평가계획을 입력하는 예시입니다.</p>
      <label>과목<select name="course">${options(courseOptions)}</select></label>
      <label>지필·수행 반영 비율<select name="weight">${options({ 50: "지필 50% · 수행 50%", 60: "지필 60% · 수행 40%", 70: "지필 70% · 수행 30%" })}</select></label>
      <label>수행평가 항목<select name="assessment">${options(assessmentOptions)}</select></label>
      <p class="note">출처 · 가상 학교의 2학기 평가계획</p>`, "평가계획 저장", (values) => {
      const courseId = values.get("course");
      const written = Number(values.get("weight"));
      const assessment = assessmentOptions[values.get("assessment")];
      if (!Object.hasOwn(school.courses, courseId) || ![50, 60, 70].includes(written) || !assessment) return false;
      demo.plans[`${selectedSchool}:${courseId}`] = { written, assessment };
      render();
      announce("가상 평가계획을 저장했습니다.");
    });
  }

  function flag(entry) {
    openDialog("내신 일정 신고", `<p>${escapeHtml(eventTitle(entry))}</p>
      <label>신고 사유<select name="reason">${options(reasons)}</select></label>
      <p class="note">개인정보 또는 금지 자료를 신고하면 해당 일정은 검토 중 학생·보호자에게 숨겨집니다.</p>`, "신고 접수", (values) => {
      const reason = values.get("reason");
      if (entry.report || !Object.hasOwn(reasons, reason)) return false;
      entry.report = reason;
      if (reason === "privacy" || reason === "prohibited") entry.hidden = "report";
      render();
      announce("가상 일정을 신고했습니다.");
    });
  }

  function remove(entry, action) {
    const deleting = action === "school-demo-delete";
    const label = deleting ? "일정 삭제" : "일정 숨기기";
    openDialog(label, `<p>${escapeHtml(eventTitle(entry))}을 ${deleting ? "삭제" : "숨김 처리"}합니다. 학생 일정과 보호자 요약에서 사라집니다.</p>`, label, () => {
      if (deleting) demo.events = demo.events.filter((record) => record !== entry);
      else entry.hidden = "manual";
      render();
      announce(deleting ? "가상 일정을 삭제했습니다." : "가상 일정을 숨겼습니다.");
    }, true);
  }

  function handle(action, id) {
    if (action === "school-demo-switch" && role === "owner" && Object.hasOwn(schools, id)) {
      demo.school = id;
      render();
      content.querySelector('[data-action="school-demo-switch"][aria-pressed="true"]')?.focus();
      return;
    }
    if (action === "school-demo-report" && role === "student") {
      report();
      return;
    }
    if (action === "school-demo-plan" && isStaff()) {
      manualPlan();
      return;
    }
    if (action === "school-demo-academy-summary" && role === "owner") {
      demo.academySummary = !demo.academySummary;
      render();
      content.querySelector('[data-action="school-demo-academy-summary"]')?.focus();
      return;
    }
    if (action === "school-demo-summary" && role === "parent" && demo.academySummary) {
      demo.summary[child] = Boolean(content.querySelector("[data-school-summary]")?.checked);
      render();
      content.querySelector('[data-action="school-demo-summary"]')?.focus();
      announce("주간 요약 설정을 저장했습니다.");
      return;
    }
    if (action === "school-demo-check" && role === "student") {
      demo.checks[id] = !demo.checks[id];
      render();
      const checkbox = Array.from(content.querySelectorAll('[data-action="school-demo-check"]')).find((input) => input.dataset.id === id);
      checkbox?.focus();
      return;
    }
    const entry = schoolEvents().find((record) => record.id === id);
    if (!entry) return;
    if (action === "school-demo-flag" && role === "student" && !entry.report) {
      flag(entry);
      return;
    }
    if ((action === "school-demo-hide" && isStaff() && !entry.hidden) || (action === "school-demo-delete" && role === "owner")) {
      remove(entry, action);
      return;
    }
    if (action === "school-demo-dismiss" && isStaff() && entry.report) {
      delete entry.report;
      if (entry.hidden === "report") delete entry.hidden;
      render();
      content.querySelector(`#school-event-${entry.id}`)?.focus();
      announce("신고 검토를 완료했습니다.");
      return;
    }
    if (action === "school-demo-approve" && isStaff() && !entry.hidden && !isConfirmed(entry)) {
      entry.approved = true;
    } else if (action === "school-demo-confirm" && role === "student" && !isConfirmed(entry) && entry.reporter !== "jiwoo" && !entry.confirmations.includes("jiwoo")) {
      entry.confirmations.push("jiwoo");
    } else {
      return;
    }
    render();
    content.querySelector(`#school-event-${entry.id}`)?.focus();
    announce(isConfirmed(entry) ? "일정이 확정되었습니다." : "확인 기록을 추가했습니다.");
  }

  return { view, handle, reset() { demo = fresh(); } };
})();
