"use strict";

// 가상 학교의 고정 시연 데이터입니다. 실제 학교나 외부 서비스에 연결하지 않습니다.
const DemoSchoolAssessments = (() => {
  const demoDate = "2026-11-12";
  const schools = {
    naru: {
      name: "별담나루 가상중학교", grade: "2학년",
      courses: {
        math: { name: "수학", teacher: "김하늘", plan: "지필 60% · 수행 40%", scope: ["일차함수의 그래프", "도형의 성질 2단원"] },
        english: { name: "영어", teacher: "이소담", plan: "지필 50% · 수행 50%", scope: ["교과서 5–6과", "자기소개 발표"] },
        science: { name: "과학", teacher: "박해솔", plan: "지필 60% · 수행 40%", scope: ["전기와 자기", "자료 해석 1단원"] },
      },
    },
    moon: {
      name: "푸른달빛 가상중학교", grade: "1학년",
      courses: {
        math: { name: "수학", teacher: "윤여울", plan: "지필 50% · 수행 50%", scope: ["정수와 유리수", "문자와 식"] },
      },
    },
  };
  const studentSchool = { jiwoo: "naru", minjun: "moon" };
  const types = { performance: "수행평가", written: "지필평가" };
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
      summary: {},
      checks: {},
      events: [
        { id: "naru-performance", school: "naru", course: "math", type: "performance", date: "2026-11-13", scope: "일차함수의 그래프", supplies: "chart", reporter: "classmate-a", confirmations: [], approved: true, evidence: false },
        { id: "naru-english", school: "naru", course: "english", type: "written", date: "2026-11-15", scope: "교과서 5–6과", supplies: "tools", reporter: "classmate-a", confirmations: ["classmate-b", "classmate-c"], approved: false, evidence: false },
        { id: "naru-written", school: "naru", course: "math", type: "written", date: "2026-11-18", scope: "도형의 성질 2단원", supplies: "tools", reporter: "classmate-c", confirmations: ["classmate-a"], approved: false, evidence: true },
        { id: "moon-performance", school: "moon", course: "math", type: "performance", date: "2026-11-16", scope: "정수와 유리수", supplies: "book", reporter: "classmate-b", confirmations: [], approved: true, evidence: false },
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
    return demo.events.filter((entry) => entry.school === schoolId()).toSorted((a, b) => a.date.localeCompare(b.date));
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
    const confirmed = isConfirmed(entry);
    let actions = "";
    if (role === "student" && !confirmed && entry.reporter !== "jiwoo" && !entry.confirmations.includes("jiwoo")) {
      actions += button("같은 일정 확인", "school-demo-confirm", { id: entry.id });
    }
    if (isStaff() && !confirmed) actions += button("일정 승인", "school-demo-approve", { id: entry.id, variant: "primary" });
    if (isStaff() && entry.evidence) actions += button("가상 공지 사진 보기", "school-demo-evidence", { id: entry.id });
    return `<li class="school-event" id="school-event-${entry.id}" tabindex="-1">
      <div class="school-event-head">
        <div><p class="school-event-date"><time datetime="${entry.date}">${dateLabel(entry.date)}</time> · ${escapeHtml(course.teacher)} 선생님</p>
        <h3>${escapeHtml(eventTitle(entry))}</h3></div>
        <div class="school-statuses">${confirmed ? dateBadge(entry) : ""}${confirmed ? badge("확정", "green") : badge("확인 대기", "orange")}</div>
      </div>
      <dl class="school-event-details"><div><dt>범위</dt><dd>${escapeHtml(entry.scope)}</dd></div>${role !== "student" || !confirmed ? checklist(entry) : ""}</dl>
      ${role === "student" && confirmed ? checklist(entry) : ""}
      <div class="school-event-footer"><span class="note">확인 ${entry.confirmations.length}명${entry.approved ? " · 학원 승인" : ""}</span>
        ${actions ? `<div class="actions">${actions}</div>` : ""}</div>
    </li>`;
  }

  function courseList(school) {
    return list(Object.values(school.courses).map((course) => item(course.name, `${course.teacher} 선생님 · ${course.plan}`)));
  }

  function portalAlerts(entries) {
    const due = entries.filter((entry) => isConfirmed(entry) && [1, 3].includes(dayOffset(entry.date)));
    const body = list(due.map((entry) => item(eventTitle(entry), `${dateLabel(entry.date)} · ${entry.scope}`, dateBadge(entry))), "오늘 예정된 D-3·D-1 알림이 없습니다.");
    return panel("포털 마감 알림", body + '<p class="note">확정된 일정의 D-3·D-1에 포털에서 알려줍니다.</p>');
  }

  function contribution() {
    const created = demo.events.filter((entry) => entry.reporter === "jiwoo").length;
    const confirmed = demo.events.filter((entry) => entry.confirmations.includes("jiwoo")).length;
    return panel("내 참여 기록", `<p>제보 ${created}건 · 확인 ${confirmed}건</p>
      <p class="note">학원은 내 참여 기록을 보고 칭찬할 수 있습니다.</p>`,
    confirmed ? badge("일정 확인 도움", "purple") : "", "stack");
  }

  function guardianSummary(school, entries) {
    const enabled = Boolean(demo.summary[child]);
    const toggle = `<label class="school-summary-toggle"><input type="checkbox" data-action="school-demo-summary" ${enabled ? "checked" : ""}> ${escapeHtml(studentName(child))} 학생 주간 요약 켜기</label>`;
    const upcoming = entries.filter((entry) => isConfirmed(entry) && dayOffset(entry.date) >= 0 && dayOffset(entry.date) <= 6);
    const rows = upcoming.map((entry) => {
      const preparation = supplies[entry.supplies];
      const details = [dateLabel(entry.date), entry.scope, ...preparation].join(" · ");
      return item(eventTitle(entry), details, dateBadge(entry));
    });
    const summary = enabled
      ? '<p class="note">11월 12–18일 · 확인된 자녀 일정만 표시합니다.</p>' + list(rows, "이번 주 확정된 일정이 없습니다.")
      : '<p class="note">주간 요약이 꺼져 있습니다. 켜면 연결된 자녀의 확정 일정을 확인할 수 있습니다.</p>';
    return childPicker() + panel(`${school.name} · ${school.grade}`, toggle + summary, badge("보호자 보기", "purple"));
  }

  function view() {
    const school = schools[schoolId()];
    const entries = schoolEvents();
    const title = `<section class="hero school-hero"><div>
      <div class="school-hero-title"><h1>내신 일정</h1>${badge("준비 중", "purple")}</div>
      <p>시험 범위와 수행평가 준비물을 내 학교 일정에서 확인하세요.</p>
      <p class="school-demo-note">가상 학교와 11월 12일 기준의 화면입니다. 체험 데이터는 이 화면에서만 바뀝니다.</p>
    </div>${role === "student" ? button("일정 제보 체험", "school-demo-report", { variant: "primary" }) : ""}</section>`;
    if (role === "parent") return title + guardianSummary(school, entries);
    const schedule = entries.length ? `<ul class="school-events">${entries.map(eventCard).join("")}</ul>` : '<p class="empty">아직 일정이 없습니다.</p>';
    const academic = panel("학교 과목·평가계획", courseList(school) +
      '<p class="note">나이스 학사일정·시간표와 학교알리미 평가계획을 참고하는 화면 예시입니다. 표의 과목 담당과 비율은 가상 자료입니다.</p>', "", "stack");
    return title + (role === "owner" ? schoolPicker() : "") +
      `<div class="columns"><div>${panel(isStaff() ? "학교 일정과 제보" : "내 학교 일정",
        `<p class="school-context">${escapeHtml(school.name)} · ${escapeHtml(school.grade)}</p>` + schedule, badge("가상 일정", "purple"))}</div>
        <div>${isStaff() ? panel("제보 검토 기준", '<p>같은 학원·학교의 다른 학생 2명이 확인하거나 선생님·원장이 승인하면 확정됩니다.</p><p class="note">학교 공지 근거는 학원 담당자만 확인합니다.</p>') : portalAlerts(entries)}
          ${academic}${role === "student" ? contribution() : ""}</div></div>`;
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
      <label>날짜<input class="school-date-input" type="date" name="date" value="2026-11-17" min="${demoDate}" max="2026-11-30" required></label>
      <label>범위<select id="school-demo-scope" name="scope"></select></label>
      <label>준비물<select name="supplies">${options(supplyOptions)}</select></label>
      <label class="school-evidence-control"><input type="checkbox" id="school-demo-evidence"> 가상 학교 공지 예시 첨부</label>
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
      demo.events.push({ id, school: schoolId(), course, type, date, scope, supplies: preparation, reporter: "jiwoo", confirmations: [], approved: false,
        evidence: dialog.querySelector("#school-demo-evidence").checked });
      render();
      dialog.addEventListener("close", () => content.querySelector(`#school-event-${id}`)?.focus(), { once: true });
      announce("가상 일정을 제보했습니다. 아직 확인 대기 상태입니다.");
    });
    const courseSelect = dialog.querySelector("#school-demo-course");
    const scopeSelect = dialog.querySelector("#school-demo-scope");
    const refreshScope = () => {
      scopeSelect.innerHTML = options(Object.fromEntries(school.courses[courseSelect.value].scope.map((range) => [range, range])));
    };
    courseSelect.addEventListener("change", refreshScope);
    refreshScope();
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
    if (action === "school-demo-summary" && role === "parent") {
      demo.summary[child] = !demo.summary[child];
      render();
      content.querySelector('[data-action="school-demo-summary"]')?.focus();
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
    if (action === "school-demo-evidence" && isStaff() && entry.evidence) {
      openDialog("학교 공지 근거 · 가상 예시", `<div class="school-evidence-paper">
        <p class="note">${escapeHtml(schools[entry.school].name)} · 사진으로 첨부할 수 있는 내용의 예시</p>
        <strong>${escapeHtml(eventTitle(entry))} 일정 안내</strong>
        <p>${dateLabel(entry.date)} · ${escapeHtml(entry.scope)}</p>
      </div><p class="note">학원 담당자에게만 보이는 가상 공지입니다.</p>`);
      return;
    }
    if (action === "school-demo-approve" && isStaff() && !isConfirmed(entry)) {
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
