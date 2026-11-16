/* Synthetic calendar shared by the local role demos. No network or real academy data. */
(() => {
  "use strict";

  const demoDate = "2026-11-16";
  const storageKey = "gradient-demo-home-v3-events";
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const kinds = {
    lesson: "수업", makeup: "보강", event: "학원 행사", closure: "휴원", exam: "학원 시험", other: "기타",
  };
  const categories = {
    lesson: ["수업", "M4 5v14m0-14h6l2 2 2-2h6v14h-6l-2 2-2-2H4m8-12v14"],
    assignment: ["과제", "M4 16v4h4L20 8l-4-4L4 16Zm10-10 4 4"],
    exam: ["시험", "M12 5v9m0 4v1"],
    makeup: ["보강", "m8 5 12 7-12 7V5Z"],
    academy: ["학원", "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"],
    consultation: ["상담", "M4 5h16v12h-7l-5 4v-4H4V5Z"],
    closure: ["휴원", "M5 12h14"],
  };
  const filters = { lesson: "수업", assignment: "과제", exam: "시험", academy: "학원", consultation: "상담" };
  const filterCategory = { makeup: "lesson", closure: "academy" };
  const dayMillis = 86400000;
  const titleCompare = new Intl.Collator("ko").compare;
  const minimumDate = "2000-01-01";
  const maximumDate = "2099-12-31";
  const initials = [
    { id: "demo-v3-clinic", title: "중2 심화반 보강", kind: "makeup", date: "2026-11-19", time: "17:40",
      room: "강의실 A", teacher: "이도현 선생님", scope: "classes", groups: ["중2 심화반"], creator: "owner", reminder: true },
    { id: "demo-v3-exam", title: "중1 개념반 단원 시험", kind: "exam", date: "2026-11-21", time: "11:00",
      room: "강의실 B", teacher: "김하람 선생님", scope: "classes", groups: ["중1 개념반"], creator: "owner", reminder: true },
    { id: "demo-v3-break", title: "학원 정기 휴원", kind: "closure", date: "2026-11-23", time: "",
      scope: "all", creator: "owner", reminder: true },
    { id: "demo-v3-open", title: "수학 학습 설명회", kind: "event", date: "2026-11-27", time: "19:00",
      room: "상담실", scope: "all", creator: "owner", reminder: true },
    { id: "demo-v31-term", title: "겨울 특강 준비 주간", kind: "event", date: "2026-11-27", endDate: "2026-12-02", time: "",
      room: "강의실 A", scope: "all", creator: "owner", reminder: false },
    { id: "demo-v31-material", title: "기말 정리 자료 제출", kind: "other", date: "2026-11-19", time: "20:00",
      scope: "classes", groups: ["중2 심화반"], creator: "owner", reminder: false },
    { id: "demo-v31-studio", title: "저녁 질문 클리닉", kind: "makeup", date: "2026-11-19", time: "19:00",
      scope: "classes", groups: ["중2 심화반"], creator: "owner", reminder: false },
    { id: "demo-v31-video", title: "일차함수 보강 영상", kind: "makeup", date: "2026-11-20", time: "23:59",
      scope: "classes", groups: ["중2 심화반"], creator: "owner", reminder: false },
  ];
  let selectedDate = demoDate;
  let view = "month";
  let lastRole;
  let returnScreen = "home";
  const selectedFilters = new Set();
  const isStaff = (role) => role === "owner" || role === "teacher";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[c]);
  const datePart = (date) => date.toISOString().slice(0, 10);
  const weekdayFor = (date) => new Date(date + "T00:00:00Z").getUTCDay();
  const shiftDay = (date, days) => {
    const shifted = new Date(date + "T00:00:00Z");
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return datePart(shifted);
  };
  const validDate = (value) => typeof value === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && datePart(new Date(value)) === value;
  const eventEnd = (event) => event.endDate ?? event.date;
  const coversDate = (event, date) => event.date <= date && eventEnd(event) >= date;
  const dayDistance = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / dayMillis);
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const shortDate = (date) => {
    const [, m, d] = date.split("-").map(Number);
    return `${m}월 ${d}일`;
  };

  function optionsFor(role, options = {}) {
    const input = options.calendar ?? {};
    const lessons = input.lessons ?? options.timetable ?? [];
    const selectedGroup = input.selectedGroup ?? options.selectedGroup ?? "중2 심화반";
    return {
      lessons, selectedGroup, studentId: input.studentId ?? (role === "parent" && selectedGroup === "중1 개념반" ? "minjun" : "jiwoo"),
      students: input.students ?? [
        { id: "jiwoo", name: "김지우", group: "중2 심화반" }, { id: "minjun", name: "김민준", group: "중1 개념반" },
      ],
      teacherGroups: input.teacherGroups ?? ["중2 심화반"],
      assignments: input.assignments ?? [
        { id: "linear-practice", title: "일차함수 실전 문제 8–12번", date: demoDate, time: "21:00", groups: ["중2 심화반"] },
        { id: "graph-review", title: "그래프 읽기 복습 1–3번", date: "2026-11-18", time: "20:00", groups: ["중2 심화반"] },
      ],
      schoolEvents: input.schoolEvents ?? [],
      consultations: input.consultations ?? [],
    };
  }

  function readEvents() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      const list = Array.isArray(saved) ? saved : saved?.version === 2 ? saved.events : null;
      const valid = Array.isArray(list) ? list.filter((event) => event && validDate(event.date)
        && (event.endDate == null || (validDate(event.endDate) && event.endDate >= event.date))
        && typeof event.title === "string" && typeof event.id === "string"
        && Object.hasOwn(kinds, event.kind) && ["all", "classes", "student"].includes(event.scope)
        && (event.scope !== "classes" || (Array.isArray(event.groups) && event.groups.every((group) => typeof group === "string")))
        && (event.scope !== "student" || typeof event.studentId === "string")) : initials;
      if (!Array.isArray(saved)) return valid;
      return [...valid, ...initials.filter(({ id }) => id.startsWith("demo-v31-") && !valid.some((event) => event.id === id))];
    } catch { return initials; }
  }

  function canSee(event, role, input) {
    if (role === "owner" || event.scope === "all") return true;
    if (event.studentId) {
      if (role !== "teacher") return event.studentId === input.studentId;
      const learner = input.students.find(({ id }) => event.studentId === id);
      return Boolean(learner && input.teacherGroups.includes(learner.group));
    }
    const audience = event.groups ?? [];
    return role === "teacher" ? audience.some((group) => input.teacherGroups.includes(group)) : audience.includes(input.selectedGroup);
  }

  function canEdit(event, role, input) {
    return role === "owner" || (role === "teacher" && event.creator === role
      && (event.scope === "all" || (event.studentId
        ? canSee(event, role, input) : event.groups?.length > 0 && event.groups.every((group) => input.teacherGroups.includes(group)))));
  }

  function visibleEvents(role, input) {
    const authored = readEvents().map((event) => ({ ...event, source: "authored", type: event.kind === "event" || event.kind === "other" ? "academy" : event.kind }));
    const assignment = input.assignments.map((event) => ({ ...event, source: "assignment", type: "assignment" }));
    const school = input.schoolEvents.map((event) => ({ ...event, source: "school", type: "exam" }));
    const consultation = input.consultations.map((event) => ({ ...event, groups: event.group ? [event.group] : event.groups,
      source: "consultation", type: "consultation",
    }));
    return [...authored, ...assignment, ...school, ...consultation]
      .filter((event) => validDate(event.date) && canSee(event, role, input));
  }

  function visibleLessons(role, input) {
    return input.lessons.filter((lesson) => role === "owner" || (role === "teacher"
      ? input.teacherGroups.includes(lesson.groupKey ?? lesson.group) : (lesson.groupKey ?? lesson.group) === input.selectedGroup));
  }

  function regularLessons(date, lessons) {
    return lessons.filter((lesson) => lesson.day === weekdays[weekdayFor(date)]).map((lesson) => ({
      id: lesson.id, title: lesson.group, source: "regular", type: "lesson", date, time: lesson.time, room: lesson.room,
      teacher: lesson.teacher ? `${lesson.teacher} 선생님` : "",
    })).sort(compareEvents);
  }

  function compareEvents(a, b) {
    return Number(eventEnd(b) > b.date) - Number(eventEnd(a) > a.date)
      || (a.time ?? "").localeCompare(b.time ?? "") || a.date.localeCompare(b.date) || titleCompare(a.title, b.title);
  }

  function boundedEvents(start, end, events, lessons) {
    const visible = events.filter((event) => event.date <= end && eventEnd(event) >= start);
    for (let date = start; date <= end; date = shiftDay(date, 1)) visible.push(...regularLessons(date, lessons));
    return visible.filter((event) => !selectedFilters.size || selectedFilters.has(filterCategory[event.type] ?? event.type)).sort(compareEvents);
  }

  function dayLabel(date) {
    return `${shortDate(date)} ${weekdays[weekdayFor(date)]}요일`;
  }

  function icon(type) {
    const [, path] = categories[type];
    return `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  }

  function typeLabel(event) {
    if (event.type === "exam") return event.source === "school" ? "시험·수행평가" : "시험";
    if (event.type === "academy" && event.kind === "event") return "학원 행사";
    return categories[event.type][0];
  }

  function renderDate(date, column, className, inMonth) {
    const day = Number(date.slice(-2));
    return `<button type="button" class="${className}" data-v3-calendar-action="day" data-v3-date="${date}" data-v3-weekday="${column}"
      ${inMonth ? "" : ' data-v31-adjacent=""'} aria-label="${dayLabel(date)}${date === demoDate ? " · 오늘" : ""}"
      aria-pressed="${date === selectedDate}" aria-haspopup="dialog" ${date === demoDate ? 'aria-current="date"' : ""}><span>${day}</span></button>`;
  }

  // A single lane spans the clipped interval within each week; day overflow counts
  // events occupying tracks that are hidden at the current responsive breakpoint.
  function weekTracks(start, events) {
    const end = shiftDay(start, 6);
    const lanes = [];
    const overflow = Array.from({ length: 7 }, () => ({ mobile: 0, wide: 0 }));
    const bars = [];
    for (const event of events) {
      if (event.date > end || eventEnd(event) < start) continue;
      const from = event.date > start ? event.date : start;
      const through = eventEnd(event) < end ? eventEnd(event) : end;
      const first = dayDistance(start, from);
      const last = dayDistance(start, through);
      const mask = ((1 << (last - first + 1)) - 1) << first;
      let lane = lanes.findIndex((taken) => !(taken & mask));
      if (lane < 0) lane = lanes.length;
      lanes[lane] = (lanes[lane] ?? 0) | mask;
      if (lane >= 3) for (let column = first; column <= last; column++) {
        overflow[column].mobile += 1;
        if (lane >= 5) overflow[column].wide += 1;
      }
      if (lane < 5) bars.push({ event, from, through, first, last, lane });
    }
    return { bars, overflow };
  }

  function monthMarkup(gridStart, gridEnd, month, events) {
    const weeks = [];
    for (let start = gridStart; start <= gridEnd; start = shiftDay(start, 7)) {
      const { bars, overflow } = weekTracks(start, events);
      const cells = overflow.map(({ mobile, wide }, column) => {
        const date = shiftDay(start, column);
        const count = (value, style) => value ? `<button type="button" class="v31-overflow ${style}" data-v3-calendar-action="day" aria-haspopup="dialog"
          data-v3-date="${date}" aria-label="${dayLabel(date)} 그 외 ${value}개">${style === "v31-wide-count" ? `그 외 ${value}개` : `+${value}`}</button>` : "";
        return `<div class="v31-cell" data-v31-col="${column + 1}">${renderDate(date, column, "v31-cell-day", date.startsWith(month))}
          ${count(mobile, "v31-mobile-count")}${count(wide, "v31-wide-count")}</div>`;
      }).join("");
      const markup = bars.map(({ event, from, through, first, last, lane }) => {
        const adjacent = !from.startsWith(month) && !through.startsWith(month);
        return `<button type="button" class="v3-cal-bar" data-kind="${event.type}" data-v31-row="${lane + 1}" data-v31-first="${first + 1}"
          data-v31-last="${last + 2}" data-v31-start="${from}" data-v31-end="${through}" ${adjacent ? 'data-v31-adjacent=""' : ""}
          data-v3-calendar-action="event" data-v3-event="${escape(event.id)}" data-v3-source="${event.source}" data-v3-event-date="${from}"
          aria-label="${escape(`${shortDate(from)}${from === through ? "" : `–${shortDate(through)}`}, ${typeLabel(event)}, ${event.title}`)}">
          ${icon(event.type)}<span>${escape(event.title)}</span></button>`;
      }).join("");
      weeks.push(`<div class="v31-month-week" data-v31-week="${start}">${cells}${markup}</div>`);
    }
    return `<div class="v31-weekdays">${weekdays.map((day, index) => `<span data-v3-weekday="${index}">${day}</span>`).join("")}</div>
      <div class="v31-month-grid" data-v3-calendar-grid>${weeks.join("")}</div>`;
  }

  function eventMarkup(event, date) {
    const detail = [event.room, event.teacher, event.school].filter(Boolean).join(" · ");
    const time = event.time ? event.time.slice(0, 5) : "하루 종일";
    return `<li class="v3-cal-event" data-kind="${event.type}" data-v3-event-type="${event.source}">
      <button type="button" data-v3-calendar-action="event" data-v3-event="${escape(event.id)}" data-v3-source="${event.source}" data-v3-event-date="${date}">
        <span class="v31-event-icon" aria-label="${typeLabel(event)}">${icon(event.type)}</span>
        <span class="v3-cal-event-copy"><strong>${escape(event.title)}</strong>${detail ? `<small>${escape(detail)}</small>` : ""}</span>
        <span class="v3-cal-time">${escape(time)}</span>
      </button></li>`;
  }

  function weekMarkup(start, events) {
    const days = Array.from({ length: 7 }, (_, index) => shiftDay(start, index));
    const daysWithEvents = days.map((date) => ({ date, entries: events.filter((event) => coversDate(event, date)) }))
      .filter(({ entries }) => entries.length);
    const header = days.map((date, index) => `<div><span data-v3-weekday="${index}">${weekdays[index]}</span>
      ${renderDate(date, index, "v31-week-day", true)}</div>`).join("");
    return `<div data-v3-calendar-grid><div class="v31-week-days">${header}</div>
      <div class="v31-week-agenda">${daysWithEvents.length ? daysWithEvents.map(({ date, entries }) =>
        `<section><h3>${dayLabel(date)}${date === demoDate ? '<span class="v31-today-badge">오늘</span>' : ""}</h3>
          <ul>${entries.map((event) => eventMarkup(event, date)).join("")}</ul></section>`).join("")
        : '<p class="v3-cal-empty">이번 주 일정이 없어요.</p>'}</div></div>`;
  }

  function render(role, options, full = false) {
    if (role !== lastRole) {
      selectedDate = demoDate;
      view = "month";
      selectedFilters.clear();
    }
    lastRole = role;
    const input = optionsFor(role, options);
    const month = selectedDate.slice(0, 7);
    const [year, monthNumber] = month.split("-").map(Number);
    const firstOfMonth = `${month}-01`;
    const lastOfMonth = datePart(new Date(Date.UTC(year, monthNumber, 0)));
    const weekStart = shiftDay(selectedDate, -weekdayFor(selectedDate));
    const gridStart = view === "month" ? shiftDay(firstOfMonth, -weekdayFor(firstOfMonth)) : weekStart;
    const gridEnd = view === "month" ? shiftDay(lastOfMonth, 6 - weekdayFor(lastOfMonth)) : shiftDay(gridStart, 6);
    const events = boundedEvents(gridStart, gridEnd, visibleEvents(role, input), visibleLessons(role, input));
    const label = view === "month" ? `${year}년 ${monthNumber}월` : `${shortDate(gridStart)} – ${shortDate(gridEnd)}`;
    const period = view === "month" ? "달" : "주";
    const staff = isStaff(role);
    const title = full ? (staff ? "학원 캘린더" : "캘린더") : "캘린더";
    return `<section class="demo-v3-calendar" aria-labelledby="v3-cal-heading" data-v3-month="${month}" data-v3-view="${view}"${full ? ' data-v31-full=""' : ""}>
      <div class="v31-toolbar">
        <div class="v3-cal-title">
          ${full ? '<button type="button" class="v31-back" aria-label="뒤로 가기" data-v3-calendar-action="back">‹</button>' : ""}
          <h2 id="v3-cal-heading" tabindex="-1">${full ? title : `<button type="button" data-v3-calendar-action="full">${title}</button>`}</h2>
          <div class="v31-mode" role="group" aria-label="캘린더 보기">
            <button type="button" data-v3-calendar-action="view" data-v3-view-select="month" aria-pressed="${view === "month"}" aria-label="월 보기">월</button>
            <button type="button" data-v3-calendar-action="view" data-v3-view-select="week" aria-pressed="${view === "week"}" aria-label="주 보기">주</button>
          </div>
        </div>
        <div class="v3-cal-month">
          <div class="v31-period">
            <button type="button" data-v3-calendar-action="step" data-v3-direction="-1" aria-label="이전 ${period}">‹</button>
            <h3 aria-live="polite">${label}</h3>
            <button type="button" data-v3-calendar-action="step" data-v3-direction="1" aria-label="다음 ${period}">›</button>
          </div>
          <button type="button" class="v31-jump-today" data-v3-calendar-action="today">오늘</button>
        </div>
        <div class="v3-cal-filters" role="group" aria-label="일정 필터">
          <button type="button" data-v3-calendar-action="filter" data-v3-filter="all" aria-pressed="${!selectedFilters.size}">전체</button>
          ${Object.entries(filters).map(([key, name]) =>
            `<button type="button" data-v3-calendar-action="filter" data-v3-filter="${key}" aria-pressed="${selectedFilters.has(key)}"><i data-kind="${key}" aria-hidden="true"></i>${name}</button>`).join("")}
        </div>
      </div>
      ${view === "month" ? monthMarkup(gridStart, gridEnd, month, events) : weekMarkup(gridStart, events)}
      ${full && staff ? '<button class="v31-fab" type="button" data-v3-calendar-action="new" aria-label="일정 추가">＋ 일정</button>' : ""}
    </section>`;
  }

  function stepPeriod(direction) {
    let date;
    if (view === "week") date = shiftDay(selectedDate, direction * 7);
    else {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const target = new Date(Date.UTC(year, month - 1 + direction, 1));
      const length = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
      target.setUTCDate(Math.min(length, day));
      date = datePart(target);
    }
    if (date >= minimumDate && date <= maximumDate) selectedDate = date;
  }

  function contextRender(ctx, query) {
    const top = window.scrollY;
    ctx.rerender();
    window.scrollTo(0, top);
    if (query) document.querySelector(query)?.focus({ preventScroll: true });
  }

  function allowedTargets(role, input) {
    const groups = new Map();
    for (const lesson of input.lessons) {
      const key = lesson.groupKey ?? lesson.group;
      if (key) groups.set(key, lesson.group);
    }
    for (const { group } of input.students) {
      if (group && !groups.has(group)) groups.set(group, group);
    }
    if (role === "teacher") {
      for (const key of groups.keys()) if (!input.teacherGroups.includes(key)) groups.delete(key);
    }
    const students = input.students.filter((learner) => role === "owner" || groups.has(learner.group));
    return { groups, students };
  }

  function saveEvents(next) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 2, events: next }));
      return "";
    } catch { return "이 기기에 일정을 저장하지 못했어요. 다시 시도해 주세요."; }
  }

  function openEventSheet(control, ctx, input, existing, dateToEdit = selectedDate) {
    if (!ctx.openSheet || !isStaff(ctx.role) || (existing && !canEdit(existing, ctx.role, input))) return;
    const { groups, students } = allowedTargets(ctx.role, input);
    const scope = existing?.scope ?? (ctx.role === "teacher" && groups.size > 0 ? "classes" : "all");
    const checked = existing?.groups ?? (ctx.role === "teacher" ? [...groups.keys()].slice(0, 1) : []);
    const fields = `<div class="v3-cal-form" data-v3-editor>
      <label>제목<input name="title" required maxlength="120" value="${escape(existing?.title)}" placeholder="예: 목요일 보강 수업"></label>
      <fieldset class="v3-cal-kind"><legend>종류</legend>${Object.entries(kinds).map(([key, label]) =>
        `<label><input type="radio" name="kind" value="${key}"${(existing?.kind ?? "lesson") === key ? " checked" : ""}><span>${label}</span></label>`).join("")}</fieldset>
      <label>날짜<input type="date" name="date" min="2000-01-01" max="2099-12-31" value="${existing?.date ?? dateToEdit}" required></label>
      <label>종료 날짜 (선택)<input type="date" name="endDate" min="${existing?.date ?? dateToEdit}" max="2099-12-31"
        value="${escape(existing?.endDate)}"></label>
      <div class="v3-cal-form-time"><label>시간<input type="time" name="time" value="${escape(existing?.time ?? "17:00")}"${existing && !existing.time ? " disabled" : ""}></label>
        <label><input type="checkbox" name="allDay"${existing && !existing.time ? " checked" : ""}>하루 종일</label></div>
      <label>대상<select name="scope">${[["all", "전체"], ["classes", "반 여러 개"], ["student", "특정 학생"]].map(([key, label]) =>
        `<option value="${key}"${scope === key ? " selected" : ""}>${label}</option>`).join("")}</select></label>
      <fieldset data-v3-target="classes"${scope === "classes" ? "" : " hidden"}><legend>대상 반</legend>${Array.from(groups, ([key, name]) =>
        `<label><input type="checkbox" name="groups" value="${escape(key)}"${checked.includes(key) ? " checked" : ""}>${escape(name)}</label>`).join("")}</fieldset>
      <label data-v3-target="student"${scope === "student" ? "" : " hidden"}>학생<select name="studentId"><option value="">학생을 선택하세요</option>${students.map(({ id, name, group }) =>
        `<option value="${escape(id)}"${existing?.studentId === id ? " selected" : ""}>${escape(name)} · ${escape(group)}</option>`).join("")}</select></label>
      <label><input type="checkbox" name="reminder"${existing?.reminder === false ? "" : " checked"}>하루 전 오전 9시 앱 안 알림</label>
      <details class="v3-cal-detail-toggle"><summary>장소·담당 (선택)</summary>
        <div class="v3-cal-form-detail"><label>장소<input name="room" maxlength="80" value="${escape(existing?.room)}"></label>
          <label>담당<input name="teacher" maxlength="80" value="${escape(existing?.teacher)}"></label></div></details>
      ${existing ? `<button class="v3-cal-delete text-button danger" type="button" data-v3-calendar-action="delete" data-v3-event="${escape(existing.id)}">일정 삭제</button>` : ""}
    </div>`;
    ctx.openSheet(existing ? "일정 수정" : "일정 추가", fields, (data) => {
      const title = String(data.get("title") ?? "").trim();
      const kind = data.get("kind");
      const date = String(data.get("date") ?? "");
      const endDate = String(data.get("endDate") ?? "");
      const time = data.has("allDay") ? "" : String(data.get("time") ?? "");
      const targetScope = data.get("scope");
      const targetedGroups = targetScope === "classes" ? [...new Set(data.getAll("groups"))] : [];
      const studentId = targetScope === "student" ? String(data.get("studentId") ?? "") : "";
      if (!title || title.length > 120) return "제목을 1~120자로 입력해 주세요.";
      if (!Object.hasOwn(kinds, kind) || !validDate(date) || (endDate && (!validDate(endDate) || endDate < date)) || (!data.has("allDay") && !validTime(time))) return "날짜와 시간을 확인해 주세요.";
      if (!["all", "classes", "student"].includes(targetScope)
        || (targetScope === "classes" && (!targetedGroups.length || !targetedGroups.every((group) => groups.has(group))))
        || (targetScope === "student" && !students.some(({ id }) => studentId === id))) return "일정을 볼 반이나 학생을 선택해 주세요.";
      const latest = readEvents();
      const previous = latest.find(({ id }) => id === existing?.id);
      if (existing && (!previous || !canEdit(previous, ctx.role, input))) return "일정의 변경을 확인한 뒤 다시 시도해 주세요.";
      const record = {
        id: previous?.id ?? `event-${crypto.randomUUID()}`, title, kind, date, ...(endDate ? { endDate } : {}), time, scope: targetScope,
        groups: targetedGroups, studentId, room: String(data.get("room") ?? "").trim().slice(0, 80),
        teacher: String(data.get("teacher") ?? "").trim().slice(0, 80), reminder: data.has("reminder"), creator: previous?.creator ?? ctx.role,
      };
      const error = saveEvents([...latest.filter((event) => event.id !== record.id), record]);
      if (error) return error;
      selectedDate = date;
      selectedFilters.clear();
      contextRender(ctx);
      return "";
    }, control, { confirmLabel: existing ? "수정 저장" : "일정 저장" });
    const editor = document.querySelector("[data-v3-editor]");
    if (!editor) return;
    editor.addEventListener("change", ({ target }) => {
      if (target.name === "scope") for (const group of editor.querySelectorAll("[data-v3-target]")) {
        group.hidden = target.value !== group.dataset.v3Target;
      }
      if (target.name === "date") editor.querySelector('input[name="endDate"]').min = target.value;
      if (target.name === "allDay") editor.querySelector('input[name="time"]').disabled = target.checked;
    });
  }

  function afterClose(control, action) {
    const sheet = control.closest?.("dialog");
    if (!sheet?.open) { action(); return; }
    sheet.addEventListener("close", action, { once: true });
    sheet.close();
  }

  function nextLesson(date, authored, lessons) {
    const future = authored.filter((event) => event.date > date && ["lesson", "makeup"].includes(event.type));
    for (let offset = 1; offset <= 7; offset++) {
      const next = regularLessons(shiftDay(date, offset), lessons);
      if (!next.length) continue;
      future.push(next[0]);
      break;
    }
    return future.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))[0];
  }

  function openDaySheet(control, ctx, input, date) {
    const authored = visibleEvents(ctx.role, input);
    const allLessons = visibleLessons(ctx.role, input);
    const entries = [...authored.filter((event) => coversDate(event, date)), ...regularLessons(date, allLessons)].sort(compareEvents);
    const next = entries.some((event) => event.type === "lesson" || event.type === "makeup") ? null : nextLesson(date, authored, allLessons);
    const nextLabel = next ? `<p class="v31-next">다음 수업: ${Number(next.date.slice(-2))}일(${weekdays[weekdayFor(next.date)]}) ${escape(next.time?.slice(0, 5) || "")}</p>` : "";
    ctx.openSheet?.(dayLabel(date), `<div class="v3-cal-day-list">
      <p class="v31-day-count">일정 ${entries.length}개${date === demoDate ? " · 오늘" : ""}</p>
      ${entries.length ? `<ul>${entries.map((event) => eventMarkup(event, date)).join("")}</ul>` : '<p class="v3-cal-empty">오늘은 예정된 일정이 없어요.</p>'}
      ${nextLabel}
      ${isStaff(ctx.role) ? `<button type="button" class="v31-day-add" data-v3-calendar-action="new" data-v3-date="${date}">＋ 일정 추가</button>` : ""}
    </div>`, null, control, { closeOnly: true });
  }

  function showEvent(control, ctx, input) {
    const { v3Event: id, v3Source: source, v3EventDate: date } = control.dataset;
    if (!validDate(date)) return;
    const projected = source === "regular" ? regularLessons(date, visibleLessons(ctx.role, input)) : visibleEvents(ctx.role, input);
    const event = projected.find((entry) => entry.id === id && entry.source === source && coversDate(entry, date));
    if (!event) return;
    const dateRange = eventEnd(event) > event.date ? `${shortDate(event.date)} – ${shortDate(eventEnd(event))}` : dayLabel(event.date);
    const detail = [event.room, event.teacher, event.school].filter(Boolean).join(" · ");
    const related = { regular: "schedule", assignment: "learning", school: "school-schedule", consultation: isStaff(ctx.role) ? "students" : "home" }[source];
    const editing = source === "authored" && canEdit(event, ctx.role, input);
    afterClose(control, () => ctx.openSheet?.(event.title, `<div class="v31-event-details" data-kind="${event.type}">
      <p><span class="v31-event-icon" aria-hidden="true">${icon(event.type)}</span> ${typeLabel(event)}</p>
      <p>${dateRange} · ${escape(event.time?.slice(0, 5) || "하루 종일")}</p>
      ${detail ? `<p>${escape(detail)}</p>` : ""}
      ${editing ? `<button type="button" class="v31-day-add" data-v3-calendar-action="edit" data-v3-event="${escape(id)}">일정 수정</button>
        <button type="button" class="v31-delete" data-v3-calendar-action="delete" data-v3-event="${escape(id)}">일정 삭제</button>` : ""}
      ${related ? `<button type="button" class="v31-day-add" data-v3-calendar-action="related" data-v3-related="${related}">관련 화면 보기</button>` : ""}
    </div>`, null, control, { closeOnly: true }));
  }

  function deleteEvent(control, ctx, input) {
    const id = control.dataset.v3Event;
    const event = readEvents().find((entry) => entry.id === id);
    if (!event || !canEdit(event, ctx.role, input) || !ctx.openDialog) return;
    afterClose(control, () => ctx.openDialog("일정 삭제", `<p>‘${escape(event.title)}’ 일정을 삭제할까요?</p>`, "삭제", () => {
      const latest = readEvents();
      const current = latest.find((entry) => entry.id === id);
      if (!current || !canEdit(current, ctx.role, input)) return false;
      const error = saveEvents(latest.filter((entry) => entry.id !== id));
      if (error) { ctx.announce?.(error); return false; }
      contextRender(ctx);
      ctx.announce?.("일정을 삭제했어요.");
    }, true));
  }

  function openFull(ctx) {
    if (ctx.screen !== "academy-calendar") returnScreen = ctx.screen || "home";
    ctx.navigate?.("academy-calendar");
  }

  function handle(control, ctx) {
    const action = control.dataset.v3CalendarAction;
    if (!action) return false;
    const input = optionsFor(ctx.role, ctx.options);
    if (action === "day" && validDate(control.dataset.v3Date)) {
      const date = control.dataset.v3Date;
      const selector = `[data-v3-calendar-action="day"][data-v3-date="${date}"]`;
      if (date !== selectedDate) {
        selectedDate = date;
        contextRender(ctx, selector);
      }
      const opener = document.querySelector(selector) ?? control;
      openDaySheet(opener, ctx, input, date);
    } else if (action === "filter") {
      const key = control.dataset.v3Filter;
      if (key === "all") selectedFilters.clear();
      else if (Object.hasOwn(filters, key) && !selectedFilters.delete(key)) selectedFilters.add(key);
      if (key === "all" || Object.hasOwn(filters, key)) contextRender(ctx, `[data-v3-filter="${key}"]`);
    } else if (action === "view" && ["month", "week"].includes(control.dataset.v3ViewSelect)) {
      view = control.dataset.v3ViewSelect;
      contextRender(ctx, `[data-v3-view-select="${view}"]`);
    } else if (action === "today") {
      selectedDate = demoDate;
      contextRender(ctx, '[data-v3-calendar-action="today"]');
    } else if (["month", "step"].includes(action) && ["1", "-1"].includes(control.dataset.v3Direction)) {
      stepPeriod(Number(control.dataset.v3Direction));
      contextRender(ctx, `[data-v3-direction="${control.dataset.v3Direction}"]`);
    } else if (action === "full") openFull(ctx);
    else if (action === "back") ctx.navigate?.(returnScreen);
    else if (action === "new" && isStaff(ctx.role)) {
      const day = control.dataset.v3Date;
      afterClose(control, () => openEventSheet(control, ctx, input, undefined, validDate(day) ? day : selectedDate));
    } else if (action === "event") showEvent(control, ctx, input);
    else if (action === "edit") {
      const event = readEvents().find(({ id }) => id === control.dataset.v3Event);
      if (event) afterClose(control, () => openEventSheet(control, ctx, input, event));
    } else if (action === "delete") deleteEvent(control, ctx, input);
    else if (action === "related" && ["schedule", "learning", "school-schedule", "students", "home"].includes(control.dataset.v3Related)) {
      afterClose(control, () => ctx.navigate?.(control.dataset.v3Related));
    }
    return true;
  }

  function enhance(root, ctx) {
    const grid = root.querySelector("[data-v3-calendar-grid]");
    if (!grid || grid.hasAttribute("data-v3-swipe")) return;
    grid.dataset.v3Swipe = "";
    let pointer;
    grid.addEventListener("pointerdown", (event) => {
      if (event.isPrimary && event.pointerType === "touch") pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    grid.addEventListener("pointercancel", () => { pointer = undefined; });
    grid.addEventListener("pointerup", (event) => {
      if (pointer?.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = undefined;
      if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
      event.preventDefault();
      stepPeriod(dx < 0 ? 1 : -1);
      contextRender(ctx);
    });
  }

  function reminders(role, options) {
    const tomorrow = shiftDay(demoDate, 1);
    return visibleEvents(role, optionsFor(role, options))
      .filter((event) => event.source === "authored" && event.reminder && event.date === tomorrow)
      .map((event) => ({ id: event.id, title: event.title, topic: `내일 · ${event.title}`, date: demoDate, time: "09:00" }));
  }

  function reset() {
    selectedDate = demoDate;
    view = "month";
    selectedFilters.clear();
    lastRole = undefined;
    try { localStorage.removeItem(storageKey); } catch { /* Demo storage may be unavailable. */ }
  }
  window.DemoHomeCalendar = { render, handle, enhance, reminders, reset, openFull };
})();
