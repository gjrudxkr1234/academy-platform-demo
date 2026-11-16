/* Synthetic calendar shared by the local role demos. No network or real academy data. */
(() => {
  "use strict";

  const demoDate = "2026-11-16";
  const storageKey = "gradient-demo-home-v3-events";
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const kinds = {
    lesson: "수업", makeup: "보강", event: "학원 행사", closure: "휴원", exam: "학원 시험", other: "기타",
  };
  const filters = { all: "전체", academy: "학원", personal: "나" };
  const initials = [
    { id: "demo-v3-clinic", title: "중2 심화반 보강", kind: "makeup", date: "2026-11-19", time: "17:40",
      room: "강의실 A", teacher: "이도현 선생님", scope: "classes", groups: ["중2 심화반"], creator: "owner", reminder: true },
    { id: "demo-v3-exam", title: "중1 개념반 단원 시험", kind: "exam", date: "2026-11-21", time: "11:00",
      room: "강의실 B", teacher: "김하람 선생님", scope: "classes", groups: ["중1 개념반"], creator: "owner", reminder: true },
    { id: "demo-v3-break", title: "학원 정기 휴원", kind: "closure", date: "2026-11-23", time: "",
      scope: "all", creator: "owner", reminder: true },
    { id: "demo-v3-open", title: "수학 학습 설명회", kind: "event", date: "2026-11-27", time: "19:00",
      room: "상담실", scope: "all", creator: "owner", reminder: true },
  ];
  let month = demoDate.slice(0, 7);
  let selectedDate = demoDate;
  let filter = "all";
  let lastRole;
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
  const validDate = (value) => /^20\d{2}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && datePart(new Date(value)) === value;
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
      return Array.isArray(saved) ? saved.filter((event) => event && validDate(event.date)
        && typeof event.title === "string" && typeof event.id === "string"
        && Object.hasOwn(kinds, event.kind) && ["all", "classes", "student"].includes(event.scope)
        && (event.scope !== "classes" || (Array.isArray(event.groups) && event.groups.every((group) => typeof group === "string")))
        && (event.scope !== "student" || typeof event.studentId === "string")) : initials;
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
    const authored = readEvents().map((event) => ({ ...event, source: "authored",
      category: event.scope === "student" ? "personal" : "academy", tag: event.scope === "student" ? "personal" : "academy",
    }));
    const assignment = input.assignments.map((event) => ({ ...event, source: "assignment", category: "personal", tag: "personal" }));
    const school = input.schoolEvents.map((event) => ({ ...event, source: "school", category: "personal", tag: "school" }));
    const consultation = input.consultations.map((event) => ({ ...event, groups: event.group ? [event.group] : event.groups,
      source: "consultation", category: "personal", tag: "personal",
    }));
    return [...authored, ...assignment, ...school, ...consultation]
      .filter((event) => validDate(event.date) && canSee(event, role, input))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "") || a.title.localeCompare(b.title, "ko"));
  }

  function visibleLessons(role, input) {
    return input.lessons.filter((lesson) => role === "owner" || (role === "teacher"
      ? input.teacherGroups.includes(lesson.groupKey ?? lesson.group) : (lesson.groupKey ?? lesson.group) === input.selectedGroup));
  }

  function regularLessons(date, lessons) {
    return lessons.filter((lesson) => lesson.day === weekdays[weekdayFor(date)]).map((lesson) => ({
      id: lesson.id, title: lesson.group, source: "regular", date, time: lesson.time, room: lesson.room,
      teacher: lesson.teacher ? `${lesson.teacher} 선생님` : "", tag: "regular",
    })).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }

  function categoryLabel(category, role) {
    return category === "personal" && isStaff(role) ? "학생" : filters[category];
  }

  function monthDate() {
    const [year, currentMonth] = month.split("-").map(Number);
    return { year, currentMonth };
  }

  function monthLabel() {
    const { year, currentMonth } = monthDate();
    return `${year}년 ${currentMonth}월`;
  }

  function dayButtons(events, role) {
    const { year, currentMonth } = monthDate();
    const length = new Date(Date.UTC(year, currentMonth, 0)).getUTCDate();
    const blank = weekdayFor(month + "-01");
    const dots = new Map();
    for (const { date, category } of events) {
      if (!date.startsWith(month) || (filter !== "all" && category !== filter)) continue;
      if (!dots.has(date)) dots.set(date, new Set());
      dots.get(date).add(category);
    }
    const days = Array.from({ length }, (_, index) => {
      const day = index + 1;
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const categories = [...(dots.get(date) ?? [])].sort();
      const names = categories.map((category) => categoryLabel(category, role) + " 일정");
      if (date === demoDate) names.unshift("오늘");
      const dayLabel = [`${shortDate(date)} ${weekdays[(blank + index) % 7]}요일`, ...names].join(" · ");
      return `<button type="button" class="v3-cal-day" data-v3-calendar-action="day" data-v3-date="${date}" data-v3-weekday="${(blank + index) % 7}"
        aria-label="${dayLabel}" aria-pressed="${date === selectedDate}"${date === demoDate ? ' aria-current="date"' : ""}${date < demoDate ? ' data-past=""' : ""}>
          <span>${day}</span><span class="v3-cal-dots" aria-hidden="true">${categories.map((category) => `<i data-v3-dot="${category}"></i>`).join("")}</span>
        </button>`;
    });
    const tail = (7 - (blank + length) % 7) % 7;
    return '<span aria-hidden="true"></span>'.repeat(blank) + days.join("") + '<span aria-hidden="true"></span>'.repeat(tail);
  }

  function eventLabel(event, role) {
    if (event.tag === "school") return "학교";
    if (event.tag === "regular") return "정규 수업";
    return categoryLabel(event.tag, role);
  }

  function eventMarkup(event, role, input) {
    const detail = [event.room, event.teacher, event.school].filter(Boolean).join(" · ");
    const time = event.time || "하루 종일";
    const tag = eventLabel(event, role);
    const copy = `<span class="v3-cal-time">${escape(time)}</span><span class="v3-cal-event-copy"><strong>${escape(event.title)}</strong>
      ${detail ? `<small>${escape(detail)}</small>` : ""}</span><span class="v3-cal-event-tag">${tag}</span>`;
    let action = "";
    if (event.source === "authored") action = `data-v3-calendar-action="event" data-v3-event="${escape(event.id)}"`;
    if (event.source === "assignment") action = role === "student" ? `data-action="submit-homework" data-id="${escape(event.id)}"` : 'data-action="navigate" data-id="learning"';
    if (event.source === "school") action = 'data-action="navigate" data-id="school-schedule"';
    if (event.source === "consultation" && role === "parent") action = 'data-action="demo-consultation"';
    if (event.source === "consultation" && isStaff(role)) action = 'data-action="navigate" data-id="students"';
    return `<li class="v3-cal-event" data-v3-event-type="${event.tag}"${event.source === "authored" && canEdit(event, role, input) ? ' data-v3-editable=""' : ""}>
      ${action ? `<button type="button" ${action}>${copy}</button>` : `<div>${copy}</div>`}</li>`;
  }

  function render(role, options) {
    const input = optionsFor(role, options);
    if (role !== lastRole) filter = "all";
    lastRole = role;
    const events = visibleEvents(role, input);
    const shown = events.filter((event) => filter === "all" || event.category === filter);
    const lessons = filter === "personal" ? [] : visibleLessons(role, input);
    const regular = regularLessons(selectedDate, lessons);
    const today = [...shown.filter((event) => event.date === selectedDate), ...regular]
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    const nextDated = shown.find((event) => event.date > selectedDate);
    let next = nextDated;
    for (let offset = 1; offset <= 7; offset++) {
      const nextClass = regularLessons(shiftDay(selectedDate, offset), lessons)[0];
      if (!nextClass) continue;
      if (!next || nextClass.date < next.date) next = nextClass;
      break;
    }
    const label = `${shortDate(selectedDate)} ${weekdays[weekdayFor(selectedDate)]}요일`;
    const add = isStaff(role);
    return `<section class="demo-v3-calendar" aria-labelledby="v3-cal-heading" data-v3-month="${month}">
      <div class="v3-cal-title"><h2 id="v3-cal-heading" tabindex="-1">캘린더</h2>
        <div>${add ? '<button class="v3-cal-add" type="button" data-v3-calendar-action="new"><span aria-hidden="true">＋</span> 일정</button>' : ""}
          <button class="v3-cal-link" type="button" data-action="navigate" data-id="schedule">전체 시간표 <span aria-hidden="true">›</span></button></div></div>
      <div class="v3-cal-filters" role="group" aria-label="일정 필터">${Object.keys(filters).map((category) =>
        `<button type="button" data-v3-calendar-action="filter" data-v3-filter="${category}" aria-pressed="${filter === category}">${category === "all" ? "" : `<i data-v3-dot="${category}" aria-hidden="true"></i>`}${categoryLabel(category, role)}</button>`).join("")}</div>
      <div class="v3-cal-month">
        <button type="button" data-v3-calendar-action="month" data-v3-direction="-1" aria-label="이전 달">‹</button>
        <h3 aria-live="polite">${monthLabel()}</h3>
        <button type="button" data-v3-calendar-action="month" data-v3-direction="1" aria-label="다음 달">›</button>
      </div>
      <div class="v3-cal-grid" data-v3-calendar-grid>
        ${weekdays.map((day, index) => `<span class="v3-cal-weekday" data-v3-weekday="${index}">${day}</span>`).join("")}
        ${dayButtons(events, role)}
      </div>
      <div class="v3-cal-day-list" aria-label="${label} 일정" aria-live="polite"><h3>${label} 일정</h3>
        ${today.length ? `<ul>${today.map((event) => eventMarkup(event, role, input)).join("")}</ul>`
    : `<p class="v3-cal-empty">일정 없음${next ? `<span> · 다음 일정: ${shortDate(next.date)} ${escape(next.title)}</span>` : ""}</p>`}
      </div>
    </section>`;
  }

  function shiftMonth(direction) {
    const { year, currentMonth } = monthDate();
    const destination = new Date(Date.UTC(year, currentMonth - 1 + direction, 1));
    if (destination.getUTCFullYear() < 2000 || destination.getUTCFullYear() > 2099) return false;
    month = datePart(destination).slice(0, 7);
    const max = new Date(Date.UTC(destination.getUTCFullYear(), destination.getUTCMonth() + 1, 0)).getUTCDate();
    const day = Math.min(Number(selectedDate.slice(-2)), max);
    selectedDate = `${month}-${String(day).padStart(2, "0")}`;
    return true;
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
      localStorage.setItem(storageKey, JSON.stringify(next));
      return "";
    } catch { return "이 기기에 일정을 저장하지 못했어요. 다시 시도해 주세요."; }
  }

  function openEventSheet(control, ctx, input, existing) {
    if (!ctx.openSheet || !isStaff(ctx.role) || (existing && !canEdit(existing, ctx.role, input))) return;
    const { groups, students } = allowedTargets(ctx.role, input);
    const scope = existing?.scope ?? (ctx.role === "teacher" && groups.size > 0 ? "classes" : "all");
    const checked = existing?.groups ?? (ctx.role === "teacher" ? [...groups.keys()].slice(0, 1) : []);
    const fields = `<div class="v3-cal-form" data-v3-editor>
      <label>제목<input name="title" required maxlength="120" value="${escape(existing?.title)}" placeholder="예: 목요일 보강 수업"></label>
      <fieldset class="v3-cal-kind"><legend>종류</legend>${Object.entries(kinds).map(([key, label]) =>
        `<label><input type="radio" name="kind" value="${key}"${(existing?.kind ?? "lesson") === key ? " checked" : ""}><span>${label}</span></label>`).join("")}</fieldset>
      <label>날짜<input type="date" name="date" min="2000-01-01" max="2099-12-31" value="${existing?.date ?? selectedDate}" required></label>
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
      const time = data.has("allDay") ? "" : String(data.get("time") ?? "");
      const targetScope = data.get("scope");
      const targetedGroups = targetScope === "classes" ? [...new Set(data.getAll("groups"))] : [];
      const studentId = targetScope === "student" ? String(data.get("studentId") ?? "") : "";
      if (!title || title.length > 120) return "제목을 1~120자로 입력해 주세요.";
      if (!Object.hasOwn(kinds, kind) || !validDate(date) || (!data.has("allDay") && !validTime(time))) return "날짜와 시간을 확인해 주세요.";
      if (!["all", "classes", "student"].includes(targetScope)
        || (targetScope === "classes" && (!targetedGroups.length || !targetedGroups.every((group) => groups.has(group))))
        || (targetScope === "student" && !students.some(({ id }) => studentId === id))) return "일정을 볼 반이나 학생을 선택해 주세요.";
      const latest = readEvents();
      const previous = latest.find(({ id }) => id === existing?.id);
      if (existing && (!previous || !canEdit(previous, ctx.role, input))) return "일정의 변경을 확인한 뒤 다시 시도해 주세요.";
      const record = {
        id: previous?.id ?? `event-${crypto.randomUUID()}`, title, kind, date, time, scope: targetScope,
        groups: targetedGroups, studentId, room: String(data.get("room") ?? "").trim().slice(0, 80),
        teacher: String(data.get("teacher") ?? "").trim().slice(0, 80), reminder: data.has("reminder"), creator: previous?.creator ?? ctx.role,
      };
      const error = saveEvents([...latest.filter((event) => event.id !== record.id), record]);
      if (error) return error;
      selectedDate = date;
      month = date.slice(0, 7);
      filter = "all";
      contextRender(ctx);
      return "";
    }, control, { confirmLabel: existing ? "수정 저장" : "일정 저장" });
    const editor = document.querySelector("[data-v3-editor]");
    if (!editor) return;
    editor.addEventListener("change", ({ target }) => {
      if (target.name === "scope") for (const group of editor.querySelectorAll("[data-v3-target]")) {
        group.hidden = target.value !== group.dataset.v3Target;
      }
      if (target.name === "allDay") editor.querySelector('input[name="time"]').disabled = target.checked;
    });
  }

  function showEvent(control, ctx, input) {
    const event = readEvents().find(({ id }) => id === control.dataset.v3Event);
    if (!event || !canSee(event, ctx.role, input)) return;
    if (canEdit(event, ctx.role, input)) {
      openEventSheet(control, ctx, input, event);
      return;
    }
    const detail = [event.room, event.teacher].filter(Boolean).join(" · ");
    ctx.openDialog?.(event.title, `<p>${shortDate(event.date)} · ${escape(event.time || "하루 종일")} · ${escape(kinds[event.kind])}</p>
      ${detail ? `<p>${escape(detail)}</p>` : ""}`);
  }

  function deleteEvent(control, ctx, input) {
    const id = control.dataset.v3Event;
    const event = readEvents().find((entry) => entry.id === id);
    if (!event || !canEdit(event, ctx.role, input) || !ctx.openDialog) return;
    const sheet = control.closest("dialog");
    if (sheet?.open) sheet.close();
    ctx.openDialog("일정 삭제", `<p>‘${escape(event.title)}’ 일정을 삭제할까요?</p>`, "삭제", () => {
      const latest = readEvents();
      const current = latest.find((entry) => entry.id === id);
      if (!current || !canEdit(current, ctx.role, input)) return false;
      const error = saveEvents(latest.filter((entry) => entry.id !== id));
      if (error) { ctx.announce?.(error); return false; }
      contextRender(ctx);
      ctx.announce?.("일정을 삭제했어요.");
    }, true);
  }

  function handle(control, ctx) {
    const action = control.dataset.v3CalendarAction;
    if (!action) return false;
    const input = optionsFor(ctx.role, ctx.options);
    if (action === "day" && control.dataset.v3Date?.startsWith(month) && validDate(control.dataset.v3Date)) {
      selectedDate = control.dataset.v3Date;
      contextRender(ctx, `[data-v3-date="${selectedDate}"]`);
    } else if (action === "filter" && Object.hasOwn(filters, control.dataset.v3Filter)) {
      filter = control.dataset.v3Filter;
      contextRender(ctx, `[data-v3-filter="${filter}"]`);
    } else if (action === "month" && ["1", "-1"].includes(control.dataset.v3Direction)) {
      if (shiftMonth(Number(control.dataset.v3Direction))) contextRender(ctx, `[data-v3-direction="${control.dataset.v3Direction}"]`);
    } else if (action === "new") openEventSheet(control, ctx, input);
    else if (action === "event") showEvent(control, ctx, input);
    else if (action === "delete") deleteEvent(control, ctx, input);
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
      if (shiftMonth(dx < 0 ? 1 : -1)) contextRender(ctx);
    });
  }

  function reminders(role, options) {
    const tomorrow = shiftDay(demoDate, 1);
    return visibleEvents(role, optionsFor(role, options))
      .filter((event) => event.source === "authored" && event.reminder && event.date === tomorrow)
      .map((event) => ({ id: event.id, title: event.title, topic: `내일 · ${event.title}`, date: demoDate, time: "09:00" }));
  }

  function reset() {
    month = demoDate.slice(0, 7);
    selectedDate = demoDate;
    filter = "all";
    lastRole = undefined;
    try { localStorage.removeItem(storageKey); } catch { /* Demo storage may be unavailable. */ }
  }
  window.DemoHomeCalendar = { render, handle, enhance, reminders, reset };
})();
