/* List views for the synthetic teacher, student and family apps. */
(() => {
  "use strict";
  const glyphs = {
    arrow:'<path d="m9 6 6 6-6 6"/>',
    bell:'<path d="M5 17h14l-1.5-3V9a5.5 5.5 0 0 0-11 0v5zM10 20h4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="3"/>',
    chart:'<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V5"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    edit:'<path d="m4 16 12-12 4 4L8 20H4zM14 6l4 4"/>',
    file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
    megaphone:'<path d="M4 10v4h4l9 4V6l-9 4zm4 4 2 5"/>',
    play:'<path d="m9 6 10 6-10 6z" fill="currentColor" stroke="none"/>',
    qr:'<path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><path d="M7 14h3v3H7zM14 14h3v3h-3z"/>',
    send:'<path d="m3 11 18-8-7 18-3-7zM11 14 21 3"/>',
    wallet:'<path d="M20 9V6H6a2 2 0 0 0 0 4h14v10H6a2 2 0 0 1-2-2V8m16 6h-4"/>',
  };
  const icon = name => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]}</svg>`;
  const escape = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const action = (name, id, task) => `data-action="${name}"${id ? ` data-id="${escape(id)}"` : ""}${task ? ` data-task-id="${escape(task)}"` : ""}`;
  const go = id => action("navigate", id);
  const chip = (label, tone = "neutral") => `<span class="c-chip c-chip-${tone}">${escape(label)}</span>`;
  const control = (label, attrs, { symbol, primary = false, pill = false } = {}) =>
    `<button type="button" class="c-control${primary ? " c-primary" : ""}${pill ? " c-pill" : ""}"
      ${primary ? 'data-action-level="primary"' : ""} ${attrs}>${symbol ? icon(symbol) : ""}${escape(label)}</button>`;
  const picture = ({ symbol, initial, play }) => play !== undefined
    ? `<span class="c-thumbnail">${icon("play")}<progress max="100" value="${play}" aria-hidden="true"></progress></span>`
    : `<span class="c-glyph${initial ? " c-initial" : ""}" aria-hidden="true">${initial ? escape(initial) : icon(symbol ?? "file")}</span>`;
  const copy = (title, detail) => `<span class="c-copy"><strong>${escape(title)}</strong>${detail ? `<small>${escape(detail)}</small>` : ""}</span>`;
  const chevron = () => `<span class="c-chevron">${icon("arrow")}</span>`;
  const key = value => value ? ` id="c-row-${escape(value)}"` : "";
  function row(options) {
    const body = picture(options) + copy(options.title, options.detail) + (options.end || "")
      + (options.attrs ? chevron() : "");
    return options.attrs
      ? `<button type="button"${key(options.key)} class="c-row" ${options.attrs}>${body}</button>`
      : `<div${key(options.key)} class="c-row">${body}</div>`;
  }
  const empty = (label = "기록이 없어요.") => `<p class="c-empty">${escape(label)}</p>`;
  const block = markup => `<div class="c-block">${markup}</div>`;
  const section = (title, markup, id = "") =>
    `<section class="c-section"${id ? ` id="c-row-${id}"` : ""}><h2>${escape(title)}</h2>${markup}</section>`;
  const rows = (items, missing) => block(items.join("") || empty(missing));
  const alertList = alerts => alerts.length
    ? `<nav class="c-alerts" aria-label="처리할 일">${alerts.map(({ label, id }) =>
      `<button type="button" ${action("block-jump",id)}><i aria-hidden="true"></i>${escape(label)}</button>`).join("")}</nav>` : "";
  const heading = (title, context) =>
    `<header class="c-head"><h1>${escape(title)}</h1>${context ? `<span>${escape(context)}</span>` : ""}</header>`;
  const page = (name, title, context, body, children = "") =>
    `<div class="c-tabs" data-block-tab="${name}">${heading(title, context)}${children}${body}</div>`;
  const tiles = options => `<div class="c-tiles">${options.map(({ title, detail, symbol, attrs, urgent }) =>
    `<button type="button" class="c-tile" ${attrs}>${icon(symbol)}<strong>${escape(title)}</strong><small${urgent ? ' class="c-urgent"' : ""}>${escape(detail)}</small></button>`).join("")}</div>`;
  const metrics = options => `<dl class="c-metrics">${options.map(({ label, value, suffix = "", urgent = false }) =>
    `<div><dt>${escape(label)}</dt><dd${urgent ? ' class="c-urgent"' : ""}>${escape(value)}${suffix ? `<small>${escape(suffix)}</small>` : ""}</dd></div>`).join("")}</dl>`;
  const nameInitial = person => person.name.slice(0, 1);
  const clockText = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const historyTask = { id:"past-polynomials", title:"방정식 단원 정리", due:"11월 12일", detail:"11월 12일 제출 · 선생님 확인" };
  const film = { id:"linear-video", fallback:{ id:"slope-video", title:"기울기와 y절편", minutes:9 } };
  const checklist = {
    submitted: ["제출 완료", "done"], reviewed: ["확인 완료", "done"], returned: ["재제출", "urgent"],
  };
  const submissionFor = (context, task, id) =>
    (task.id === context.tasks[0].id ? context.state.submissions : context.state.reviewSubmissions)[id];
  const submissionState = (submission, isDue) => checklist[submission?.status] ?? (isDue ? ["오늘 마감", "urgent"] : ["미제출","neutral"]);

  function taskItem(context, task, id, interactive) {
    const [label, tone] = submissionState(submissionFor(context, task, id), task === context.tasks[0]);
    const isDue = label === "오늘 마감";
    return row({ title:task.title, detail:`${task.due}${task.due.endsWith("마감") ? "" : " 마감"}${interactive && task === context.tasks[0] ? " · 풀이 사진" : ""}`,
      end:chip(isDue && !interactive ? "미제출" : label, tone), symbol:task === context.tasks[0] ? "camera" : "file", key:task.id,
      attrs:interactive ? action("submit-homework",task.id) : action("block-task-info",task.id) });
  }

  function archivedTask(interactive) {
    return row({ title:historyTask.title, detail:historyTask.detail, symbol:"check", end:chip("확인 완료","done"),
      attrs:action("block-task-info", historyTask.id), key:interactive ? "completed" : "" });
  }

  function studentLearning(context) {
    const id = context.learner.id;
    const waiting = context.tasks.filter(task => submissionFor(context, task, id)?.status !== "reviewed");
    const archived = context.tasks.filter(task => submissionFor(context, task, id)?.status === "reviewed");
    const progress = Math.max(0, Math.min(100, Number(context.state.progress[id]) || 0));
    const today = submissionFor(context, context.tasks[0], id)?.status;
    const alerts = [];
    if (!today || today === "returned") alerts.push({ label:"오늘 마감 1개", id:context.tasks[0].id });
    if (progress < 90) alerts.push({ label:"남은 영상 1개", id:"videos" });
    const videos = [
      { id:film.id, title:context.video.title, minutes:context.video.minutes, progress },
      { ...film.fallback, progress:100 },
    ].map(item => row({ title:item.title, play:item.progress, attrs:action("watch-video",item.id),
      detail:`${item.minutes}분 · ${item.progress >= 90 ? "다 봤어요" : item.progress ? `${clockText(Math.round(item.minutes * 60 * item.progress / 100))}부터 이어 보기` : "아직 안 봤어요"}`,
      end:item.progress >= 90 ? chip("완료", "done") : `<strong class="c-urgent">${item.progress}%</strong>` }));
    return page("student-learning", "과제", context.learner.group, alertList(alerts)
      + section("제출할 과제", rows(waiting.map(task => taskItem(context,task,id,true)), "제출할 과제가 없어요."), "assignments")
      + section("학습 영상", rows(videos), "videos")
      + section("지난 과제", rows([...archived.map(task => taskItem(context,task,id,true)), archivedTask(true)])));
  }

  function compactChart(points) {
    if (!points.length) return empty("공개된 점수가 없어요.");
    const layout = points.map(({ percent, exam }, index) => ({
      x:points.length === 1 ? 150 : 17 + index * 266 / (points.length - 1),
      y:9 + (100 - percent) * .55, percent, date:exam.date,
    }));
    return `<svg class="c-score-chart" viewBox="0 0 300 82" role="img" aria-label="${escape(layout.map(({ date, percent }) => `${date} ${percent}점`).join(", "))}">
      <polyline points="${layout.map(({ x,y }) => `${x},${y}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      ${layout.map(({ x,y,date }, index) => `<circle cx="${x}" cy="${y}" r="${index === layout.length - 1 ? 4.3 : 3.3}" fill="${index === layout.length - 1 ? "var(--accent)" : "currentColor"}"/>
        <text x="${x}" y="77" text-anchor="middle" fill="var(--muted)" font-size="10">${escape(date)}</text>`).join("")}
      </svg>`;
  }

  function gradeOverview(id, context) {
    const points = context.publishedScores(id).filter(record => record.percent !== null).slice(-5);
    const recent = points.at(-1);
    const average = recent && context.chartAverage(recent);
    const change = context.scoreChange(id).difference;
    return block(metrics([
      { label:"최근 점수", value:recent?.percent ?? "—", suffix:recent ? "점" : "" },
      { label:"반 평균", value:average ?? "—", suffix:average == null ? "" : "점" },
      { label:"지난번보다", value:points.length < 2 ? "—" : change === 0 ? "0" : `${change > 0 ? "▲" : "▼"}${Math.abs(change)}`, urgent:change !== 0 },
    ]) + compactChart(points));
  }
  function gradesRows(id, context, limit = Infinity) {
    return context.publishedScores(id).toReversed().slice(0,limit).map(record => {
      const { exam, score, rank } = record;
      const average = context.chartAverage(record);
      return row({ title:exam.title, detail:`${dateText(exam.date)}${average === null ? "" : ` · 반 평균 ${record.average}`}`,
        end:score === "absent" ? chip("결시") : `<span class="c-value"><strong>${escape(score)}</strong><small>/${exam.maximum}</small>${rank ? `<small> · ${escape(rank)}</small>` : ""}</span>`,
        attrs:action("block-score",exam.id), symbol:"file" });
    });
  }
  function dateText(value) {
    const [month, day] = value.split(".").map(Number);
    return `${month}월 ${day}일`;
  }
  function examRows(context) {
    if (!context.exam) return [];
    const { title, detail, countdown, days } = context.exam;
    return [row({ title, detail, end:chip(countdown,days <= 3 ? "urgent" : "neutral"), symbol:"calendar", attrs:go("school-schedule") })];
  }
  function studentGrades(context) {
    const id = context.learner.id;
    return page("student-grades", "성적", context.learner.name, gradeOverview(id,context)
      + section("공개된 평가", rows(gradesRows(id,context), "공개된 평가가 없어요."))
      + section("다가오는 시험", rows(examRows(context), "다가오는 시험이 없어요.")));
  }

  function attendanceFor(state, id) {
    const history = state.attendance.filter(entry => entry.student === id);
    return {
      history,
      arrival:history.findLast(entry => entry.kind === "in"),
      departure:history.at(-1)?.kind === "out" ? history.at(-1) : null,
      late:history.some(entry => entry.kind === "in" && entry.late),
    };
  }
  function statusOfAttendance({ arrival, departure, late }) {
    if (departure) return ["하원","done"];
    if (!arrival) return ["미등원","urgent"];
    if (late) return ["지각","urgent"];
    return ["등원","neutral"];
  }
  function attendanceCaption({ arrival, departure }) {
    if (departure) return `등원 ${arrival?.time ?? "—"} · 하원 ${departure.time}`;
    if (!arrival) return "아직 기록이 없어요";
    return `등원 ${arrival.time}${arrival.late ? " · 수업 16:00 시작" : ""}`;
  }
  function learnerAttendance(context, parent) {
    const { arrival, departure, history } = attendanceFor(context.state, context.learner.id);
    const actions = parent ? "" : `<div class="c-actions c-actions-single">
      ${control("카메라로 QR 찍기",action("camera-qr"),{ symbol:"camera", primary:true })}
      ${control("출결 체험하기",action("mock-qr"),{ symbol:"qr" })}</div>`;
    const week = history.toReversed().map((record,index) => row({ title:record.kind === "out" ? "하원" : "등원", detail:`11월 16일 · ${record.time}`,
      symbol:record.kind === "out" ? "check" : "clock", end:chip(record.late ? "지각" : "기록 완료",record.late ? "urgent" : "done"),
      key:`attendance-${index}` }));
    return page(parent ? "parent-attendance" : "student-attendance", "출결", parent ? "" : context.learner.group + " · 11월 16일",
      section("오늘", block(metrics([
        { label:"등원", value:arrival?.time ?? "—", urgent:Boolean(arrival?.late) },
        { label:"하원", value:departure?.time ?? "—" },
      ]) + actions))
      + section("이번 주 기록", rows(week, "이번 주 출결 기록이 없어요.")), parent ? context.childPicker : "");
  }

  function teacherAttendance(context) {
    const byPerson = context.roster.map(person => ({ person, attendance:attendanceFor(context.state,person.id) }));
    const late = byPerson.filter(({ attendance }) => attendance.late && !attendance.departure);
    const missing = byPerson.filter(({ attendance }) => !attendance.arrival);
    const arrival = byPerson.filter(({ attendance }) => attendance.arrival).length;
    const departure = byPerson.filter(({ attendance }) => attendance.departure).length;
    const alerts = [];
    if (late.length) alerts.push({ label:`지각 ${late.length}명`, id:late[0].person.id });
    if (missing.length) alerts.push({ label:`미등원 ${missing.length}명`, id:missing[0].person.id });
    const summary = block(metrics([
      { label:"등원", value:arrival, suffix:`/${context.roster.length}명` },
      { label:"지각", value:late.length, suffix:"명" },
      { label:"하원", value:departure, suffix:"명" },
    ]) + `<div class="c-actions">
      ${control("수동 기록",action("record-attendance"),{ symbol:"edit" })}
      ${control("출석 QR 띄우기",action("teacher-qr"),{ symbol:"qr", primary:true })}</div>`);
    const people = byPerson.map(({ person, attendance }) => {
      const [label, tone] = statusOfAttendance(attendance);
      return row({ title:person.name, initial:nameInitial(person), detail:attendanceCaption(attendance), end:chip(label,tone),
        attrs:action("block-attendance",person.id), key:person.id });
    });
    const notifications = context.state.notifications.filter(entry => context.roster.some(person => person.id === entry.student));
    const sent = notifications.length ? [row({ title:`학부모 알림 ${notifications.length}건`, detail:`${notifications[0].channel} · 오늘 ${notifications[0].time}`,
      symbol:"send", attrs:go("notifications") })] : [];
    return page("teacher-attendance", "출결", context.teacherGroup + " · 11월 16일", alertList(alerts) + summary
      + section("학생별", rows(people)) + section("보낸 알림", rows(sent,"보낸 알림이 없어요.")));
  }

  function teacherLearning(context) {
    const tasks = context.tasks.map(task => ({
      task, learners:context.roster.map(person => ({ person, submission:submissionFor(context,task,person.id) })),
    }));
    const required = tasks.flatMap(({ task, learners }) => learners
      .filter(({ person, submission }) => task === context.tasks[0] && person.id === "seoha" && submission?.status === "submitted")
      .map(({ person }) => `${task.id}-${person.id}`));
    const returned = tasks.flatMap(({ task, learners }) => learners
      .filter(({ submission }) => submission?.status === "returned").map(({ person }) => `${task.id}-${person.id}`));
    const alerts = [];
    if (required.length) alerts.push({ label:`꼭 확인 ${required.length}건`, id:required[0] });
    if (returned.length) alerts.push({ label:`재제출 ${returned.length}건`, id:returned[0] });
    const assignments = tasks.map(({ task, learners }) => {
      const waiting = learners.filter(({ submission }) => !submission);
      const submitted = learners.length - waiting.length;
      const percentage = learners.length ? Math.round(100 * submitted / learners.length) : 0;
      const bar = `<div class="c-completion"><span>제출 <strong>${submitted}</strong>/${learners.length}명</span><progress max="100" value="${percentage}" aria-label="제출 진행률 ${percentage}%"></progress></div>`;
      const statusWeight = { submitted:0, returned:1, reviewed:2 };
      const people = learners.toSorted((left,right) => (statusWeight[left.submission?.status] ?? 3) - (statusWeight[right.submission?.status] ?? 3))
        .map(({ person, submission }) => {
          const id = `${task.id}-${person.id}`;
          const attention = required.includes(id);
          const [label,tone] = attention ? ["꼭 확인","urgent"] : submissionState(submission,false);
          const note = attention ? "AI 1차 82점 · 흐린 풀이 있음" : submission?.status === "returned" ? "재제출 요청"
            : submission?.attachment ? submission.attachment : submission ? label : "아직 안 냈어요";
          return row({ title:person.name, detail:note, initial:nameInitial(person), key:id,
            attrs:submission ? action("review",person.id,task.id) : "",
            end:submission ? chip(label,tone) : control("리마인드",action("remind",`${person.id}:과제 제출`,task.id),{ pill:true }) });
        }).join("");
      const remind = waiting.length ? `<div class="c-actions c-actions-single">${control(`미제출 ${waiting.length}명 한 번에 리마인드`,action("block-remind-all",task.id))}</div>` : "";
      return section(`${task.title} · ${task === context.tasks[0] ? "오늘 마감" : task.due}`,block(bar + people + remind));
    }).join("");
    const unread = context.roster.filter(person => !context.state.notices.includes(person.id));
    return page("teacher-learning","과제 검사","",alertList(alerts) + assignments
      + section("공지 확인",block(row({ title:context.notice.title, detail:unread.length ? `안 읽은 학생 ${unread.length}명` : "모두 확인했어요",
        symbol:"megaphone", end:unread.length ? control("리마인드",action("block-remind-all","notice"),{ pill:true }) : chip("완료","done") }))));
  }

  function teacherStudents(context) {
    const people = context.roster.map(person => {
      const status = statusOfAttendance(attendanceFor(context.state,person.id));
      const { last } = context.scoreChange(person.id);
      const [submission] = submissionState(submissionFor(context,context.tasks[0],person.id),false);
      return row({ title:person.name, initial:nameInitial(person), detail:`${status[0]} · ${submission}${last ? ` · 최근 ${last.percent}점` : ""}`,
        attrs:action("student-detail",person.id), end:chip(...status) });
    });
    return page("teacher-students","학생",context.teacherGroup,
      tiles([
        { title:"성적 입력", detail:context.assessmentLabel, symbol:"chart", attrs:go("grades") },
        { title:"내신 일정", detail:context.exam ? `${context.exam.title} ${context.exam.countdown}` : "예정된 시험 없음", symbol:"calendar", attrs:go("school-schedule") },
        { title:"발송 기록", detail:`알림 ${context.state.notifications.filter(entry => context.roster.some(person => person.id === entry.student)).length}건`, symbol:"send", attrs:go("notifications") },
      ]) + section("학생별",rows(people)));
  }

  function parentLearning(context, gradesOnly) {
    const id = context.learner.id;
    const taskBlock = section("과제",rows([...context.tasks.map(task => taskItem(context,task,id,false)),archivedTask(false)]));
    const gradeBlock = section("성적",gradeOverview(id,context)
      + `<div class="c-stack-small">${rows(gradesRows(id,context,gradesOnly ? Infinity : 1),"공개된 평가가 없어요.")}</div>`);
    return page("parent-learning", "과제/성적", "", (gradesOnly ? "" : taskBlock) + gradeBlock,context.childPicker);
  }

  function notificationRows(context, parent) {
    const records = context.state.notifications.filter(entry => parent ? entry.student === context.learner.id
      : context.roster.some(person => person.id === entry.student));
    const alerts = records.map((entry) => row({ title:parent ? entry.topic : `${context.roster.find(item => item.id === entry.student)?.name ?? ""} · ${entry.topic}`,
      detail:`${entry.channel} · 오늘 ${entry.time}`, symbol:"bell", attrs:parent ? go("attendance") : "" }));
    if (parent) alerts.push(...(context.tuition?.notices ?? []).map(entry => row({ ...entry, symbol:"wallet", attrs:go("tuition") })));
    return alerts;
  }
  function parentNews(context) {
    const read = context.state.parentNoticeReads.includes(context.learner.id);
    const schedule = context.lessons.filter(lesson => lesson.group === context.learner.group);
    const latest = schedule.find(lesson => lesson.day === "월") ?? schedule[0];
    return page("parent-news","소식","",tiles([
      { title:"학원비", detail:context.tuition?.summary || "이번 달 청구서 없음", symbol:"wallet", attrs:go("tuition"), urgent:context.tuition?.unpaid },
      { title:"학원 공지", detail:read ? "모두 읽었어요" : "안 읽음 1개", symbol:"megaphone", attrs:action("parent-notice"), urgent:!read },
      { title:"내신 일정", detail:context.exam ? `${context.exam.title} ${context.exam.countdown}` : "예정된 시험 없음", symbol:"calendar", attrs:go("school-schedule") },
      { title:"수업 시간표", detail:schedule.length ? `주 ${schedule.length}회 · 다음 수업 ${latest.day}` : "수업 일정 없음", symbol:"clock", attrs:go("schedule") },
    ]) + section("받은 알림",rows(notificationRows(context,true),"받은 알림이 없어요.")),context.childPicker);
  }

  function notifications(context, role) {
    if (role === "teacher") return page("teacher-notifications","발송 기록",context.teacherGroup,section("보낸 알림",rows(notificationRows(context,false),"보낸 알림이 없어요.")));
    if (role === "parent") return page("parent-notifications","받은 알림","",section("받은 알림",rows(notificationRows(context,true),"받은 알림이 없어요.")),context.childPicker);
    const learnerId = context.learner.id;
    const reminders = context.state.reminders.filter(entry => entry.student === learnerId);
    const alerts = reminders.map(entry => row({
      title:entry.topic, detail:entry.time, symbol:"bell",
      attrs:entry.topic.includes("영상") ? action("watch-video",film.id) : entry.topic.includes("과제") ? action("submit-homework", entry.task ?? context.tasks[0].id) : action("open-notice"),
    }));
    const firstTask = context.tasks[0];
    const status = submissionFor(context,firstTask,learnerId)?.status;
    if ((!status || status === "returned") && !reminders.some(entry => entry.task === firstTask.id)) {
      alerts.push(row({ title:firstTask.title, detail:firstTask.due + " 마감", symbol:"file", attrs:action("submit-homework",firstTask.id), end:chip("오늘 마감","urgent") }));
    }
    if ((Number(context.state.progress[learnerId]) || 0) < 90 && !reminders.some(entry => entry.topic.includes("영상"))) {
      alerts.push(row({ title:context.video.title, detail:"학습 영상", symbol:"play", attrs:action("watch-video",film.id) }));
    }
    return page("student-notifications","알림",context.learner.group,section("학습 알림",rows(alerts,"새 학습 알림이 없어요."))
      + section("학원 공지",rows([row({ title:context.notice.title, symbol:"megaphone", attrs:action("open-notice"),
        end:context.state.notices.includes(context.learner.id) ? chip("완료","done") : chip("미확인","urgent") })])));
  }

  function teacherVideo(context) {
    return page("teacher-video","영상 시청 현황","",section(context.video.title,rows(context.roster.map(person => {
      const progress = Number(context.state.progress[person.id]) || 0;
      return row({ title:person.name, initial:nameInitial(person), detail:`시청률 ${progress}%`,
        end:progress >= 90 ? chip("완료","done") : control("리마인드",action("remind",`${person.id}:영상 시청`),{ pill:true }) });
    }))));
  }

  function parentVideo(context) {
    const progress = Math.max(0, Math.min(100, Number(context.state.progress[context.learner.id]) || 0));
    const completed = progress >= 90;
    return page("parent-video", "학습 영상", "", rows([row({ title:context.video.title, play:progress,
      detail:`${context.video.minutes}분 · 시청률 ${progress}%`, end:chip(completed ? "시청 완료" : "미완료", completed ? "done" : "urgent") })]), context.childPicker);
  }

  const subpages = {
    owner: ["tuition", "learning", "roster", "grades", "notifications", "video"],
    teacher: ["grades", "schedule"],
    student: ["schedule"],
    parent: ["tuition", "schedule", "video"],
  };

  function scope(role, screen) {
    const subpage = screen === "school-schedule" || subpages[role]?.includes(screen);
    if (subpage) document.body.dataset.cSubpage = screen;
    else delete document.body.dataset.cSubpage;
    const enabled = subpage || ["teacher", "student", "parent"].includes(role) && !["home","home-overview"].includes(screen);
    document.body.toggleAttribute("data-c-block-scope",enabled);
  }

  function render(role, screen, context) {
    if (role === "student") {
      if (screen === "learning" || screen === "video") return studentLearning(context);
      if (screen === "attendance") return learnerAttendance(context,false);
      if (screen === "grades") return studentGrades(context);
    }
    if (role === "teacher") {
      if (screen === "attendance") return teacherAttendance(context);
      if (screen === "learning") return teacherLearning(context);
      if (screen === "students" && !context.selectedLearner) return teacherStudents(context);
      if (screen === "video") return teacherVideo(context);
    }
    if (role === "parent") {
      if (screen === "attendance") return learnerAttendance(context,true);
      if (screen === "learning" || screen === "grades") return parentLearning(context,screen === "grades");
      if (screen === "news") return parentNews(context);
      if (screen === "video") return parentVideo(context);
    }
    if (screen === "notifications" && ["teacher","student","parent"].includes(role)) return notifications(context,role);
    return null;
  }

  function info(kind, id, context) {
    if (kind === "block-score") {
      const record = context.publishedScores(context.learner.id).find(({ exam }) => exam.id === id);
      if (!record) return null;
      const { exam, score, rank } = record;
      const average = context.chartAverage(record);
      return { title:exam.title, detail:`${dateText(exam.date)} · ${score === "absent" ? "결시" : `${score}/${exam.maximum}점`}${average === null ? "" : ` · 반 평균 ${record.average}점`}${rank ? ` · ${rank}` : ""}` };
    }
    if (kind !== "block-task-info") return null;
    if (id === historyTask.id) return { title:historyTask.title, detail:historyTask.detail };
    const task = context.tasks.find(item => item.id === id);
    if (!task) return null;
    const [status] = submissionState(submissionFor(context,task,context.learner.id),task === context.tasks[0]);
    return { title:task.title, detail:`마감 ${task.due} · ${status}` };
  }

  window.DemoBlockTabs = Object.freeze({ render, scope, info });
})();
