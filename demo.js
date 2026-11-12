"use strict";

const demoVariant = document.body.dataset.demo === "bomnal" ? "bomnal" : "generic";
const demoRoot = new URL(".", document.currentScript.src);
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
const academyProfiles = {
  generic: { name: "온새미 수학학원", intro: "수업 전 진단으로 학생의 수준을 살피고, 개념 수업부터 문제 풀이와 오답 점검까지 이어갑니다." },
  bomnal: {
    name: "봄날수학학원",
    intro: "초등 고학년부터 중·고등까지 학생의 수준에 맞춰 지도합니다. 초등은 개념과 풀이 습관을 다지고, 중등은 구갈중·신릉중·신갈중의 진도와 시험 흐름에 맞춰 내신을 대비합니다.",
    address: "경기 용인시 기흥구 구갈로 70 메가타운 3층",
    hours: "매일 10:00–22:00",
  },
};
const teachers = [
  { name: "김서윤", role: "원장", subject: "고등 수학", detail: "내신 대비와 유형별 오답 지도" },
  { name: "이도현", role: "담당 교사", subject: "중등 수학", detail: "개념 설명과 서술형 풀이 지도" },
  { name: "김하람", role: "담당 교사", subject: "중등 수학", detail: "수준별 문제 풀이와 보충 수업" },
];
const scheduleDays = ["월", "화", "수", "목", "금", "토"];
const classes = [
  { id: "middle-two-thu", day: "목", dayNumber: 12, group: "중2 심화반", time: "16:00–17:30", teacher: "이도현", room: "강의실 A" },
  { id: "middle-one-thu", day: "목", dayNumber: 12, group: "중1 개념반", time: "18:00–19:30", teacher: "김하람", room: "강의실 B" },
  { id: "middle-two-fri", day: "금", dayNumber: 13, group: "중2 심화반", time: "17:00–18:30", teacher: "이도현", room: "강의실 A" },
  { id: "high-one-fri", day: "금", dayNumber: 13, group: "고1 내신반", time: "19:00–20:30", teacher: "김서윤", room: "강의실 B" },
  { id: "middle-one-sat", day: "토", dayNumber: 14, group: "중1 개념반", time: "11:00–12:30", teacher: "김하람", room: "강의실 B" },
  { id: "middle-two-sat", day: "토", dayNumber: 14, group: "중2 심화반", time: "14:00–15:30", teacher: "이도현", room: "강의실 A" },
];
const assessments = [
  { id: "linear-first", title: "일차함수 기초 평가", date: "10.23", group: "중2 심화반", maximum: 40 },
  { id: "linear-second", title: "그래프 이해 평가", date: "10.30", group: "중2 심화반", maximum: 50 },
  { id: "linear-third", title: "일차함수 단원 평가", date: "11.06", group: "중2 심화반", maximum: 100 },
  { id: "linear-fourth", title: "일차함수 종합 평가", date: "11.12", group: "중2 심화반", maximum: 100 },
  { id: "middle-one-first", title: "정수와 유리수 평가", date: "10.23", group: "중1 개념반", maximum: 40 },
  { id: "middle-one-second", title: "문자와 식 평가", date: "10.30", group: "중1 개념반", maximum: 50 },
  { id: "middle-one-third", title: "방정식 단원 평가", date: "11.06", group: "중1 개념반", maximum: 100 },
];

const symbols = { home: "◈", website: "⌂", schedule: "▦", attendance: "▤", learning: "◇", grades: "▥", video: "▷", notifications: "◌", roster: "▧", settings: "⚙" };
const menus = {
  owner: [["home", "운영 현황"], ["website", "학원 홈페이지"], ["schedule", "일정·휴가"], ["attendance", "출결"], ["learning", "과제·공지"], ["grades", "성적 리포트"], ["notifications", "발송 기록"], ["roster", "학생·보호자"], ["settings", "학원 설정"]],
  teacher: [["home", "수업 현황"], ["website", "학원 홈페이지"], ["schedule", "일정·휴가"], ["attendance", "출결"], ["learning", "과제·공지"], ["grades", "성적 입력"], ["video", "영상 현황"], ["notifications", "발송 기록"]],
  student: [["home", "오늘 할 일"], ["website", "학원 홈페이지"], ["schedule", "일정"], ["learning", "과제·공지"], ["video", "학습 영상"], ["grades", "내 성적"]],
  parent: [["home", "자녀 현황"], ["website", "학원 홈페이지"], ["schedule", "일정"], ["attendance", "출결 기록"], ["learning", "과제·공지"], ["grades", "성적 추이"], ["notifications", "받은 알림"]],
};

const content = document.getElementById("content");
const navigation = document.getElementById("navigation");
const roleSelect = document.getElementById("role");
const dialog = document.getElementById("dialog");
const feedback = document.getElementById("feedback");
const installButton = document.getElementById("install-demo");
let role = "owner";
let activeScreen = "website";
let child = "jiwoo";
let toastTimer;
let cameraSession = null;
let photoPreviewUrl = null;
let selectedDay = "목";
let selectedExam = "linear-fourth";
let installPrompt = null;
let rosterPreview = null;
let rosterUploadId = 0;
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
      seoha: { status: "submitted", attachment: "일차함수 풀이 · 예시 사진", note: "12번에 풀이를 두 가지로 적었어요." },
      hyun: { status: "returned", attachment: "문제 풀이 · 예시 사진", note: "기울기 부호를 확인해 주세요." },
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
    leaves: [{ classId: "middle-two-fri", reason: "개인 일정", status: "pending", substitute: "" }],
    grades: {
      "linear-first": { published: true, scores: { jiwoo: 27, seoha: 30, hyun: 26, siwoo: 34 } },
      "linear-second": { published: true, scores: { jiwoo: 37, seoha: 41, hyun: 34, siwoo: 42 } },
      "linear-third": { published: true, scores: { jiwoo: 86, seoha: 89, hyun: 81, siwoo: 93 } },
      "linear-fourth": { published: false, scores: { seoha: 88, hyun: 77, siwoo: 92 } },
      "middle-one-first": { published: true, scores: { minjun: 25, yuna: 33 } },
      "middle-one-second": { published: true, scores: { minjun: 38, yuna: 42 } },
      "middle-one-third": { published: true, scores: { minjun: 84, yuna: 90 } },
    },
    settings: { rank: false, lateMinutes: "0", channel: "알림톡" },
    importedRosterRows: [],
    clock: 17 * 60 + 10,
  };
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.attendance) && Array.isArray(saved.notices) && Array.isArray(saved.reminders) && Array.isArray(saved.scannedQr)
      && Array.isArray(saved.notifications) && saved.submissions && saved.progress && Number.isInteger(saved.clock)) {
      return { ...freshState(), ...saved, importedRosterRows: Array.isArray(saved.importedRosterRows) ? saved.importedRosterRows : [] };
    }
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

function arrivalIsLate() {
  const lesson = classes.find(({ day, group }) => day === "목" && group === student("jiwoo").group);
  const [hour, minute] = lesson.time.split("–")[0].split(":").map(Number);
  return state.clock > hour * 60 + minute + Number(state.settings.lateMinutes);
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

function roleStudents() {
  return role === "teacher" ? students.filter(({ group }) => group === "중2 심화반") : students;
}

function metrics(people = students) {
  const checked = people.filter(({ id }) => latestEvent(id)).length;
  const late = people.filter(({ id }) => state.attendance.some((entry) => entry.student === id && entry.late)).length;
  const total = state.notifications.filter((entry) => people.some(({ id }) => id === entry.student)).length;
  const cards = [
    ["오늘 등원", `${checked}명`, `등록 ${people.length}명`, "▤"],
    ["오늘 지각", `${late}명`, Number(state.settings.lateMinutes) ? `수업 시작 ${Number(state.settings.lateMinutes)}분 후` : "수업 시작 기준", "◷"],
    ["발송 예시", `${total}건`, "알림톡·문자 기록", "◌"],
  ];
  return `<div class="metrics">${cards.map(([label, value, sub, icon]) => `<article class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon" aria-hidden="true">${icon}</span></div><strong>${value}</strong><small>${sub}</small></article>`).join("")}</div>`;
}

function notificationList(id, limit) {
  const roster = roleStudents();
  const records = state.notifications.filter((entry) => id ? id === entry.student : roster.some(({ id: learner }) => learner === entry.student));
  return list(records.slice(0, limit).map((entry) =>
    item(`${studentName(entry.student)} 학생 · ${entry.topic}`, `${entry.channel} · ${entry.time}`, badge("발송 예시", "purple"))), "받은 알림 기록이 없습니다.");
}

function overviewBar(label, numerator, denominator) {
  const percent = denominator ? Math.round(numerator / denominator * 100) : 0;
  return `<div class="overview-bar"><div><span>${escapeHtml(label)}</span><strong>${numerator} / ${denominator}명</strong></div>
    <progress class="progress" max="100" value="${percent}" aria-label="${escapeHtml(label)}"></progress></div>`;
}

function ownerHome() {
  const pending = state.leaves.filter(({ status }) => status === "pending");
  const scored = assessments.filter(({ id }) => state.grades[id].published).length;
  const pendingGrades = assessments.length - scored;
  const summaries = ["중1 개념반", "중2 심화반"].map((group) => {
    const roster = students.filter((person) => person.group === group);
    return `<div class="class-summary"><h3>${group}</h3>${overviewBar("오늘 등원", roster.filter(({ id }) => latestEvent(id)).length, roster.length)}
      ${overviewBar("과제 제출", roster.filter(({ id }) => ["submitted", "reviewed"].includes(state.submissions[id]?.status)).length, roster.length)}</div>`;
  });
  return `<section class="hero"><div><h1>학원 운영 현황</h1><p>11월 12일 목요일 · 학원 전체 출결, 학습 현황과 결재를 한눈에 확인합니다.</p></div>
    <div class="actions">${button("엑셀로 한 번에 등록", "navigate", { id: "roster", variant: "primary" })}${button("휴가 결재 보기", "navigate", { id: "schedule" })}</div></section>
    ${metrics()}<div class="columns">
      ${panel("반별 출결·과제 통계", summaries.join(""), button("출결 상세", "navigate", { id: "attendance", variant: "text-button" }))}
      <div>${panel("휴가 승인 대기", list(pending.map(leaveRow), "승인을 기다리는 휴가가 없습니다."), badge(`${pending.length}건`, "orange"))}
        ${panel("성적 공개 현황", list([item("공개 평가", `${scored}회`, badge("공개", "green")), item("작성 중인 평가", `${pendingGrades}회`, badge("초안"))]),
          button("리포트 보기", "navigate", { id: "grades", variant: "text-button" }), "stack")}</div>
    </div>`;
}

function teacherHome() {
  const roster = roleStudents();
  const toReview = roster.filter(({ id }) => state.submissions[id]?.status === "submitted");
  return `<section class="hero"><div><h1>오늘의 수업 현황</h1><p>11월 12일 목요일 · 이도현 선생님 · 중2 심화반</p></div>${staffAttendanceActions()}</section>
    ${metrics(roster)}<div class="columns">
      ${panel("담당 반 출결", attendanceTable(roster), button("출결 보기", "navigate", { id: "attendance", variant: "text-button" }))}
      <div>${panel("오늘 수업", list(classes.filter(({ teacher, day }) => teacher === "이도현" && day === "목").map(classRow)))}
        ${panel("과제 검토 대기", list(toReview.map(({ id, name }) => item(name, assignment.title, button("검토", "review", { id }))), "검토할 과제가 없습니다."),
          button("과제 보기", "navigate", { id: "learning", variant: "text-button" }), "stack")}</div>
    </div>`;
}

function attendanceHistory(id) {
  const roster = roleStudents();
  const records = state.attendance.filter((event) => id ? event.student === id : roster.some((learner) => learner.id === event.student)).toReversed();
  return list(records.map((event) => item(`${studentName(event.student)} 학생 · ${event.kind === "in" ? "등원" : "하원"}`, event.time, event.late ? badge("지각", "orange") : badge("기록 완료", "green"))));
}

function staffAttendanceActions() {
  return `<div class="actions">${button("출석 QR 띄우기", "teacher-qr")}${button("수동 출결 기록", "record-attendance", { variant: "primary" })}</div>`;
}

function staffAttendance() {
  const roster = roleStudents();
  return `${header("출결 관리", "등원·하원 기록과 지각을 확인합니다.", staffAttendanceActions())}
    ${metrics(roster)}<div class="columns">${panel("학생별 출결", attendanceTable(roster))}${panel("출결 기록", attendanceHistory())}</div>`;
}

function submissionBadge(value) {
  if (value?.status === "submitted") return badge("제출 완료", "green");
  if (value?.status === "reviewed") return badge("검토 완료", "green");
  if (value?.status === "returned") return badge("재제출 요청", "orange");
  return badge("미제출", "orange");
}

function staffLearning() {
  const roster = roleStudents();
  const unread = roster.filter(({ id }) => !state.notices.includes(id));
  return `${header("과제·공지 관리", "미제출 학생과 공지를 확인하지 않은 학생을 확인하세요.")}
  <div class="columns">
    ${panel(assignment.title, list(roster.map(({ id, name, group }) => {
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
    ${panel(video.title, list(roleStudents().map(({ id, name, group }) => {
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

function academyWebsite() {
  const profile = academyProfiles[demoVariant];
  const contact = profile.address ? `<dl class="school-contact">
      <div><dt>주소</dt><dd>${escapeHtml(profile.address)}</dd></div>
      <div><dt>운영시간</dt><dd>${escapeHtml(profile.hours)}</dd></div>
    </dl><p class="note">네이버 플레이스 공개 정보</p>` : `<dl class="school-contact">
      <div><dt>운영시간 예시</dt><dd>평일 14:00–22:00 · 토요일 10:00–17:00</dd></div>
    </dl>`;
  const rows = classes.map(({ group, day, time, teacher }) =>
    `<tr><th scope="row">${group}</th><td>${day}요일</td><td>${time}</td><td>${teacher} 선생님</td></tr>`).join("");
  return `<section class="academy-hero"><div><p class="academy-eyebrow">초등 고학년 · 중등 · 고등 수학</p>
      <h1>${escapeHtml(profile.name)}</h1><p>${escapeHtml(profile.intro)}</p>
      <div class="actions">${button("운영 화면 보기", "navigate", { id: "home", variant: "primary" })}
        <button class="secondary" type="button" disabled>상담 신청 비활성화</button></div>
    </div><div class="academy-card"><h2>학원 안내</h2>${contact}</div></section>
    <div class="website-sections">
      ${panel("강사진", `<div class="teacher-cards">${teachers.map(({ name, role: job, subject, detail }) =>
        `<article><span class="teacher-initial" aria-hidden="true">${name[0]}</span><div><h3>${name} ${job === "원장" ? "원장" : "선생님"}</h3>
          <strong>${subject}</strong><p class="note">${detail}</p></div></article>`).join("")}</div>`, badge("예시", "purple"))}
      <div class="columns">
        ${panel("수업 시간표", `<div class="table-scroll"><table><thead><tr><th scope="col">반</th><th scope="col">요일</th>
          <th scope="col">시간</th><th scope="col">담당</th></tr></thead><tbody>${rows}</tbody></table></div>`, badge("예시", "purple"))}
        ${panel("공지", list([item(notice.title, "11월 12일", button("공지 보기", "website-notice", { variant: "text-button" }))]), badge("예시", "purple"))}
      </div>
    </div>`;
}

function classRow(lesson) {
  const replacement = state.leaves.find((entry) => entry.classId === lesson.id && entry.status === "approved");
  const teacher = replacement ? replacement.substitute : lesson.teacher;
  return item(lesson.group, `${lesson.time} · ${teacher} 선생님 · ${lesson.room}`, replacement ? badge("대체 수업", "purple") : "");
}

function leaveRow(entry) {
  const lesson = classes.find(({ id }) => id === entry.classId);
  if (!lesson) return "";
  const status = { pending: ["승인 대기", "orange"], approved: ["승인 완료", "green"], declined: ["반려", "red"] }[entry.status] ?? ["확인 필요", "neutral"];
  const review = role === "owner" && entry.status === "pending"
    ? button("휴가 검토", "review-leave", { id: entry.classId, variant: "text-button" }) : "";
  const detail = `11월 ${lesson.dayNumber}일 ${lesson.day}요일 · ${lesson.group} · ${entry.reason}${entry.substitute ? ` · 대체 ${entry.substitute} 선생님` : ""}`;
  return item(`${lesson.teacher} 선생님 휴가`, detail, badge(...status) + review);
}

function calendarView() {
  const staff = role === "owner" || role === "teacher";
  const selectedStudent = student(role === "student" ? "jiwoo" : child);
  const visible = classes.filter((lesson) => role === "owner" || (role === "teacher" ? lesson.teacher === "이도현" : lesson.group === selectedStudent?.group));
  const days = scheduleDays.map((day, index) => `<button class="day-button" type="button" data-action="schedule-day" data-id="${day}" aria-pressed="${day === selectedDay}">
    <span>${day}</span><strong>${index + 9}</strong></button>`).join("");
  const heading = header(staff ? "일정·휴가" : "수업 일정",
    "11월 9일–14일 수업과 변경된 일정을 확인하세요.", role === "teacher" ? button("휴가 신청", "request-leave", { variant: "primary" }) : "");
  return heading + (role === "parent" ? childPicker() : "") + `<div class="columns">
    ${panel("11월 둘째 주", `<div class="calendar-days" aria-label="요일 선택">${days}</div>
      <div class="calendar-agenda"><h3>${selectedDay}요일 수업</h3>${list(visible.filter(({ day }) => day === selectedDay).map(classRow), "예정된 수업이 없습니다.")}</div>`)}
    ${staff ? panel(role === "owner" ? "교사 휴가 결재" : "내 휴가 신청",
      list(state.leaves.filter((entry) => role === "owner" || visible.some(({ id }) => id === entry.classId)).map(leaveRow), "등록된 휴가가 없습니다."))
      : panel("이번 주 일정", list(visible.map(classRow), "등록된 수업이 없습니다."))}
  </div>`;
}

function rankInAssessment(exam, id) {
  const { scores } = state.grades[exam.id];
  const graded = Object.values(scores).filter(Number.isFinite);
  return state.settings.rank && Number.isFinite(scores[id]) && graded.length >= 3
    ? `${1 + graded.filter((value) => value > scores[id]).length}위` : "";
}

function gradeSummary(exam) {
  const result = state.grades[exam.id];
  const values = Object.values(result.scores).filter(Number.isFinite);
  const count = students.filter(({ group }) => group === exam.group).length;
  const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null;
  return { result, entered: Object.keys(result.scores).length, count, average };
}

function ownerGrades() {
  const reports = assessments.toReversed().map((exam) => {
    const { result, entered, count, average } = gradeSummary(exam);
    return {
      title: escapeHtml(exam.title),
      group: escapeHtml(exam.group),
      date: escapeHtml(exam.date),
      entryCount: `${entered} / ${count}명`,
      classAverage: average === null ? "—" : `${average} / ${exam.maximum}점`,
      status: badge(result.published ? "공개" : "초안", result.published ? "green" : "neutral"),
    };
  });
  const rows = reports.map(({ title, group, date, entryCount, classAverage, status }) =>
    `<tr><th scope="row">${title}</th><td>${group}</td><td>${date}</td><td>${entryCount}</td><td>${classAverage}</td><td>${status}</td></tr>`).join("");
  const cards = reports.map(({ title, group, date, entryCount, classAverage, status }) =>
    `<li class="grade-card"><div class="grade-card-heading"><h3>${title}</h3>${status}</div>
      <dl><div><dt>반</dt><dd>${group}</dd></div><div><dt>시험일</dt><dd>${date}</dd></div>
        <div><dt>입력</dt><dd>${entryCount}</dd></div><div><dt>반 평균</dt><dd>${classAverage}</dd></div></dl></li>`).join("");
  return header("성적 리포트", "학원 전체 평가의 입력률, 반 평균과 공개 상태입니다.")
    + panel("평가별 현황", `<div class="table-scroll"><table><thead><tr><th scope="col">평가</th><th scope="col">반</th><th scope="col">시험일</th>
        <th scope="col">입력</th><th scope="col">반 평균</th><th scope="col">상태</th></tr></thead><tbody>${rows}</tbody></table></div>
      <ul class="grade-cards" aria-label="평가별 현황" role="list">${cards}</ul>`, "", "grade-report");
}

function teacherGrades() {
  const exams = assessments.filter(({ group }) => group === "중2 심화반").toReversed();
  const exam = exams.find(({ id }) => id === selectedExam) ?? exams[0];
  const { result, entered, count } = gradeSummary(exam);
  const choices = exams.map(({ id, title }) => `<option value="${id}"${id === exam.id ? " selected" : ""}>${title}</option>`).join("");
  const rows = roleStudents().map(({ id, name }) => {
    const score = result.scores[id];
    const label = score === "absent" ? "결시" : Number.isFinite(score) ? `${score} / ${exam.maximum}점` : "미입력";
    const action = !result.published ? button(Number.isFinite(score) || score === "absent" ? "점수 수정" : "점수 입력", "edit-score", { id: `${exam.id}:${id}` }) : "";
    return item(name, label, action);
  });
  const publication = result.published ? badge("공개", "green")
    : button("성적 공개", "publish-scores", { id: exam.id, variant: "primary", disabled: entered < count });
  return header("성적 입력", "담당 반의 평가 점수와 결시를 입력하고 보호자에게 공개합니다.")
    + panel("평가 선택", `<label class="field-inline">평가<select id="grade-assessment">${choices}</select></label>`)
    + panel(exam.title, `<p class="note">중2 심화반 · ${exam.date} · 만점 ${exam.maximum}점 · ${entered} / ${count}명 입력</p>${list(rows)}`, publication, "stack");
}

function publishedScores(id) {
  return assessments.flatMap((exam) => {
    const { result, average } = gradeSummary(exam);
    const score = result.scores[id];
    if (!result.published || !Object.hasOwn(result.scores, id)) return [];
    const percent = Number.isFinite(score) ? Math.round(score / exam.maximum * 1000) / 10 : null;
    return [{ exam, score, percent, average, rank: rankInAssessment(exam, id) }];
  });
}

function scoreChart(id) {
  const points = publishedScores(id).filter(({ percent }) => percent !== null);
  if (!points.length) return '<p class="empty">공개된 성적이 없습니다.</p>';
  const description = points.map(({ exam, percent }) => `${exam.date} ${percent}점`).join(", ");
  return `<div class="score-chart"><canvas data-score-chart="${id}" role="img" aria-label="100점 환산 성적 추이 · ${escapeHtml(description)}">${escapeHtml(description)}</canvas></div>`;
}

function paintScoreCharts() {
  for (const canvas of content.querySelectorAll("[data-score-chart]")) {
    const points = publishedScores(canvas.dataset.scoreChart).filter(({ percent }) => percent !== null);
    const width = Math.max(200, Math.floor(canvas.getBoundingClientRect().width));
    const height = 200;
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) continue;
    context.scale(scale, scale);
    const left = 34;
    const right = width - 22;
    const top = 21;
    const bottom = height - 29;
    const y = (value) => bottom - (bottom - top) * value / 100;
    context.font = "12px system-ui, sans-serif";
    context.textBaseline = "middle";
    context.textAlign = "right";
    for (const mark of [0, 25, 50, 75, 100]) {
      context.beginPath();
      context.strokeStyle = "#e6e7f0";
      context.moveTo(left, y(mark));
      context.lineTo(right, y(mark));
      context.stroke();
      context.fillStyle = "#62687c";
      context.fillText(String(mark), left - 7, y(mark));
    }
    // Keep the endpoint labels inside the grid and clear of the vertical axis labels.
    const pointInset = 18;
    const coordinates = points.map(({ percent }, index) => ({
      x: points.length === 1 ? (left + right) / 2 : left + pointInset + (right - left - 2 * pointInset) * index / (points.length - 1),
      y: y(percent),
    }));
    context.beginPath();
    coordinates.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.lineWidth = 2.5;
    context.strokeStyle = "#583ad0";
    context.stroke();
    context.textAlign = "center";
    coordinates.forEach((point, index) => {
      context.beginPath();
      context.fillStyle = "#583ad0";
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#43279e";
      context.fillText(String(points[index].percent), point.x, Math.max(10, point.y - 12));
      context.fillStyle = "#62687c";
      context.fillText(points[index].exam.date, point.x, bottom + 18);
    });
  }
}

function learnerGrades(id, heading) {
  const results = publishedScores(id);
  return header(heading, `${studentName(id)} 학생의 공개된 평가와 100점 환산 추이입니다.`)
    + (role === "parent" ? childPicker() : "")
    + `<div class="columns">${panel("회차별 성적 추이", scoreChart(id), badge("100점 환산", "purple"))}
      ${panel("공개 성적", list(results.toReversed().map(({ exam, score, average, rank }) =>
        item(exam.title, `${exam.date}${average !== null && students.filter(({ group }) => group === exam.group).length >= 3 ? ` · 반 평균 ${average}점` : ""}`,
          badge(score === "absent" ? "결시" : `${score} / ${exam.maximum}점`, "purple") + (rank ? badge(rank, "green") : ""))), "공개된 성적이 없습니다."))}</div>`;
}

function ownerSettings() {
  return header("학원 설정", "출결 처리, 발송 채널과 성적 공개 기본값을 설정합니다.", button("설정 편집", "edit-settings", { variant: "primary" }))
    + panel("운영 설정", `<dl class="settings-grid">
      <div><dt>학원 이름</dt><dd>${escapeHtml(academyProfiles[demoVariant].name)}</dd></div>
      <div><dt>지각 기준</dt><dd>${Number(state.settings.lateMinutes) ? `수업 시작 ${Number(state.settings.lateMinutes)}분 후` : "수업 시작 시각"}</dd></div>
      <div><dt>출결 알림 채널</dt><dd>${escapeHtml(state.settings.channel)}</dd></div>
      <div><dt>등수 공개</dt><dd>${state.settings.rank ? "켜짐" : "꺼짐"}</dd></div>
    </dl><p class="note">변경한 설정은 이 브라우저의 체험 화면에 적용됩니다.</p>`);
}

function rosterRow(row, mode) {
  const hasErrors = row.errors?.length;
  const status = mode === "saved" ? badge("반영 완료", "green") : hasErrors ? badge("수정 필요", "red")
    : state.importedRosterRows.includes(row.key) ? badge("이미 등록됨") : badge("등록 가능", "green");
  const source = `학생 명부 ${row.line}행${row.guardianLine ? ` · 보호자 연결 ${row.guardianLine}행` : ""}`;
  return `<li class="roster-row"><div class="roster-row-heading"><div><strong>${escapeHtml(row.key)}</strong>
    ${mode === "preview" ? `<p class="note">${escapeHtml(source)}</p>` : ""}</div>${status}</div>
    <dl><div><dt>초대용 보호자 이메일</dt><dd>${escapeHtml(row.guardian || "—")}</dd></div>
    <div><dt>연령 및 법정대리인 동의</dt><dd>${escapeHtml(`${row.age} · ${row.consent}`)}</dd></div></dl>
    ${hasErrors ? `<ul class="roster-errors">${row.errors.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : ""}</li>`;
}

function rosterRows(rows, mode) {
  return `<ul class="roster-rows">${rows.map((row) => rosterRow(row, mode)).join("")}</ul>`;
}

function rosterPreviewBody() {
  if (!rosterPreview) return "";
  if (!rosterPreview.sample) return `<p id="roster-preview-status" class="roster-message" tabindex="-1" role="status">${escapeHtml(rosterPreview.message)}</p>`;
  const { rows } = rosterPreview.sample;
  const invalid = rows.filter((row) => row.errors?.length).length;
  const existing = rows.filter((row) => !row.errors?.length && state.importedRosterRows.includes(row.key)).length;
  const ready = rows.length - invalid - existing;
  const message = rosterPreview.message || (invalid ? "오류가 표시된 행을 확인한 뒤 정상 예시로 반영을 체험하세요."
    : ready ? "학생과 보호자 연결, 동의 상태를 확인한 뒤 명부에 반영하세요." : "모든 행이 이미 등록되어 있습니다.");
  return `<section class="roster-preview" aria-labelledby="roster-preview-title"><div class="roster-row-heading">
    <h3 id="roster-preview-title" tabindex="-1">업로드 미리보기</h3><p class="note">${escapeHtml(rosterPreview.sample.name)}</p></div>
    <div class="actions">${badge(`등록 가능 ${ready}명`, "green")}${badge(`오류 ${invalid}명`, invalid ? "red" : "neutral")}${badge(`이미 등록 ${existing}명`)}</div>
    <p class="note" role="status">${escapeHtml(message)}</p>${rosterRows(rows, "preview")}
    ${button("확인 후 등록", "apply-roster", { variant: "primary", disabled: !ready || Boolean(invalid) })}</section>`;
}

function ownerRoster() {
  const { samples } = DemoRoster;
  const registered = samples[0].rows.filter((row) => state.importedRosterRows.includes(row.key));
  return header("학생·보호자 명부", "엑셀로 학생을 등록하고 보호자 연결과 동의 상태를 함께 확인하세요.")
    + panel("엑셀로 한 번에 등록", `<p class="note">아래 두 가상 명부 원본으로 체험할 수 있습니다. 보호자는 초대를 수락한 뒤 자녀 포털에 접근합니다.</p>
      <div class="actions roster-files"><label class="primary file-choice" for="roster-file">엑셀 파일 선택
        <input class="sr-only" id="roster-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label>
        ${samples.map((sample) => `<a class="secondary roster-download" href="${escapeHtml(new URL(sample.path, demoRoot).href)}" download="${escapeHtml(sample.name)}">${escapeHtml(sample.downloadLabel)}</a>`).join("")}
      </div><div class="actions roster-examples">${samples.map((sample) => button(sample.previewLabel, "preview-roster", { id: sample.id, variant: "text-button" })).join("")}</div>
      ${rosterPreviewBody()}`)
    + panel("이번 체험에서 등록한 명부", registered.length ? rosterRows(registered, "saved") : '<p class="note">등록하면 학생과 보호자 초대 대기 항목이 여기에 표시됩니다.</p>', badge(`${registered.length}명`), "stack");
}

function showRosterPreview(sample, message = "") {
  rosterPreview = { sample, message };
  render();
  content.querySelector("#roster-preview-title, #roster-preview-status")?.focus();
}

async function previewRosterFile(file) {
  const request = ++rosterUploadId;
  if (!/\.xlsx$/i.test(file.name) || file.size === 0 || file.size > 1024 * 1024) {
    showRosterPreview(null, "1MiB 이하의 엑셀(.xlsx) 체험 파일을 선택해 주세요.");
    return;
  }
  showRosterPreview(null, "체험 파일을 확인하는 중입니다.");
  let sample;
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    sample = DemoRoster.samples.find((example) => example.hash === hash);
  } catch {
    // A browser that cannot read the file still supports the direct example controls.
  }
  if (request !== rosterUploadId || role !== "owner" || activeScreen !== "roster") return;
  showRosterPreview(sample, sample ? "" : "제공된 가상 명부 원본을 선택해 주세요. 정상 예시와 오류 예시를 각각 내려받을 수 있습니다.");
}

function applyRosterPreview() {
  const sample = rosterPreview?.sample;
  if (!sample || sample.rows.some((row) => row.errors?.length)) return;
  const added = sample.rows.filter((row) => !state.importedRosterRows.includes(row.key));
  if (!added.length) return;
  state.importedRosterRows.push(...added.map((row) => row.key));
  rosterPreview.message = `학생 ${added.length}명의 명부를 반영했습니다.`;
  saveState();
  content.querySelector("#roster-preview-title")?.focus();
  announce(rosterPreview.message);
}

function studentHome() {
  const reminders = state.reminders.filter((entry) => entry.student === "jiwoo");
  const alerts = reminders.length ? panel("학습 알림", list(reminders.map((entry) => item(entry.topic, `선생님 · ${entry.time}`))), "", "stack") : "";
  return `<section class="hero"><div><h1>지우 학생의 오늘 할 일</h1><p>중2 심화반 · 마감과 시청 진도를 한눈에 확인하세요.</p></div>
    <div class="actions">${button("카메라로 QR 찍기", "camera-qr", { variant: "primary" })}${button("출결 체험하기", "mock-qr")}</div></section>
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

function childPicker() {
  return `<div class="parent-picker" aria-label="자녀 선택">${["jiwoo", "minjun"].map((id) =>
    `<button class="secondary" type="button" data-action="child" data-id="${id}" aria-pressed="${id === child}">${studentName(id)}</button>`).join("")}</div>`;
}

function parentView(screen) {
  const controls = childPicker();
  if (screen === "grades") return learnerGrades(child, "성적 추이");
  if (screen === "attendance") return header("자녀 출결", "자녀별 등원·하원 기록입니다.") + controls + panel("출결 기록", attendanceHistory(child));
  if (screen === "notifications") return header("받은 알림", "등원·하원 알림을 자녀별로 확인합니다.") + controls + panel("알림 기록", notificationList(child, 20));
  if (screen === "learning") return controls + learnerWork(child, false);
  return `<section class="hero"><div><h1>우리 아이 학원 현황</h1><p>두 자녀의 출결과 오늘 할 일을 확인하세요.</p></div></section>${controls}
    <div class="columns">
      <div>${panel(`${studentName(child)} 학생 출결`, attendanceHistory(child))}
      ${panel("학습 상태", list(taskRows(child, false)), "", "stack")}</div>
      <div>${panel("최근 알림", notificationList(child, 3))}
      ${panel("성적 추이", scoreChart(child), button("성적 보기", "navigate", { id: "grades", variant: "text-button" }), "stack")}
      <div class="panel stack"><div class="panel-head"><h2>학습 영상</h2>${Number(state.progress[child]) >= 90 ? badge("시청 완료", "green") : badge("시청 중", "purple")}</div>
      <p>${video.title}</p><p class="note">시청률 ${Number(state.progress[child]) || 0}%</p></div></div>
    </div>`;
}

function render() {
  navigation.innerHTML = menus[role].map(([screen, label]) => `<button class="nav-button" type="button" data-action="navigate" data-id="${screen}"${screen === activeScreen ? ' aria-current="page"' : ""}><span aria-hidden="true">${symbols[screen]}</span>${label}</button>`).join("");
  if (activeScreen === "website") content.innerHTML = academyWebsite();
  else if (activeScreen === "schedule") content.innerHTML = calendarView();
  else if (role === "parent") content.innerHTML = parentView(activeScreen);
  else if (role === "student") {
    const screens = { home: studentHome, learning: () => learnerWork("jiwoo", true), grades: () => learnerGrades("jiwoo", "내 성적"),
      video: () => header("학습 영상", "마지막 시청 위치에서 이어볼 수 있습니다.") + videoCard("jiwoo", true) };
    content.innerHTML = screens[activeScreen]();
  } else {
    const screens = { home: role === "owner" ? ownerHome : teacherHome, attendance: staffAttendance, learning: staffLearning,
      grades: role === "owner" ? ownerGrades : teacherGrades, roster: ownerRoster, settings: ownerSettings, video: staffVideo,
      notifications: () => header("발송 기록", "출결과 연결된 알림톡·문자 발송 예시입니다.") + panel("발송 예시", notificationList(null, 30)) };
    content.innerHTML = screens[activeScreen]();
  }
  paintScoreCharts();
}

function openDialog(title, body, confirmLabel, handler, destructive = false) {
  dialog.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2><div class="dialog-body">${body}
    <div class="dialog-actions"><button type="button" class="secondary" data-action="close-dialog">닫기</button>
    ${confirmLabel ? `<button type="button" data-confirm class="${destructive ? "secondary danger" : "primary"}">${escapeHtml(confirmLabel)}</button>` : ""}</div></div>`;
  dialog.querySelector("[data-confirm]")?.addEventListener("click", () => {
    const selected = new Map(Array.from(dialog.querySelectorAll('select[name], input[name]:not([type="file"])'), (control) => [control.name, control.value]));
    if (handler?.(selected) !== false) dialog.close();
  });
  dialog.showModal();
}

function showInstallGuide() {
  if (dialog.open) return;
  openDialog("홈 화면에 추가하는 방법", `<p>앱 스토어를 거치지 않고 이 데모를 홈 화면 아이콘으로 열 수 있습니다.</p>
    <ol class="install-steps">
      <li><strong>아이폰 Safari</strong>에서 <strong>공유 → 홈 화면에 추가</strong>를 선택하세요. <strong>웹 앱으로 열기</strong>가 보이면 켜고 추가하세요.</li>
      <li><strong>안드로이드 Chrome</strong>의 메뉴 <strong>⋮</strong>에서 <strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택하세요.</li>
    </ol>
    <p class="note">카카오톡에서 보고 있다면 Safari 또는 Chrome에서 다시 열어 주세요.</p>`);
}

async function installDemo() {
  const prompt = installPrompt;
  installPrompt = null;
  if (!prompt) return showInstallGuide();
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "dismissed") showInstallGuide();
  } catch {
    showInstallGuide();
  }
}

function recordAttendance() {
  const roster = roleStudents();
  openDialog("수동 출결 기록", `<label>학생<select name="student">${roster.map(({ id, name }) => `<option value="${id}">${name}</option>`).join("")}</select></label>
    <label>기록 종류<select name="kind"><option value="in">등원</option><option value="late">지각 등원</option><option value="out">하원</option></select></label>
    <label>알림 채널<select name="channel">${["알림톡", "문자"].map((channel) =>
      `<option${channel === state.settings.channel ? " selected" : ""}>${channel}</option>`).join("")}</select></label>`, "기록 저장", (form) => {
    const id = form.get("student");
    const kind = form.get("kind");
    if (!roster.some((learner) => learner.id === id) || !["in", "late", "out"].includes(kind)) return false;
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
    announce("출결과 발송 예시를 기록했습니다.");
    return true;
  });
}

function releasePhotoPreview() {
  if (!photoPreviewUrl) return;
  URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = null;
  dialog.querySelector("[data-photo-preview]")?.removeAttribute("src");
}

function submitHomework() {
  let ready = false;
  openDialog("풀이 사진 제출", `<p>${assignment.detail}</p>
    <div class="actions photo-actions">
      <label class="secondary file-choice" for="worksheet-camera">사진 찍기
        <input class="sr-only" id="worksheet-camera" type="file" accept="image/*" capture="environment">
      </label>
      <label class="secondary file-choice" for="worksheet-picker">사진 선택
        <input class="sr-only" id="worksheet-picker" type="file" accept="image/*">
      </label>
    </div>
    <img class="photo-preview" data-photo-preview alt="선택한 풀이 사진 미리보기" hidden>
    <p class="note" data-photo-status role="status" aria-live="polite">사진은 이 창에서만 보이며, 닫으면 미리보기가 지워집니다.</p>`, "제출하기", () => {
    if (!ready) return false;
    state.submissions.jiwoo = { status: "submitted", attachment: "풀이 사진", note: "" };
    saveState();
    announce("제출 상태를 저장했습니다. 선생님 화면에서 확인할 수 있습니다.");
  });
  const preview = dialog.querySelector("[data-photo-preview]");
  const status = dialog.querySelector("[data-photo-status]");
  const submit = dialog.querySelector("[data-confirm]");
  submit.disabled = true;
  for (const input of dialog.querySelectorAll('input[type="file"]')) {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      releasePhotoPreview();
      ready = false;
      submit.disabled = true;
      preview.hidden = true;
      const isPhoto = /^image\/(?:jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.type)
        || ((!file.type || file.type === "application/octet-stream") && /\.(?:jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name));
      if (!isPhoto || file.size > 20 * 1024 * 1024) {
        status.textContent = "20MB 이하의 사진을 선택해 주세요.";
        return;
      }
      const url = URL.createObjectURL(file);
      photoPreviewUrl = url;
      preview.src = url;
      status.textContent = "사진 미리보기를 여는 중입니다.";
      try {
        await preview.decode();
      } catch {
        if (photoPreviewUrl === url) {
          releasePhotoPreview();
          status.textContent = "이 기기에서 미리볼 수 없는 사진입니다. JPG 또는 PNG를 선택해 주세요.";
        }
        return;
      }
      if (photoPreviewUrl !== url || !dialog.open) return;
      preview.hidden = false;
      ready = true;
      submit.disabled = false;
      status.textContent = "사진 미리보기입니다. 제출 상태만 이 브라우저에 기록합니다.";
    });
  }
}

function requestLeave() {
  const options = classes.filter(({ id, teacher, day }) => teacher === "이도현" && day !== "목"
    && !state.leaves.some((entry) => entry.classId === id && entry.status !== "declined"));
  if (!options.length) {
    announce("신청 가능한 수업이 없습니다.");
    return;
  }
  openDialog("휴가 신청", `<label>수업<select name="class">${options.map(({ id, dayNumber, group, time }) =>
    `<option value="${id}">11월 ${dayNumber}일 · ${group} · ${time}</option>`).join("")}</select></label>
    <label>사유<select name="reason"><option>개인 일정</option><option>병가</option><option>연수</option></select></label>`, "신청하기", (form) => {
    const classId = form.get("class");
    const reason = form.get("reason");
    if (!options.some(({ id }) => id === classId) || !["개인 일정", "병가", "연수"].includes(reason)) return false;
    state.leaves = state.leaves.filter((entry) => entry.classId !== classId);
    state.leaves.push({ classId, reason, status: "pending", substitute: "" });
    saveState();
    announce("휴가 신청을 등록했습니다.");
  });
}

function reviewLeave(id) {
  const entry = state.leaves.find(({ classId, status }) => classId === id && status === "pending");
  const lesson = classes.find((record) => record.id === id);
  if (!entry || !lesson) return;
  const available = teachers.filter(({ name }) => name !== lesson.teacher && !classes.some((candidate) =>
    candidate.teacher === name && candidate.day === lesson.day && candidate.time === lesson.time));
  openDialog("휴가 승인·대체 교사 배정", `<p>${lesson.teacher} 선생님 · 11월 ${lesson.dayNumber}일 · ${lesson.group}</p>
    <p class="note">신청 사유 ${escapeHtml(entry.reason)}</p>
    <label>대체 교사<select name="substitute">${available.map(({ name }) => `<option value="${name}">${name} 선생님</option>`).join("")}</select></label>`,
  "승인·배정", (form) => {
    const substitute = form.get("substitute");
    if (!available.some(({ name }) => name === substitute)) return false;
    entry.status = "approved";
    entry.substitute = substitute;
    selectedDay = lesson.day;
    saveState();
    announce(`휴가를 승인하고 ${substitute} 선생님을 배정했습니다.`);
  });
}

function editScore(value) {
  const [examId, learner] = value.split(":");
  const exam = assessments.find(({ id }) => id === examId && id === selectedExam);
  const result = state.grades[examId];
  if (!exam || !result || result.published || !roleStudents().some(({ id }) => id === learner)) return;
  const previous = result.scores[learner];
  openDialog(`${studentName(learner)} 학생 점수`, `<p>${exam.title} · 만점 ${exam.maximum}점</p>
    <label>응시 상태<select name="status"><option value="graded">응시</option><option value="absent"${previous === "absent" ? " selected" : ""}>결시</option></select></label>
    <label>점수<input name="score" type="number" min="0" max="${exam.maximum}" step="0.01" inputmode="decimal" value="${Number.isFinite(previous) ? previous : ""}"></label>
    <p class="note" data-score-status role="status"></p>`, "점수 저장", (form) => {
    const status = form.get("status");
    const value = form.get("score");
    const score = Number(value);
    if (status !== "absent" && (!value || !Number.isFinite(score) || score < 0 || score > exam.maximum || !/^\d+(?:\.\d{1,2})?$/.test(value))) {
      dialog.querySelector("[data-score-status]").textContent = `0점부터 ${exam.maximum}점까지 입력하세요.`;
      return false;
    }
    result.scores[learner] = status === "absent" ? "absent" : score;
    saveState();
    announce("점수를 저장했습니다.");
  });
}

function publishScores(id) {
  const exam = assessments.find((entry) => entry.id === id && id === selectedExam);
  if (!exam) return;
  const { result, entered, count } = gradeSummary(exam);
  if (result.published || entered !== count) return;
  openDialog("성적 공개", `<p>${exam.title}의 성적을 학생과 보호자에게 공개합니다.</p>`, "공개하기", () => {
    result.published = true;
    saveState();
    announce("성적을 공개했습니다.");
  });
}

function editSettings() {
  openDialog("학원 설정 편집", `<label>지각 기준<select name="lateMinutes">${["0", "5", "10", "15"].map((minutes) =>
    `<option value="${minutes}"${state.settings.lateMinutes === minutes ? " selected" : ""}>${minutes === "0" ? "수업 시작 시각" : `수업 시작 ${minutes}분 후`}</option>`).join("")}</select></label>
    <label>출결 알림 채널<select name="channel">${["알림톡", "문자"].map((channel) =>
      `<option${state.settings.channel === channel ? " selected" : ""}>${channel}</option>`).join("")}</select></label>
    <label>등수 공개<select name="rank"><option value="off"${state.settings.rank ? "" : " selected"}>꺼짐</option>
      <option value="on"${state.settings.rank ? " selected" : ""}>켜짐</option></select></label>`, "설정 저장", (form) => {
    const lateMinutes = form.get("lateMinutes");
    const channel = form.get("channel");
    if (!["0", "5", "10", "15"].includes(lateMinutes) || !["알림톡", "문자"].includes(channel)) return false;
    state.settings = { rank: form.get("rank") === "on", lateMinutes, channel };
    saveState();
    announce("학원 설정을 저장했습니다.");
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
  openDialog(video.title, `<div class="media-preview"><strong>▷</strong><small>예시 영상</small></div><p>저장된 시청률 ${progress}%</p>
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
  openDialog(`30초 ${label} QR 체험`, `<div class="mock-qr" aria-hidden="true"></div>
    <p>남은 시간 <strong data-qr-time>30초</strong></p>
    <p class="note">카메라 없이 출결 기록을 체험합니다.</p>`, `${label} 체험하기`, () => {
    if (Date.now() >= expiresAt) return false;
    const time = sessionTime();
    const late = kind === "in" && arrivalIsLate();
    state.attendance.push({ student: "jiwoo", kind, late, time });
    state.notifications.unshift({ student: "jiwoo", channel: state.settings.channel, topic: late ? "지각 등원 안내" : `${label} 안내`, time });
    saveState();
    announce(`${label} 체험을 완료했습니다. 이 브라우저에 기록했습니다.`);
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
    <canvas class="live-qr" role="img" aria-label="등원 출석 QR"></canvas>
    <p>다음 QR로 갱신까지 <strong data-qr-time>30초</strong></p>
    <p class="note">휴대폰에서 같은 데모의 학생 화면을 열고 ‘카메라로 QR 찍기’를 눌러 주세요. 스캔 결과는 휴대폰 브라우저에만 남습니다.</p>`);

  const kind = dialog.querySelector('select[name="kind"]');
  const canvas = dialog.querySelector("canvas");
  const countdown = dialog.querySelector("[data-qr-time]");
  let expiresAt = 0;
  function issueQr() {
    expiresAt = Math.floor(Date.now() / 1000) + qrLifetimeSeconds;
    const nonce = Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, "0")).join("");
    canvas.setAttribute("aria-label", `${kind.value === "in" ? "등원" : "하원"} 출석 QR`);
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
  const late = kind === "in" && arrivalIsLate();
  state.scannedQr = [...state.scannedQr.slice(-49), nonce];
  state.attendance.push({ student: "jiwoo", kind, late, time });
  state.notifications.unshift({ student: "jiwoo", channel: state.settings.channel, topic: late ? "지각 등원 안내" : `${label} 안내`, time });
  saveState();
  return { message: `${label} 체험을 완료했습니다. 이 브라우저에 기록했습니다.`, done: true };
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
    status.textContent = "카메라를 열지 못했습니다. 브라우저의 카메라 권한을 확인하거나 출결 체험하기를 이용해 주세요.";
  }
}

dialog.addEventListener("close", stopCamera);
dialog.addEventListener("close", releasePhotoPreview);
window.addEventListener("pagehide", stopCamera);
window.addEventListener("pagehide", releasePhotoPreview);
window.addEventListener("resize", paintScoreCharts);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && cameraSession?.stream) dialog.close();
});

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const { action, id } = control.dataset;
  if (action === "navigate" && menus[role].some(([screen]) => screen === id)) {
    if (activeScreen === "roster" && id !== "roster") {
      rosterUploadId++;
      rosterPreview = null;
    }
    activeScreen = id;
    render();
    content.focus();
  } else if (action === "schedule-day" && scheduleDays.includes(id)) {
    selectedDay = id;
    render();
    content.querySelector('.day-button[aria-pressed="true"]')?.focus();
  } else if (action === "record-attendance" && ["owner", "teacher"].includes(role)) recordAttendance();
  else if (action === "submit-homework" && role === "student") submitHomework();
  else if (action === "website-notice") openDialog(notice.title, `<p>${escapeHtml(notice.detail)}</p>`);
  else if (action === "request-leave" && role === "teacher") requestLeave();
  else if (action === "review-leave" && role === "owner") reviewLeave(id);
  else if (action === "edit-score" && role === "teacher") editScore(id);
  else if (action === "publish-scores" && role === "teacher") publishScores(id);
  else if (action === "edit-settings" && role === "owner") editSettings();
  else if (action === "preview-roster" && role === "owner" && activeScreen === "roster") {
    const sample = DemoRoster.samples.find((example) => example.id === id);
    if (sample) {
      rosterUploadId++;
      showRosterPreview(sample);
    }
  } else if (action === "apply-roster" && role === "owner" && activeScreen === "roster") applyRosterPreview();
  else if (action === "review") reviewSubmission(id);
  else if (action === "open-notice") readNotice();
  else if (action === "watch-video") watchVideo();
  else if (action === "teacher-qr" && (role === "teacher" || role === "owner")) openTeacherQr();
  else if (action === "camera-qr" && role === "student") void openCameraQr();
  else if (action === "mock-qr" && role === "student") openMockQr();
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

content.addEventListener("change", (event) => {
  const field = event.target;
  if (field.id === "roster-file" && role === "owner" && activeScreen === "roster") {
    const file = field.files?.[0];
    field.value = "";
    if (file) void previewRosterFile(file);
    return;
  }
  if (field.id !== "grade-assessment") return;
  selectedExam = field.value;
  render();
  content.querySelector("#grade-assessment")?.focus();
});

roleSelect.addEventListener("change", () => {
  rosterUploadId++;
  rosterPreview = null;
  role = roleSelect.value;
  activeScreen = "home";
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  openDialog("데모 초기화", "<p>이 브라우저의 변경 사항을 지우고 시작 상태로 돌아갑니다.</p>", "초기화", () => {
    rosterUploadId++;
    rosterPreview = null;
    state = freshState();
    child = "jiwoo";
    selectedDay = "목";
    selectedExam = "linear-fourth";
    saveState();
    announce("데모 데이터를 초기화했습니다.");
  }, true);
});

const standaloneMode = window.matchMedia("(display-mode: standalone)");
function updateInstallButton() {
  installButton.hidden = standaloneMode.matches || navigator.standalone === true;
}
updateInstallButton();
standaloneMode.addEventListener("change", updateInstallButton);
installButton.addEventListener("click", () => { void installDemo(); });
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});
if (window.isSecureContext && "serviceWorker" in navigator && /^https?:$/.test(demoRoot.protocol)) {
  navigator.serviceWorker.register(new URL("demo-worker.js", demoRoot)).catch(() => {
    // The browser's manual home screen option remains available without a worker.
  });
}

render();
