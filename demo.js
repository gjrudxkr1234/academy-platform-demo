"use strict";

const demoVariant = document.body.dataset.demo === "bomnal" ? "bomnal" : "generic";
const storageKey = `academy-operations-demo-v2-${demoVariant}`;
const qrLifetimeSeconds = 30;
const qrClockSkewSeconds = 2;
const students = [
  { id: "jiwoo", name: "김지우", group: "중2 심화반" },
  { id: "minjun", name: "김민준", group: "중1 개념반" },
  { id: "seoha", name: "박서하", group: "중2 심화반" },
  { id: "hyun", name: "이현", group: "중2 심화반" },
  { id: "yuna", name: "정유나", group: "중1 개념반" },
  { id: "siwoo", name: "한시우", group: "중2 심화반" },
];
const video = { title: "일차함수의 그래프 풀이", minutes: 12 };
const assignment = { title: "일차함수 실전 문제 8–12번", due: "오늘 오후 9:00", detail: "8–12번 풀이 사진을 첨부해 주세요. 답과 함께 식을 정리한 과정이 보이면 좋아요." };
const notice = { title: "다음 주 수업 시간 안내", detail: "다음 주 목요일 중2 심화반은 오후 4시에 시작합니다. 교재와 지난 숙제 풀이를 가져오세요." };

const symbols = { home: "◈", attendance: "▤", learning: "◇", video: "▷", notifications: "◌" };
const menus = {
  owner: [["home", "운영 현황"], ["attendance", "출결"], ["learning", "과제·공지"], ["notifications", "발송 기록"]],
  teacher: [["home", "수업 현황"], ["attendance", "출결"], ["learning", "과제·공지"], ["video", "영상 현황"], ["notifications", "발송 기록"]],
  student: [["home", "오늘 할 일"], ["learning", "과제·공지"], ["video", "학습 영상"]],
  parent: [["home", "자녀 현황"], ["attendance", "출결 기록"], ["learning", "과제·공지"], ["notifications", "받은 알림"]],
};

const content = document.getElementById("content");
const navigation = document.getElementById("navigation");
const roleSelect = document.getElementById("role");
const dialog = document.getElementById("dialog");
const feedback = document.getElementById("feedback");
let role = "owner";
let activeScreen = "home";
let child = "jiwoo";
let toastTimer;
let cameraSession = null;
let state = readState();

function freshState() {
  return {
    attendance: [
      { student: "jiwoo", kind: "in", time: "15:57", late: false },
      { student: "seoha", kind: "in", time: "16:03", late: false },
      { student: "hyun", kind: "in", time: "16:12", late: true },
      { student: "minjun", kind: "in", time: "15:20", late: false },
      { student: "minjun", kind: "out", time: "16:32", late: false },
    ],
    submissions: {
      seoha: { status: "submitted", attachment: "일차함수_풀이.jpg", note: "12번에 풀이를 두 가지로 적었어요." },
      hyun: { status: "returned", attachment: "문제_풀이.jpg", note: "기울기 부호를 확인해 주세요." },
    },
    notices: ["seoha", "hyun"],
    progress: { jiwoo: 40, seoha: 100, hyun: 65, siwoo: 0, minjun: 100, yuna: 15 },
    reminders: [],
    scannedQr: [],
    notifications: [
      { student: "minjun", channel: "알림톡", topic: "하원 안내", time: "16:32" },
      { student: "hyun", channel: "알림톡", topic: "지각 등원 안내", time: "16:12" },
      { student: "jiwoo", channel: "알림톡", topic: "등원 안내", time: "15:57" },
    ],
    clock: 17 * 60 + 10,
  };
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.attendance) && Array.isArray(saved.notices) && Array.isArray(saved.reminders) && Array.isArray(saved.scannedQr)
      && Array.isArray(saved.notifications) && saved.submissions && saved.progress && Number.isInteger(saved.clock)) return saved;
  } catch {
    return freshState();
  }
  return freshState();
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The demo still works in memory when browser storage is disabled.
  }
  render();
}

function announce(text) {
  window.clearTimeout(toastTimer);
  feedback.hidden = false;
  feedback.textContent = text;
  toastTimer = window.setTimeout(() => { feedback.hidden = true; }, 2900);
}

function escapeHtml(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

function student(id) {
  return students.find((record) => record.id === id);
}

function studentName(id) {
  return student(id)?.name ?? "학생";
}

function latestEvent(id) {
  return state.attendance.findLast((event) => event.student === id);
}

function sessionTime() {
  state.clock += 1;
  return [Math.floor(state.clock / 60) % 24, state.clock % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

function badge(text, tone = "neutral") {
  return `<span class="status ${tone}">${escapeHtml(text)}</span>`;
}

function button(label, action, options = {}) {
  const variant = options.variant ?? "secondary";
  const id = options.id ? ` data-id="${escapeHtml(options.id)}"` : "";
  return `<button type="button" class="${variant}" data-action="${action}"${id} ${options.disabled ? "disabled" : ""}>${escapeHtml(label)}</button>`;
}

function panel(title, body, control = "", className = "") {
  return `<section class="panel ${className}"><div class="panel-head"><h2>${escapeHtml(title)}</h2>${control}</div>${body}</section>`;
}

function header(title, description, control = "") {
  return `<div class="page-head"><div><h1 class="page-title">${escapeHtml(title)}</h1><p class="subtitle">${escapeHtml(description)}</p></div>${control}</div>`;
}

function item(title, detail, action = "") {
  return `<li class="item"><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div><div class="actions">${action}</div></li>`;
}

function list(rows, empty = "기록이 없습니다.") {
  return rows.length ? `<ul class="item-list">${rows.join("")}</ul>` : `<p class="empty">${escapeHtml(empty)}</p>`;
}

function attendanceTable(people = students) {
  return `<div class="table-scroll"><table><thead><tr><th>학생</th><th>반</th><th>최근 기록</th><th>상태</th></tr></thead><tbody>${people.map(({ id, name, group }) => {
    const event = latestEvent(id);
    const status = !event ? badge("미등원") : event.kind === "out" ? badge("하원", "purple") : event.late ? badge("지각", "orange") : badge("등원", "green");
    return `<tr><td><div class="name"><span class="avatar" aria-hidden="true">${escapeHtml(name[0])}</span><strong>${escapeHtml(name)}</strong></div></td><td>${escapeHtml(group)}</td><td>${event ? escapeHtml(event.time) : "—"}</td><td>${status}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function metrics() {
  const checked = students.filter(({ id }) => latestEvent(id)).length;
  const late = students.filter(({ id }) => state.attendance.some((entry) => entry.student === id && entry.late)).length;
  const total = state.notifications.length;
  const cards = [
    ["오늘 등원", `${checked}명`, `등록 ${students.length}명`, "▤"],
    ["오늘 지각", `${late}명`, "수업 시작 기준", "◷"],
    ["가짜 발송", `${total}건`, "알림톡·문자 기록", "◌"],
  ];
  return `<div class="metrics">${cards.map(([label, value, sub, icon]) => `<article class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon" aria-hidden="true">${icon}</span></div><strong>${value}</strong><small>${sub}</small></article>`).join("")}</div>`;
}

function notificationList(id, limit) {
  const records = state.notifications.filter((entry) => !id || id === entry.student);
  return list(records.slice(0, limit).map((entry) =>
    item(`${studentName(entry.student)} 학생 · ${entry.topic}`, `${entry.channel} · ${entry.time}`, badge("가짜 발송", "purple"))), "받은 알림 기록이 없습니다.");
}

function staffHome() {
  const title = role === "owner" ? "오늘의 학원 운영" : "오늘의 수업 현황";
  return `<section class="hero"><div><h1>${title}</h1><p>2026년 11월 12일 목요일 · 수업과 학생 현황을 확인하세요.</p></div>${staffAttendanceActions()}</section>
    ${metrics()}<div class="columns">
      ${panel("오늘 출결", attendanceTable(), button("전체 보기", "navigate", { id: "attendance", variant: "text-button" }))}
      <div>${panel("최근 알림", notificationList(null, 3), button("기록 보기", "navigate", { id: "notifications", variant: "text-button" }))}
      ${panel("수업 일정", list([item("중2 심화반", "16:00–17:30 · 강의실 A", badge("진행 중", "green")), item("중1 개념반", "18:00–19:30 · 강의실 B", badge("예정"))]), "", "stack")}</div>
    </div>`;
}

function attendanceHistory(id) {
  const records = state.attendance.filter((event) => !id || event.student === id).toReversed();
  return list(records.map((event) => item(`${studentName(event.student)} 학생 · ${event.kind === "in" ? "등원" : "하원"}`, event.time, event.late ? badge("지각", "orange") : badge("기록 완료", "green"))));
}

function staffAttendanceActions() {
  return `<div class="actions">${button("출석 QR 띄우기", "teacher-qr")}${button("수동 출결 기록", "record-attendance", { variant: "primary" })}</div>`;
}

function staffAttendance() {
  return `${header("출결 관리", "등원·하원 기록과 지각을 확인합니다.", staffAttendanceActions())}
    ${metrics()}<div class="columns">${panel("학생별 출결", attendanceTable())}${panel("출결 기록", attendanceHistory())}</div>`;
}

function submissionBadge(value) {
  if (value?.status === "submitted") return badge("제출 완료", "green");
  if (value?.status === "reviewed") return badge("검토 완료", "green");
  if (value?.status === "returned") return badge("재제출 요청", "orange");
  return badge("미제출", "orange");
}

function staffLearning() {
  const unread = students.filter(({ id }) => !state.notices.includes(id));
  return `${header("과제·공지 관리", "미제출 학생과 공지를 확인하지 않은 학생을 확인하세요.")}
  <div class="columns">
    ${panel(assignment.title, list(students.map(({ id, name, group }) => {
      const record = state.submissions[id];
      const control = record?.status === "submitted" ? button("검토", "review", { id, variant: "text-button" })
        : record?.status !== "reviewed" ? button("리마인드", "remind", { id: `${id}:과제 제출` }) : "";
      return item(name, record?.attachment ?? group, submissionBadge(record) + control);
    })))}
    ${panel("공지 미확인", `<p class="note">${notice.title} · 미확인 ${unread.length}명</p>` + list(unread.map(({ id, name, group }) =>
      item(name, group, button("리마인드", "remind", { id: `${id}:공지 확인` }))), "모든 학생이 확인했습니다."))}
  </div>`;
}

function staffVideo() {
  return `${header("영상 시청 현황", "학생별 시청률과 미완료 학생을 확인하세요.")}
    ${panel(video.title, list(students.map(({ id, name, group }) => {
      const progress = Number(state.progress[id]) || 0;
      const control = progress < 90 ? button("리마인드", "remind", { id: `${id}:영상 시청` }) : "";
      return item(name, `${group} · 시청률 ${progress}%`, badge(progress >= 90 ? "시청 완료" : "미완료", progress >= 90 ? "green" : "orange") + control);
    })))}`;
}

function taskRows(id, interactive) {
  const record = state.submissions[id];
  const due = record ? submissionBadge(record) : badge("마감 임박", "orange");
  const submitLabel = { returned: "재제출", submitted: "제출 수정" }[record?.status] ?? "과제 제출";
  const submissionAction = interactive && record?.status !== "reviewed"
    ? button(submitLabel, "submit-homework", { variant: "text-button" }) : "";
  const noticeRead = state.notices.includes(id);
  return [
    item(assignment.title, `마감 ${assignment.due}`, due + submissionAction),
    item(notice.title, "학원 공지", badge(noticeRead ? "확인 완료" : "미확인", noticeRead ? "green" : "purple")
      + (interactive ? button("공지 열기", "open-notice", { variant: "text-button" }) : "")),
  ];
}

function videoCard(id, interactive) {
  const progress = Number(state.progress[id]) || 0;
  const time = Math.round(progress / 100 * video.minutes * 60);
  const point = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
  const label = progress >= 90 ? "시청 완료" : progress ? "이어서 보기" : "영상 보기";
  return panel("학습 영상", `<div class="media-preview"><strong>${video.title}</strong><small>중2 심화반 · ${video.minutes}분</small></div>
    <progress class="progress" max="100" value="${progress}" aria-label="시청률"></progress>
    <div class="progress-description"><span>시청률 ${progress}%</span><span>저장 위치 ${point}</span></div>`, interactive
    ? button(label, "watch-video", { variant: "primary", disabled: progress >= 90 }) : (progress >= 90 ? badge("시청 완료", "green") : badge("시청 중", "purple")));
}

function studentHome() {
  const reminders = state.reminders.filter((entry) => entry.student === "jiwoo");
  const alerts = reminders.length ? panel("학습 알림", list(reminders.map((entry) => item(entry.topic, `선생님 · ${entry.time}`))), "", "stack") : "";
  return `<section class="hero"><div><h1>지우 학생의 오늘 할 일</h1><p>중2 심화반 · 마감과 시청 진도를 한눈에 확인하세요.</p></div>
    <div class="actions">${button("카메라로 QR 찍기", "camera-qr", { variant: "primary" })}${button("모의 QR 열기", "mock-qr")}</div></section>
    <div class="columns"><div>${panel("오늘 할 일", list(taskRows("jiwoo", true)))}${alerts}</div>${videoCard("jiwoo", true)}</div>`;
}

function learnerWork(id, interactive) {
  const record = state.submissions[id];
  const assignmentBody = list(taskRows(id, interactive).slice(0, 1));
  return `${header("과제·공지", "과제 제출 상태와 수업 공지를 확인하세요.")}
    <div class="columns">
      ${panel("과제", assignmentBody + (record?.attachment ? `<p class="note">첨부 ${escapeHtml(record.attachment)}</p>` : "")
        + (record?.note ? `<p class="note">${escapeHtml(record.note)}</p>` : ""))}
      ${panel("학원 공지", list(taskRows(id, interactive).slice(1)))}
    </div>`;
}

function parentView(screen) {
  const controls = `<div class="parent-picker" aria-label="자녀 선택">${["jiwoo", "minjun"].map((id) =>
    `<button class="secondary" type="button" data-action="child" data-id="${id}" aria-pressed="${id === child}">${studentName(id)}</button>`).join("")}</div>`;
  if (screen === "attendance") return header("자녀 출결", "자녀별 등원·하원 기록입니다.") + controls + panel("출결 기록", attendanceHistory(child));
  if (screen === "notifications") return header("받은 알림", "등원·하원 알림을 자녀별로 확인합니다.") + controls + panel("알림 기록", notificationList(child, 20));
  if (screen === "learning") return controls + learnerWork(child, false);
  return `<section class="hero"><div><h1>우리 아이 학원 현황</h1><p>두 자녀의 출결과 오늘 할 일을 확인하세요.</p></div></section>${controls}
    <div class="columns">
      <div>${panel(`${studentName(child)} 학생 출결`, attendanceHistory(child))}
      ${panel("학습 상태", list(taskRows(child, false)), "", "stack")}</div>
      <div>${panel("최근 알림", notificationList(child, 3))}
      <div class="panel stack"><div class="panel-head"><h2>학습 영상</h2>${Number(state.progress[child]) >= 90 ? badge("시청 완료", "green") : badge("시청 중", "purple")}</div>
      <p>${video.title}</p><p class="note">시청률 ${Number(state.progress[child]) || 0}%</p></div></div>
    </div>`;
}

function render() {
  navigation.innerHTML = menus[role].map(([screen, label]) => `<button class="nav-button" type="button" data-action="navigate" data-id="${screen}"${screen === activeScreen ? ' aria-current="page"' : ""}><span aria-hidden="true">${symbols[screen]}</span>${label}</button>`).join("");
  if (role === "parent") content.innerHTML = parentView(activeScreen);
  else if (role === "student") {
    const screens = { home: studentHome, learning: () => learnerWork("jiwoo", true), video: () => header("학습 영상", "마지막 시청 위치에서 이어볼 수 있습니다.") + videoCard("jiwoo", true) };
    content.innerHTML = screens[activeScreen]();
  } else {
    const screens = { home: staffHome, attendance: staffAttendance, learning: staffLearning, video: staffVideo, notifications: () => header("발송 기록", "실제 메시지 대신 브라우저에 남긴 발송 내역입니다.") + panel("가짜 발송 기록", notificationList(null, 30)) };
    content.innerHTML = screens[activeScreen]();
  }
}

function openDialog(title, body, confirmLabel, handler, destructive = false) {
  dialog.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2><div class="dialog-body">${body}
    <div class="dialog-actions"><button type="button" class="secondary" data-action="close-dialog">닫기</button>
    ${confirmLabel ? `<button type="button" data-confirm class="${destructive ? "secondary danger" : "primary"}">${escapeHtml(confirmLabel)}</button>` : ""}</div></div>`;
  dialog.querySelector("[data-confirm]")?.addEventListener("click", () => {
    const selected = new Map(Array.from(dialog.querySelectorAll("select[name]"), (control) => [control.name, control.value]));
    if (handler?.(selected) !== false) dialog.close();
  });
  dialog.showModal();
}

function recordAttendance() {
  openDialog("수동 출결 기록", `<label>학생<select name="student">${students.map(({ id, name }) => `<option value="${id}">${name}</option>`).join("")}</select></label>
    <label>기록 종류<select name="kind"><option value="in">등원</option><option value="late">지각 등원</option><option value="out">하원</option></select></label>
    <label>알림 채널<select name="channel"><option>알림톡</option><option>문자</option></select></label>`, "기록 저장", (form) => {
    const id = form.get("student");
    const kind = form.get("kind");
    if (!student(id) || !["in", "late", "out"].includes(kind)) return false;
    const isCheckout = kind === "out";
    const current = latestEvent(id);
    if (isCheckout ? current?.kind !== "in" : current?.kind === "in") {
      announce(isCheckout ? "등원 중인 학생만 하원 처리할 수 있습니다." : "이미 등원 중인 학생입니다.");
      return false;
    }
    const time = sessionTime();
    const channel = form.get("channel") === "문자" ? "문자" : "알림톡";
    state.attendance.push({ student: id, kind: isCheckout ? "out" : "in", late: kind === "late", time });
    state.notifications.unshift({ student: id, channel, topic: isCheckout ? "하원 안내" : kind === "late" ? "지각 등원 안내" : "등원 안내", time });
    saveState();
    announce("출결과 가짜 발송 기록을 저장했습니다.");
    return true;
  });
}

function submitHomework() {
  openDialog("풀이 사진 제출", `<p>${assignment.detail}</p>
    <label>샘플 첨부<select name="attachment"><option value="일차함수_풀이.jpg">일차함수_풀이.jpg · 합성 샘플</option><option value="풀이노트.pdf">풀이노트.pdf · 합성 샘플</option></select></label>
    <p class="note">가상 첨부 이름을 이 브라우저에 기록합니다.</p>`, "제출하기", (form) => {
    const selected = form.get("attachment") === "풀이노트.pdf" ? "풀이노트.pdf" : "일차함수_풀이.jpg";
    state.submissions.jiwoo = { status: "submitted", attachment: selected, note: "" };
    saveState();
    announce("과제를 제출했습니다. 선생님 화면에서 확인할 수 있습니다.");
  });
}

function reviewSubmission(id) {
  const record = state.submissions[id];
  if (!student(id) || !record) return;
  openDialog(`${studentName(id)} 학생 과제 검토`, `<p>첨부 ${escapeHtml(record.attachment)}</p>
    <label>검토 결과<select name="status"><option value="reviewed">검토 완료</option><option value="returned">반려 및 재제출 요청</option></select></label>
    <label>예시 피드백<select name="note"><option value="">선택 안 함</option><option>그래프 축과 교점을 표시해 주세요.</option><option>기울기 부호를 확인해 주세요.</option></select></label>`, "검토 저장", (form) => {
    record.status = form.get("status") === "returned" ? "returned" : "reviewed";
    record.note = String(form.get("note") ?? "").slice(0, 120);
    saveState();
    announce("학생 과제에 검토 결과를 저장했습니다.");
  });
}

function readNotice() {
  openDialog(notice.title, `<p>${notice.detail}</p>`, state.notices.includes("jiwoo") ? "" : "읽음 확인", () => {
    state.notices.push("jiwoo");
    saveState();
    announce("공지를 읽음 처리했습니다.");
  });
}

function watchVideo() {
  const progress = Number(state.progress.jiwoo) || 0;
  openDialog(video.title, `<div class="media-preview"><strong>▷</strong><small>합성 영상 시청 체험</small></div><p>저장된 시청률 ${progress}%</p>
    <p class="note">버튼을 누르면 25% 분량의 시청을 가정해 기록합니다. 90% 이상이면 완료됩니다.</p>`, "25% 시청하고 저장", () => {
    state.progress.jiwoo = Math.min(100, progress + 25);
    saveState();
    announce(state.progress.jiwoo >= 90 ? "시청을 완료했습니다." : "시청 위치를 저장했습니다.");
  });
}

function openMockQr() {
  const expiresAt = Date.now() + qrLifetimeSeconds * 1000;
  const kind = latestEvent("jiwoo")?.kind === "in" ? "out" : "in";
  const label = kind === "in" ? "등원" : "하원";
  openDialog(`30초 모의 ${label} QR`, `<div class="mock-qr" aria-hidden="true"></div>
    <p>남은 시간 <strong data-qr-time>30초</strong></p>
    <p class="note">카메라 없이 출결 기록을 체험합니다.</p>`, `모의 ${label} 처리`, () => {
    if (Date.now() >= expiresAt) return false;
    const time = sessionTime();
    state.attendance.push({ student: "jiwoo", kind, late: false, time });
    state.notifications.unshift({ student: "jiwoo", channel: "알림톡", topic: `${label} 안내`, time });
    saveState();
    announce(`모의 ${label}과 알림톡 기록을 저장했습니다.`);
  });
  const timer = window.setInterval(() => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    dialog.querySelector("[data-qr-time]").textContent = remaining ? `${remaining}초` : "만료";
    if (!remaining) {
      dialog.querySelector("[data-confirm]").disabled = true;
      window.clearInterval(timer);
    }
  }, 250);
  dialog.addEventListener("close", () => window.clearInterval(timer), { once: true });
}

function renderQr(canvas, payload) {
  const matrix = DemoQr.encode(payload);
  const margin = 4;
  const scale = 8;
  const width = (matrix.size + margin * 2) * scale;
  canvas.width = width;
  canvas.height = width;
  const ink = canvas.getContext("2d");
  ink.fillStyle = "#fff";
  ink.fillRect(0, 0, width, width);
  ink.fillStyle = "#000";
  for (let row = 0; row < matrix.size; row += 1) {
    for (let column = 0; column < matrix.size; column += 1) {
      if (matrix.get(row, column)) ink.fillRect((column + margin) * scale, (row + margin) * scale, scale, scale);
    }
  }
}

function openTeacherQr() {
  openDialog("출석 QR", `<label>QR 종류<select name="kind"><option value="in">등원</option><option value="out">하원</option></select></label>
    <canvas class="live-qr" role="img" aria-label="모의 등원 출석 QR"></canvas>
    <p>다음 QR로 갱신까지 <strong data-qr-time>30초</strong></p>
    <p class="note">휴대폰에서 같은 데모의 학생 화면을 열고 ‘카메라로 QR 찍기’를 눌러 주세요. 스캔 결과는 휴대폰에만 모의 기록으로 남습니다.</p>`);

  const kind = dialog.querySelector('select[name="kind"]');
  const canvas = dialog.querySelector("canvas");
  const countdown = dialog.querySelector("[data-qr-time]");
  let expiresAt = 0;
  function issueQr() {
    expiresAt = Math.floor(Date.now() / 1000) + qrLifetimeSeconds;
    const nonce = Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, "0")).join("");
    canvas.setAttribute("aria-label", `모의 ${kind.value === "in" ? "등원" : "하원"} 출석 QR`);
    renderQr(canvas, `academy-demo-qr:v1:${demoVariant}:${kind.value}:${expiresAt}:${nonce}`);
  }
  function tick() {
    const now = Date.now() / 1000;
    if (now >= expiresAt) issueQr();
    countdown.textContent = `${Math.ceil(expiresAt - now)}초`;
  }
  kind.addEventListener("change", () => { issueQr(); tick(); });
  tick();
  const timer = window.setInterval(tick, 200);
  dialog.addEventListener("close", () => window.clearInterval(timer), { once: true });
}

function stopCamera() {
  const session = cameraSession;
  if (!session) return;
  cameraSession = null;
  window.cancelAnimationFrame(session.frame);
  session.stream?.getTracks().forEach((track) => track.stop());
  session.preview.srcObject = null;
}

function recordScannedQr(payload) {
  const ticket = /^academy-demo-qr:v1:(generic|bomnal):(in|out):(\d{10}):([a-f0-9]{16})$/.exec(payload ?? "");
  if (!ticket) return null;
  const [, variant, kind, rawExpiry, nonce] = ticket;
  if (variant !== demoVariant) return { message: "교사와 학생이 같은 데모 주소를 열어 주세요.", done: false };
  const expiry = Number(rawExpiry);
  const now = Date.now() / 1000;
  if (expiry <= now || expiry > now + qrLifetimeSeconds + qrClockSkewSeconds) {
    return { message: "QR 시간이 맞지 않습니다. 교사 화면의 새 QR과 기기 시간을 확인해 주세요.", done: false };
  }
  if (state.scannedQr.includes(nonce)) return { message: "이 QR은 이미 이 브라우저에서 처리했습니다.", done: true };
  const label = kind === "in" ? "등원" : "하원";
  const time = sessionTime();
  state.scannedQr = [...state.scannedQr.slice(-49), nonce];
  state.attendance.push({ student: "jiwoo", kind, late: false, time });
  state.notifications.unshift({ student: "jiwoo", channel: "알림톡", topic: `${label} 안내`, time });
  saveState();
  return { message: `모의 ${label} 처리했습니다. 이 브라우저에만 기록했습니다.`, done: true };
}

async function openCameraQr() {
  openDialog("카메라 출석 체험", `<video class="qr-camera" aria-label="QR 카메라 미리보기" autoplay muted playsinline></video>
    <p data-camera-status role="status" aria-live="polite">후면 카메라를 여는 중입니다.</p>
    <p class="note">카메라 영상은 이 기기에서만 QR을 읽는 데 사용합니다.</p>`);
  const preview = dialog.querySelector("video");
  const status = dialog.querySelector("[data-camera-status]");
  const session = { preview, stream: null, frame: 0 };
  cameraSession = session;
  if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = "HTTPS 주소를 기본 브라우저에서 열어 카메라를 사용해 주세요.";
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
    if (cameraSession !== session) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    session.stream = stream;
    preview.muted = true;
    preview.srcObject = stream;
    await preview.play();
    if (cameraSession !== session) return;
    const frame = document.createElement("canvas");
    const pixels = frame.getContext("2d", { willReadFrequently: true });
    if (!pixels) throw new Error("Camera canvas unavailable");
    status.textContent = "교사 화면의 QR을 카메라 중앙에 맞춰 주세요.";
    let lastFrame = 0;
    function scan(timestamp) {
      if (cameraSession !== session) return;
      if (preview.videoWidth && preview.videoHeight && timestamp - lastFrame >= 120) {
        lastFrame = timestamp;
        frame.width = Math.min(preview.videoWidth, 640);
        frame.height = Math.max(1, Math.round(frame.width * preview.videoHeight / preview.videoWidth));
        pixels.drawImage(preview, 0, 0, frame.width, frame.height);
        const result = recordScannedQr(DemoQr.decode(pixels.getImageData(0, 0, frame.width, frame.height)));
        if (result?.done) {
          stopCamera();
          dialog.close();
          announce(result.message);
          return;
        }
        if (result) status.textContent = result.message;
      }
      session.frame = window.requestAnimationFrame(scan);
    }
    session.frame = window.requestAnimationFrame(scan);
  } catch {
    if (cameraSession !== session) return;
    stopCamera();
    status.textContent = "카메라를 열지 못했습니다. 브라우저의 카메라 권한을 확인하거나 모의 QR 열기를 이용해 주세요.";
  }
}

dialog.addEventListener("close", stopCamera);
window.addEventListener("pagehide", stopCamera);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && cameraSession?.stream) dialog.close();
});

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const { action, id } = control.dataset;
  if (action === "navigate" && menus[role].some(([screen]) => screen === id)) {
    activeScreen = id;
    render();
    content.focus();
  } else if (action === "record-attendance") recordAttendance();
  else if (action === "submit-homework") submitHomework();
  else if (action === "review") reviewSubmission(id);
  else if (action === "open-notice") readNotice();
  else if (action === "watch-video") watchVideo();
  else if (action === "teacher-qr" && (role === "teacher" || role === "owner")) openTeacherQr();
  else if (action === "camera-qr" && role === "student") void openCameraQr();
  else if (action === "mock-qr") openMockQr();
  else if (action === "close-dialog") dialog.close();
  else if (action === "child" && ["jiwoo", "minjun"].includes(id)) {
    child = id;
    render();
    content.querySelector('[data-action="child"][aria-pressed="true"]')?.focus();
  } else if (action === "remind") {
    const [learner, topic] = id.split(":");
    if (!student(learner) || !["과제 제출", "공지 확인", "영상 시청"].includes(topic)) return;
    state.reminders.unshift({ student: learner, topic: `${topic} 리마인드`, time: sessionTime() });
    saveState();
    announce(`${studentName(learner)} 학생 홈에 학습 알림을 남겼습니다.`);
  }
});

roleSelect.addEventListener("change", () => {
  role = roleSelect.value;
  activeScreen = "home";
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  openDialog("데모 초기화", "<p>이 브라우저의 합성 변경사항을 지우고 시작 상태로 돌아갑니다.</p>", "초기화", () => {
    state = freshState();
    child = "jiwoo";
    saveState();
    announce("데모 데이터를 초기화했습니다.");
  }, true);
});

render();
