"use strict";

const demoVariant = "generic";
const demoScriptUrl = new URL(document.currentScript.src);
const demoRoot = new URL(".", demoScriptUrl);
const storageKey = `academy-iphone-demo-v1-${window.ACADEMY_APP_ROLE}`;
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
const assignment = { id: "linear-practice", title: "일차함수 실전 문제 8–12번", due: "오늘 오후 9:00", detail: "8–12번 풀이 사진을 첨부해 주세요. 답과 함께 식을 정리한 과정이 보이면 좋아요." };
const reviewAssignment = { id: "graph-review", title: "그래프 읽기 복습 1–3번", due: "수요일 오후 8:00", detail: "그래프에서 찾은 좌표 3개의 풀이를 찍어 주세요." };
const notice = { title: "다음 주 수업 시간 안내", detail: "다음 주 목요일 중2 심화반은 오후 4시에 시작합니다. 교재와 지난 숙제 풀이를 가져오세요." };
const initialDemoNotice = { ...notice, date: "11월 12일", id: "initial" };
const academyProfiles = {
  generic: {
    name: "온새미 수학학원",
    intro: "개념부터 문제 풀이와 오답 점검까지, 학생의 수준에 맞춰 지도합니다.",
  },

};
const teachers = [
  { name: "김서윤", role: "원장", subject: "고등 수학", detail: "내신 대비와 유형별 오답 지도" },
  { name: "이도현", role: "담당 교사", subject: "중등 수학", detail: "개념 설명과 서술형 풀이 지도" },
  { name: "김하람", role: "담당 교사", subject: "중등 수학", detail: "수준별 문제 풀이와 보충 수업" },
];
const demoContact = { hours: "평일 14:00–22:00 · 토요일 10:00–17:00", address: "온새미로 24, 2층", phone: "02-000-0000" };
const secondDemoNotice = { id: "second", title: "11월 자습실 운영 안내", detail: "토요일 오후 1시부터 자습실을 이용할 수 있어요.", date: "11월 9일" };
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

const symbols = { "academy-calendar": "▦", "home-overview": "◈", home: "◈", website: "⌂", schedule: "▦", attendance: "▤", learning: "◇", grades: "▥", video: "▷", notifications: "◌", roster: "▧", settings: "⚙", "school-schedule": "▣", students: "▧", news: "◌" };
const menus = {
  owner: [["home", "운영 현황"], ["website", "학원 홈페이지"], ["schedule", "일정·휴가"], ["attendance", "출결"], ["learning", "과제·공지"], ["grades", "성적 리포트"], ["notifications", "발송 기록"], ["roster", "학생·보호자"], ["settings", "학원 설정"]],
  teacher: [["home", "수업 현황"], ["website", "학원 홈페이지"], ["schedule", "일정·휴가"], ["attendance", "출결"], ["learning", "과제·공지"], ["grades", "성적 입력"], ["video", "영상 현황"], ["notifications", "발송 기록"]],
  student: [["home", "오늘 할 일"], ["website", "학원 홈페이지"], ["schedule", "일정"], ["learning", "과제·공지"], ["video", "학습 영상"], ["grades", "내 성적"]],
  parent: [["home", "자녀 현황"], ["website", "학원 홈페이지"], ["schedule", "일정"], ["attendance", "출결 기록"], ["learning", "과제·공지"], ["grades", "성적 추이"], ["notifications", "받은 알림"]],
};
for (const menu of Object.values(menus)) menu.splice(3, 0, ["school-schedule", "내신 일정"]);
menus.student.push(["attendance", "QR 출석"], ["notifications", "알림"]);
for (const staff of ["owner", "teacher"]) {
  if (window.AcademyRoleUi?.enabled(staff)) menus[staff].push(["students", "학생"]);
}
if (window.AcademyRoleUi?.enabled("parent")) menus.parent.push(["news", "소식"]);
const demoAppRole = window.ACADEMY_APP_ROLE;
if (window.AcademyRoleUi?.enabled(demoAppRole)) {
  teachers.push({ name:"박지민", role:"담당 교사", subject:"고등 수학", detail:"개념 정리와 내신 대비" });
  classes.push(
    { id:"middle-two-mon", day:"월", dayNumber:16, group:"중2 심화반", time:"16:00–17:30", teacher:"이도현", room:"강의실 A" },
    { id:"middle-one-mon", day:"월", dayNumber:16, group:"중1 개념반", time:"18:00–19:30", teacher:"김하람", room:"강의실 B" },
    { id:"high-two-fri", day:"금", dayNumber:13, group:"고2 개념반", time:"17:00–18:30", teacher:"박지민", room:"강의실 C" },
  );
}
if (window.AcademyRoleUi?.enabled(demoAppRole)) {
  menus[demoAppRole].push(["home-overview", "오늘 전체 보기"], ["academy-calendar", "캘린더"]);
  if (["owner", "teacher"].includes(demoAppRole)) menus[demoAppRole].push(["homepage-edit", "홈페이지 편집"]);
  if (demoAppRole === "owner") menus.owner.push(["operations", "운영"], ["staff-pay", "근무·급여"], ["staff-leave", "강사 휴가·대타"], ["timetable", "수업 시간표"]);
  if (demoAppRole === "teacher") menus.teacher.push(["my-work", "내 근무·휴가"]);
  if (["owner", "parent"].includes(demoAppRole)) {
    menus[demoAppRole].push(["video", "학습 영상"], ["tuition", demoAppRole === "owner" ? "수납 관리" : "학원비"]);
  }
}

const content = document.getElementById("content");
const navigation = document.getElementById("navigation");
const roleSelect = document.getElementById("role");
const dialog = document.getElementById("dialog");
const feedback = document.getElementById("feedback");
const installButton = document.getElementById("install-demo");
const nativeShell = window.AcademyDemo;
let role = window.ACADEMY_APP_ROLE;
roleSelect.value = role;
let activeScreen = "home";
let child = "jiwoo";
let toastTimer;
let cameraSession = null;
let photoPreviewUrl = null;
let selectedDay = "목";
let homepageDay;
let selectedExam = "linear-fourth";
let selectedLearner = null;
let consultationPeriod = "all";
let installPrompt = null;
let rosterPreview = null;
let rosterUploadId = 0;
let state = readState();
let blockDetails;
let activeNavigation;
let pendingTab;
const demoSite = window.AcademyRoleUi?.enabled(demoAppRole) ? window.AcademyDemoSite?.create({
  profile: { ...demoContact, ...academyProfiles[demoVariant] },
  staff: teachers,
  lessons: classes,
  notices: [initialDemoNotice, secondDemoNotice],
  legacy: localHomepageImport(),
  currentRole: () => role,
  openSheet: openDemoSheet,
  dialog,
  refresh: render,
  announce,
}) : null;

function localHomepageImport() {
  try {
    const ownerKey = storageKey.replace(/academy-iphone-demo-v1-(?:owner|teacher|student|parent)$/, "academy-iphone-demo-v1-owner");
    const stored = JSON.parse(localStorage.getItem(ownerKey));
    return stored ? { intro: stored.homepageIntro, notices: [stored.homeNotice, initialDemoNotice, secondDemoNotice].filter(Boolean), ...stored.siteSections } : {};
  } catch { return {}; }
}

function scheduledClasses() {
  return demoSite ? demoSite.calendar() : classes;
}

function teacherLesson(lesson) {
  return demoSite ? lesson.teacherId === "demo-teacher" : lesson.teacher === "이도현";
}

function freshState() {
  return {
    attendance: [
      { student: "jiwoo", kind: "in", time: "15:57", late: false },
      ...(nativeShell ? [{ student: "jiwoo", kind: "out", time: "16:41", late: false }] : []),
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
    parentNoticeReads: [],
    homeNotice: null,
    homepageIntro: null,
    siteSections: {},
    changeHistory: [],
    reviewSubmissions: {},
    consultationNotes: {},
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
    settings: { rank: false, lateMinutes: "0", channel: nativeShell ? "앱 안 알림" : "알림톡" },
    importedRosterRows: [],
    sentRosterInvites: [],
    clock: 17 * 60 + 10,
  };
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.attendance) && Array.isArray(saved.notices) && Array.isArray(saved.reminders) && Array.isArray(saved.scannedQr)
      && Array.isArray(saved.notifications) && saved.submissions && saved.progress && Number.isInteger(saved.clock)) {
      return {
        ...freshState(), ...saved,
        importedRosterRows: Array.isArray(saved.importedRosterRows) ? saved.importedRosterRows : [],
        sentRosterInvites: Array.isArray(saved.sentRosterInvites) ? saved.sentRosterInvites : [],
        parentNoticeReads: Array.isArray(saved.parentNoticeReads) ? saved.parentNoticeReads : [],
        reviewSubmissions: saved.reviewSubmissions ?? {},
        consultationNotes: saved.consultationNotes ?? {},
      };
    }
  } catch {
    return freshState();
  }
  return freshState();
}

function saveState(rerender = true) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The demo still works in memory when browser storage is disabled.
  }
  if (rerender) render();
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
  const lesson = scheduledClasses().find(({ day, group, groupKey }) => day === "목" && (groupKey ?? group) === student("jiwoo").group);
  if (!lesson) return false;
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
      <div>${panel("오늘 수업", list(scheduledClasses().filter((lesson) => teacherLesson(lesson) && lesson.day === "목").map(classRow)))}
        ${panel("과제 검토 대기", list(toReview.map(({ id, name }) => item(name, assignment.title, button("검토", "review", { id }))), "검토할 과제가 없습니다."),
          button("과제 보기", "navigate", { id: "learning", variant: "text-button" }), "stack")}</div>
    </div>`;
}

function attendanceHistory(id, kind) {
  const roster = roleStudents();
  const records = state.attendance.filter((event) => (!kind || event.kind === kind)
    && (id ? event.student === id : roster.some((learner) => learner.id === event.student))).toReversed();
  return list(records.map((event) => item(`${studentName(event.student)} 학생 · ${event.kind === "in" ? "등원" : "하원"}`, event.time, event.late ? badge("지각", "orange") : badge("기록 완료", "green"))));
}

function staffAttendanceActions() {
  return `<div class="actions">${button("출석 QR 띄우기", "teacher-qr")}${button("수동 출결 기록", "record-attendance", { variant: "primary" })}</div>`;
}

function staffAttendance() {
  const roster = roleStudents();
  const title = header("출결 관리", "등원·하원 기록과 지각을 확인합니다.", staffAttendanceActions());
  const rosterPanel = panel("학생별 출결", attendanceTable(roster));
  if (role === "owner" && window.AcademyRoleUi?.enabled(role)) {
    return title + `<div class="columns">${panel("오늘 등원", attendanceHistory(undefined, "in"))}${rosterPanel}</div>`;
  }
  return title + `${metrics(roster)}<div class="columns">${rosterPanel}${panel("출결 기록", attendanceHistory())}</div>`;
}

function submissionBadge(value) {
  if (value?.status === "submitted") return badge("제출 완료", "green");
  if (value?.status === "reviewed") return badge("검토 완료", "green");
  if (value?.status === "returned") return badge("재제출 요청", "orange");
  return badge("미제출", "orange");
}

function needsSampleReview(id) {
  return id === "seoha" && state.submissions[id]?.status === "submitted";
}

function staffLearning() {
  const roster = roleStudents();
  const unread = roster.filter(({ id }) => !state.notices.includes(id));
  const roleUi = window.AcademyRoleUi?.enabled(role);
  const reviewFirst = roleUi ? roster.filter(({ id }) => needsSampleReview(id)) : [];
  return `${header(roleUi ? "과제 검사" : "과제·공지 관리", "제출 기록과 공지를 확인하지 않은 학생을 확인하세요.")}
  ${reviewFirst.length ? panel("꼭 확인", list(reviewFirst.map(({ id, name }) => item(name, "가상 채점 · 흐린 풀이를 선생님이 확인", button("검토", "review", { id, variant: "text-button" }))))) : ""}
  <div class="columns">
    ${panel(assignment.title, list(roster.filter(({ id }) => !reviewFirst.some((learner) => learner.id === id)).map(({ id, name, group }) => {
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

function demoWebsiteProfile() {
  const profile = academyProfiles[demoVariant];
  if (!window.AcademyRoleUi?.enabled(role)) return profile;
  const homepage = demoSite?.homepage();
  const intro = homepage?.intro ?? state.siteSections?.intro ?? state.homepageIntro ?? profile.intro;
  return {
    ...demoContact, ...profile,
    ...state.siteSections?.contact, ...homepage,
    name: homepage?.academyName || state.settings.academyName || profile.name,
    hours: homepage?.hours ?? state.siteSections?.hours ?? profile.hours ?? demoContact.hours,
    intro: intro || "수업 시간표와 학원 소식을 한곳에서 확인하세요.",
    ready: Boolean(intro),
  };
}

function homeNotices() {
  return demoSite?.notices() ?? state.siteSections?.notices ?? [state.homeNotice, initialDemoNotice, secondDemoNotice].filter(Boolean);
}

function academyWebsite() {
  const roleUi = window.AcademyRoleUi?.enabled(role) ? window.AcademyRoleUi : null;
  if (roleUi && demoSite && ["owner", "teacher"].includes(role)) return demoSite.editor(roleUi, demoWebsiteProfile().name);
  if (roleUi && demoSite) return window.DemoHomeV3.academyIntro(roleHomeOptions());
  const profile = demoWebsiteProfile();
  const contact = profile.address ? `<dl class="school-contact">
      <div><dt>주소</dt><dd>${escapeHtml(profile.address)}</dd></div>
      <div><dt>운영시간</dt><dd>${escapeHtml(profile.hours)}</dd></div>
    </dl>${roleUi ? "" : '<p class="note">네이버 플레이스 공개 정보</p>'}` : "";
  const rows = classes.map(({ group, day, time, teacher }) =>
    `<tr><th scope="row">${group}</th><td>${day}요일</td><td>${time}</td><td>${teacher} 선생님</td></tr>`).join("");
  return `<section class="academy-hero"><div><p class="academy-eyebrow">초등 고학년 · 중등 · 고등 수학</p>
      <h1>${escapeHtml(profile.name)}</h1><p>${escapeHtml(profile.intro)}</p>
      <div class="actions">${button("운영 화면 보기", "navigate", { id: "home", variant: "primary" })}
        ${button("내신 일정 체험", "navigate", { id: "school-schedule" })}
        <button class="secondary" type="button" disabled>상담 신청 비활성화</button></div>
    </div><div class="academy-card"><h2>학원 안내</h2>${contact}</div></section>
    <div class="website-sections">
      ${panel("강사진", `<div class="teacher-cards">${teachers.map(({ name, role: job, subject, detail }) =>
        `<article><span class="teacher-initial" aria-hidden="true">${name[0]}</span><div><h3>${name} ${job === "원장" ? "원장" : "선생님"}</h3>
          <strong>${subject}</strong><p class="note">${detail}</p></div></article>`).join("")}</div>`, badge("예시", "purple"))}
      <div class="columns">
        ${panel("수업 시간표", `<div class="table-scroll"><table><thead><tr><th scope="col">반</th><th scope="col">요일</th>
          <th scope="col">시간</th><th scope="col">담당</th></tr></thead><tbody>${rows}</tbody></table></div>`, badge("예시", "purple"))}
        ${panel("공지", list(window.AcademyRoleUi?.enabled(role)
          ? homeNotices().map(({ title, date, id }) => item(title, date, button("공지 보기", "home-notice", { id, variant: "text-button" })))
          : [item(notice.title, "11월 12일", button("공지 보기", "website-notice", { variant: "text-button" }))]), badge("예시", "purple"))}
      </div>
    </div>`;
}

function classRow(lesson) {
  const replacement = !demoSite && state.leaves.find((entry) => entry.classId === lesson.id && entry.status === "approved");
  const teacher = replacement ? replacement.substitute : lesson.teacher;
  return item(lesson.group, `${lesson.time} · ${teacher} 선생님 · ${lesson.room}`, replacement ? badge("대체 수업", "purple") : "");
}

function leaveRow(entry) {
  const lesson = scheduledClasses().find(({ id }) => id === entry.classId);
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
  const visible = scheduledClasses().filter((lesson) => role === "owner" || (role === "teacher" ? teacherLesson(lesson) : (lesson.groupKey ?? lesson.group) === selectedStudent?.group));
  if (demoSite) {
    const days = [...scheduleDays, "일"].map(day => `<button class="day-button" type="button"
      data-action="schedule-day" data-id="${day}" aria-pressed="${day === selectedDay}"><span>${day}</span></button>`).join("");
    return header("수업 시간표", "요일별 수업과 담당 선생님을 확인하세요.") + (role === "parent" ? childPicker() : "")
      + panel("요일별 수업", `<div class="calendar-days" aria-label="요일 선택">${days}</div>
        <div class="calendar-agenda"><h3>${selectedDay}요일 수업</h3>${list(visible.filter(({ day }) => day === selectedDay).map(classRow), "예정된 수업이 없습니다.")}</div>`);
  }
  const days = scheduleDays.map((day, index) => `<button class="day-button" type="button" data-action="schedule-day" data-id="${day}" aria-pressed="${day === selectedDay}">
    <span>${day}</span><strong>${index + 9}</strong></button>`).join("");
  const heading = header(staff ? "일정·휴가" : "수업 일정", "11월 9일–14일 수업과 변경된 일정을 확인하세요.",
    role === "teacher" ? button("휴가 신청", "request-leave", { variant: "primary" }) : "");
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

function scorePeriod(id, period = "all") {
  return publishedScores(id).filter(({ exam }) => period !== "november" || exam.date.startsWith("11."));
}

function chartAverage({ exam, average }) {
  const count = Object.values(state.grades[exam.id].scores).filter(Number.isFinite).length;
  return Number.isFinite(average) && count >= 3 ? Math.round(average / exam.maximum * 1000) / 10 : null;
}

function scoreChart(id, period = "all", compare = false) {
  const points = scorePeriod(id, period).filter(({ percent }) => percent !== null);
  if (!points.length) return '<p class="empty">공개된 성적이 없습니다.</p>';
  const description = points.map((point) => {
    const { exam, percent } = point;
    const average = compare ? chartAverage(point) : null;
    const mean = average === null ? "" : ` · 반 평균 ${average}점`;
    return `${exam.date} ${percent}점${mean}`;
  }).join(", ");
  const legend = compare ? '<div class="demo-score-legend"><span>학생 점수</span><span>반 평균</span></div>' : "";
  return `${legend}<div class="score-chart"><canvas data-score-chart="${id}" data-period="${period}" data-compare="${compare}" role="img" aria-label="100점 환산 성적 추이 · ${escapeHtml(description)}">${escapeHtml(description)}</canvas></div>`;
}

function paintScoreCharts() {
  const colors = getComputedStyle(document.body);
  const themeColor = (token, fallback) => colors.getPropertyValue(token).trim() || fallback;
  const gridColor = themeColor("--line", "#e6e7f0");
  const labelColor = themeColor("--muted", "#62687c");
  const scoreColor = document.body.hasAttribute("data-c-block-scope") ? themeColor("--ink", "#111113") : themeColor("--purple", "#583ad0");
  const averageColor = themeColor("--chart-average", "#0f625a");
  for (const canvas of content.querySelectorAll("[data-score-chart]")) {
    const points = scorePeriod(canvas.dataset.scoreChart, canvas.dataset.period).filter(({ percent }) => percent !== null);
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
      context.strokeStyle = gridColor;
      context.moveTo(left, y(mark));
      context.lineTo(right, y(mark));
      context.stroke();
      context.fillStyle = labelColor;
      context.fillText(String(mark), left - 7, y(mark));
    }
    // Keep the endpoint labels inside the grid and clear of the vertical axis labels.
    const pointInset = 18;
    const coordinates = points.map(({ percent }, index) => ({
      x: points.length === 1 ? (left + right) / 2 : left + pointInset + (right - left - 2 * pointInset) * index / (points.length - 1),
      y: y(percent),
    }));
    if (canvas.dataset.compare === "true") {
      context.beginPath();
      context.setLineDash([5, 4]);
      context.lineWidth = 2;
      context.strokeStyle = averageColor;
      let previous = false;
      points.forEach((point, index) => {
        const average = chartAverage(point);
        if (average === null) {
          previous = false;
          return;
        }
        const x = coordinates[index].x;
        const meanY = y(average);
        if (previous) context.lineTo(x, meanY); else context.moveTo(x - 5, meanY);
        context.lineTo(x + 5, meanY);
        previous = true;
      });
      context.stroke();
      context.setLineDash([]);
    }
    context.beginPath();
    coordinates.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.lineWidth = 2.5;
    context.strokeStyle = scoreColor;
    context.stroke();
    context.textAlign = "center";
    coordinates.forEach((point, index) => {
      context.beginPath();
      context.fillStyle = scoreColor;
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = scoreColor;
      context.fillText(String(points[index].percent), point.x, Math.max(10, point.y - 12));
      context.fillStyle = labelColor;
      context.fillText(points[index].exam.date, point.x, bottom + 18);
    });
  }
}

function staffStudents() {
  const roster = roleStudents();
  const learner = roster.find(({ id }) => id === selectedLearner);
  const actions = `<div class="demo-subnav">${role === "owner" ? button("명부 등록", "navigate", { id: "roster" }) : ""}${button(role === "owner" ? "반별 성적" : "성적 입력", "navigate", { id: "grades" })}</div>`;
  if (!learner) {
    return header(role === "owner" ? "학생·반" : "담당 학생", "학생을 선택하면 성적 추이와 상담 메모가 열립니다.") + actions
      + panel("학생 명단", list(roster.map(({ id, name, group }) => item(name, group, button("학생 상세", "student-detail", { id })))));
  }
  const period = `<label class="field-inline">조회 기간<select id="consultation-period">
    <option value="all"${consultationPeriod === "all" ? " selected" : ""}>전체</option>
    <option value="november"${consultationPeriod === "november" ? " selected" : ""}>11월</option>
    </select></label>`;
  const memo = state.consultationNotes[learner.id];
  return header(`${learner.name} 학생`, `${learner.group} · 상담용 성적 추이`, button("학생 목록", "student-list"))
    + panel("공개 성적 추이", period + scoreChart(learner.id, consultationPeriod, true) + '<p class="note">100점 환산 · 점수를 등록한 학생이 3명 이상인 평가에서 반 평균을 표시합니다.</p>')
    + panel("상담 메모", memo ? `<p class="note">${escapeHtml(memo)}</p>` : '<p class="empty">저장된 가상 상담 메모가 없습니다.</p>',
      button(memo ? "상담 메모 편집" : "상담 메모 작성", "consultation-note", { id: learner.id }), "stack");
}

function editConsultationNote(id) {
  if (selectedLearner !== id || !roleStudents().some((learner) => learner.id === id)) return;
  openDialog("상담 메모", `<label class="demo-memo">가상 상담 메모<textarea id="demo-consultation-note" maxlength="600">${escapeHtml(state.consultationNotes[id] ?? "")}</textarea></label>
    <p class="note">가상 메모는 이 기기에 저장됩니다.</p>`, "메모 저장", () => {
    state.consultationNotes[id] = dialog.querySelector("#demo-consultation-note").value.trim().slice(0, 600);
    saveState();
    announce("상담 메모를 저장했습니다.");
  });
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
  if (window.AcademyRoleUi?.enabled(role)) {
    const settingRow = (id, label, value) => `<button class="demo-setting-row" type="button" data-action="setting-field" data-id="${id}">
      <span>${label}</span><span data-setting-value>${escapeHtml(value)}</span><span aria-hidden="true">›</span></button>`;
    const group = (title, rows) => `<section class="demo-setting-group"><h2>${title}</h2>${rows}</section>`;
    return header("학원 설정", "변경할 항목을 선택하세요.")
      + window.DemoStaffOperations.settings()
      + group("학원 정보", settingRow("academyName", "학원 이름", demoWebsiteProfile().name)
        + button("나이스에서 학원 찾기", "neis-academy"))
      + group("출결", settingRow("lateMinutes", "지각 기준", lateSettingLabel(state.settings.lateMinutes)))
      + group("알림", settingRow("channel", "출결 알림 채널", channelSettingLabel(state.settings.channel)))
      + group("성적", `<button class="demo-setting-row" type="button" role="switch" aria-label="등수 공개" aria-checked="${state.settings.rank}" data-action="setting-switch" data-id="rank">
        <span>등수 공개</span><span data-setting-value>${state.settings.rank ? "켜짐" : "꺼짐"}</span><span class="demo-switch" aria-hidden="true"></span></button>`);
  }
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
  return `<li class="roster-row"><div class="roster-row-heading"><div><strong>${escapeHtml(row.name)}</strong>
    <p class="roster-class">${escapeHtml([row.grade, ...row.classes].join(" · "))}</p>
    ${mode === "preview" ? `<p class="note">${escapeHtml(source)}</p>` : ""}</div>${status}</div>
    <dl><div><dt>보호자 휴대폰 번호</dt><dd>${escapeHtml(row.phone || "—")}${mode === "saved" && row.phone && state.sentRosterInvites.includes(row.key) ? ` ${badge("모의 발송 완료", "green")}` : ""}</dd></div>
    ${row.email ? `<div><dt>초대용 보호자 이메일</dt><dd>${escapeHtml(row.email)}</dd></div>` : ""}
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
    : ready ? "학생 이름, 학년, 반과 보호자 연락처를 확인한 뒤 등록하세요." : "모든 행이 이미 등록되어 있습니다.");
  return `<section class="roster-preview" aria-labelledby="roster-preview-title"><div class="roster-row-heading">
    <h3 id="roster-preview-title" tabindex="-1">업로드 미리보기</h3><p class="note">${escapeHtml(rosterPreview.sample.name)}</p></div>
    <div class="actions">${badge(`등록 가능 ${ready}명`, "green")}${badge(`오류 ${invalid}명`, invalid ? "red" : "neutral")}${badge(`이미 등록 ${existing}명`)}</div>
    <p class="note" role="status">${escapeHtml(message)}</p>${rosterRows(rows, "preview")}
    ${button("확인 후 등록", "apply-roster", { variant: "primary", disabled: !ready || Boolean(invalid) })}</section>`;
}

function registeredRoster() {
  return DemoRoster.samples[0].rows.filter((row) => state.importedRosterRows.includes(row.key));
}

function ownerRoster() {
  const { samples } = DemoRoster;
  const registered = registeredRoster();
  const pending = registered.some((row) => row.phone && !state.sentRosterInvites.includes(row.key));
  return header("학생·보호자 명부", "엑셀로 학생을 반에 배정하고 보호자 연락처와 동의 상태를 함께 등록하세요.")
    + panel("엑셀로 한 번에 등록", `<p class="note">아래 두 가상 명부 원본으로 체험할 수 있습니다. 보호자는 초대를 수락한 뒤 자녀 포털에 접근합니다.</p>
      <div class="actions roster-files"><label class="primary file-choice" for="roster-file">엑셀 파일 선택
        <input class="sr-only" id="roster-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label>
        ${samples.map((sample) => `<a class="secondary roster-download" href="${escapeHtml(new URL(`${sample.path}${demoScriptUrl.search}`, demoRoot).href)}" download="${escapeHtml(sample.name)}">${escapeHtml(sample.downloadLabel)}</a>`).join("")}
      </div><div class="actions roster-examples">${samples.map((sample) => button(sample.previewLabel, "preview-roster", { id: sample.id, variant: "text-button" })).join("")}</div>
      ${rosterPreviewBody()}`)
    + panel("이번 체험에서 등록한 명부", registered.length ? rosterRows(registered, "saved")
      + `<div class="actions roster-invite-actions">${button("보호자 초대 모의 발송", "send-roster-invites", { variant: "primary", disabled: !pending })}
        ${button("초대 안내문 일괄 출력", "print-roster-invites")}</div>`
      : '<p class="note">등록하면 학생과 보호자 초대 대기 항목이 여기에 표시됩니다.</p>', badge(`${registered.length}명`), "stack");
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

function sendRosterInvites() {
  const pending = registeredRoster().filter((row) => row.phone && !state.sentRosterInvites.includes(row.key));
  if (!pending.length) return;
  openDialog("보호자 초대 모의 발송", `<p>등록된 보호자 휴대폰 번호로 초대 ${pending.length}건을 발송하는 흐름입니다.</p>
    <p class="note">가상 번호만 사용하며 발송 결과를 이 브라우저에 기록합니다.</p>`, "모의 발송", () => {
    state.sentRosterInvites.push(...pending.map((row) => row.key));
    saveState();
    announce(`보호자 초대 ${pending.length}건의 모의 발송을 완료했습니다.`);
  });
}

function demoInviteCode(row, kind) {
  return `DEMO-${kind === "student" ? "S" : "G"}-${row.key.slice(-2)}`;
}

function printRosterInvites() {
  const rows = registeredRoster();
  if (!rows.length) return;
  const slips = rows.flatMap((row) => row.phone ? [{ row, kind: "student" }, { row, kind: "guardian" }] : [{ row, kind: "student" }]);
  openDialog("초대 안내문 일괄 출력", `<p class="note">가상 학생·보호자에게 개별 전달할 양식입니다. 초대 기본 유효기간은 발급일부터 7일입니다.</p>
    <div class="roster-slips">${slips.map(({ row, kind }) => {
      const label = kind === "student" ? "학생" : "보호자";
      return `<article class="roster-slip"><div><h3>${escapeHtml(row.name)} · ${label}용</h3>
        <p>${escapeHtml([row.grade, ...row.classes].join(" · "))}</p><p>초대 코드 <strong>${demoInviteCode(row, kind)}</strong></p>
        <p class="note">시연용 · 가상 계정</p></div><canvas role="img" aria-label="${label}용 초대 QR"></canvas></article>`;
    }).join("")}</div>`, "인쇄", () => { if (nativeShell) nativeShell.printSlips(); else window.print(); return false; });
  dialog.dataset.rosterPrint = "true";
  dialog.addEventListener("close", () => { delete dialog.dataset.rosterPrint; }, { once: true });
  for (const [index, canvas] of Array.from(dialog.querySelectorAll("canvas")).entries()) {
    const { row, kind } = slips[index];
    const url = new URL(kind === "student" ? "../student/" : "../parent/", demoRoot);
    url.hash = new URLSearchParams({ invite: demoInviteCode(row, kind) });
    renderQr(canvas, url.href);
  }
}

function showDemoInvite() {
  const code = new URLSearchParams(window.location.hash.slice(1)).get("invite");
  if (!code || !/^DEMO-[SG]-0[1-3]$/.test(code) || dialog.open) return;
  openDialog("초대 QR 체험", `<p>가상 안내문의 초대 코드 <strong>${escapeHtml(code)}</strong>를 확인했습니다.</p>
    <p class="note">시연에서는 초대 QR로 안내 화면이 열리는 흐름을 보여드립니다.</p>`);
}

function studentHome() {
  const reminders = state.reminders.filter((entry) => entry.student === "jiwoo");
  const alerts = reminders.length ? panel("학습 알림", list(reminders.map((entry) => item(entry.topic, `선생님 · ${entry.time}`))), "", "stack") : "";
  return `<section class="hero"><div><h1>지우 학생의 오늘 할 일</h1><p>중2 심화반 · 마감과 시청 진도를 한눈에 확인하세요.</p></div>
    <div class="actions">${button("카메라로 QR 찍기", "camera-qr", { variant: "primary" })}${button("출결 체험하기", "mock-qr")}${button("내 학교 일정", "navigate", { id: "school-schedule" })}</div></section>
    <div class="columns"><div>${panel("오늘 할 일", list(taskRows("jiwoo", true)))}${alerts}</div>${videoCard("jiwoo", true)}</div>`;
}

function dueSchoolRow(label) {
  const event = DemoSchoolAssessments.upcoming();
  return { label, value: event ? `${event.title} · ${event.countdown}` : "예정된 시험 없음",
    detail: event?.detail ?? "확정된 내신 일정을 확인하세요.", screen: "school-schedule", symbol: "calendar", attention: Boolean(event && event.days <= 3) };
}

function lastScoreChange(id) {
  const scores = publishedScores(id).filter(({ percent }) => Number.isFinite(percent));
  const last = scores.at(-1);
  const previous = scores.at(-2);
  const difference = previous && last ? Math.round((last.percent - previous.percent) * 10) / 10 : 0;
  return { last, difference };
}

function changeLabel(difference) {
  return difference === 0 ? "직전과 같음" : `직전보다 ${Math.abs(difference)}점 ${difference > 0 ? "상승" : "하락"}`;
}

function attentionReasons(id) {
  return [
    !latestEvent(id) && "미등원",
    !["submitted", "reviewed"].includes(state.submissions[id]?.status) && "과제 미제출",
    lastScoreChange(id).difference < 0 && "최근 성적 하락",
  ].filter(Boolean);
}

function roleHomeRows() {
  if (role === "student") {
    const record = state.submissions.jiwoo;
    const progress = Number(state.progress.jiwoo) || 0;
    return [
      { label: "오늘 마감 과제", value: assignment.title, detail: record?.status === "submitted" ? "사진 제출 완료" : record?.status === "reviewed" ? "검사 및 피드백 완료" : `마감 ${assignment.due}`,
        assignment: assignment.id, symbol: "book", attention: !record || record.status === "returned" },
      dueSchoolRow("시험 D-day"),
      { label: "남은 보강 영상", value: progress >= 90 ? "모두 시청 완료" : "1개 남음", detail: `${video.title} · ${progress}%`, screen: "video", watchVideo: "linear-video", symbol: "book" },
      { label: "최근 확인된 피드백", value: record?.status === "reviewed" && record.note ? record.note : "그래프 축과 교점을 정리했어요.",
        detail: record?.status === "reviewed" ? assignment.title : "지난 과제 · 일차함수 기초 평가", screen: "learning", symbol: "chart" },
    ];
  }
  if (role === "parent") {
    const today = state.attendance.filter(({ student }) => student === child);
    const entered = today.findLast(({ kind }) => kind === "in");
    const exited = today.at(-1)?.kind === "out" ? today.at(-1) : null;
    const work = [state.submissions[child], state.reviewSubmissions[child]];
    const complete = work.filter((record) => ["submitted", "reviewed"].includes(record?.status)).length;
    const score = lastScoreChange(child);
    const unread = !state.parentNoticeReads.includes(child);
    return [
      { label: "오늘 등·하원 상태", value: exited ? "하원 완료" : entered ? "등원 중" : "등원 기록 없음",
        detail: `등원 ${entered?.time ?? "—"} · 하원 ${exited?.time ?? "—"}`, screen: "attendance", symbol: "qr" },
      { label: "이번 주 과제 완료율", value: `${Math.round(complete / work.length * 100)}%`, detail: `전체 ${work.length}개 중 ${complete}개 제출`, screen: "learning", symbol: "book" },
      { label: "최근 성적 변화", value: score.last ? `${score.last.percent}점` : "공개 성적 없음",
        detail: score.last ? `${score.last.exam.title} · ${changeLabel(score.difference)}` : "공개된 평가만 표시합니다.", screen: "grades", symbol: "chart", attention: score.difference < 0 },
      dueSchoolRow("다가오는 시험"),
      { label: "안 읽은 공지", value: unread ? "1건" : "모두 확인", detail: notice.title, screen: "news", symbol: "bell", attention: unread },
    ];
  }
  const roster = roleStudents();
  const present = roster.filter(({ id }) => latestEvent(id)).length;
  const pending = roster.filter(({ id }) => state.submissions[id]?.status === "submitted");
  const needsAttention = roster.filter(({ id }) => attentionReasons(id).length);
  const riskDetails = needsAttention.slice(0, 2).map(({ id, name }) => `${name} · ${attentionReasons(id).join(", ")}`).join(" / ");
  if (role === "teacher") {
    const mustReview = pending.filter(({ id }) => needsSampleReview(id)).length;
    return [
      { label: "오늘 수업 출석 현황", value: `${present} / ${roster.length}명 출석`, detail: "16:00 · 중2 심화반", screen: "attendance", symbol: "qr" },
      { label: "검사 대기", value: `${pending.length}건`, detail: `AI 1차 완료 ${pending.length}건 · 꼭 확인 ${mustReview}건 (가상)`, screen: "learning", reviewStudent: pending[0]?.id, symbol: "book", attention: mustReview > 0 },
      { label: "주의 학생", value: `${needsAttention.length}명`, detail: riskDetails || "오늘 확인할 학생 없음", screen: "students", symbol: "people", attention: needsAttention.length > 0 },
      dueSchoolRow("다가오는 내신"),
    ];
  }
  const pendingByGroup = teachers.flatMap(({ name }) => {
    const groups = new Set(scheduledClasses().filter(({ teacher }) => teacher === name).map(({ group, groupKey }) => groupKey ?? group));
    const count = pending.filter(({ group }) => groups.has(group)).length;
    return groups.size ? [`${name} ${count}건`] : [];
  });
  const risk = needsAttention.filter(({ id }) => attentionReasons(id).length >= 2);
  return [
    { label: "오늘 출석률", value: `${Math.round(present / roster.length * 100)}%`, detail: `${present}명 출석 · 등록 ${roster.length}명`, screen: "attendance", symbol: "qr" },
    { label: "선생님별 검사 대기", value: `전체 ${pending.length}건`, detail: pendingByGroup.filter((entry) => !entry.endsWith(" 0건")).join(" · ") || "검사 대기 없음", screen: "learning", symbol: "book", attention: pending.length > 0 },
    { label: "이탈 위험 학생", value: `${risk.length}명 확인 필요`, detail: risk.map(({ name }) => name).join(" · ") || "출결·과제·성적에 겹치는 주의 신호가 없어요.", screen: "students", symbol: "people", attention: risk.length > 0 },
    { label: "상담 일정", value: "오늘 오후 6:30 · 김지우", detail: "가상 상담 1건 · 성적 추이와 이전 메모", screen: "students", symbol: "calendar" },
    { label: "요금제·AI 사용량", value: "스탠다드 · 가상 사용량 1건", detail: "운영 설정에서 확인할 항목의 예시", screen: "settings", symbol: "settings" },
  ];
}

function roleHomeOptions() {
  const allRows = roleHomeRows();
  const learner = student(role === "student" ? "jiwoo" : child);
  const profile = demoWebsiteProfile();
  const lessons = scheduledClasses().filter((lesson) => role === "teacher" ? teacherLesson(lesson) : (lesson.groupKey ?? lesson.group) === learner?.group).slice(0, 2);
  const upload = { label: "과제 제출", action: "submit-homework", id: assignment.id, symbol: "book" };
  const attendance = { label: "출석 체크", id: "attendance", symbol: "qr" };
  const review = { label: "과제 검사", id: "learning", symbol: "book" };
  const context = {
    owner: { context: "원장", name: "김서윤 원장님", summary: `오늘 수업 ${new Set(scheduledClasses().map(({ group }) => group)).size}개 반 · 학생 ${students.length}명`,
      actions: [{ label: profile.ready ? "홈페이지 편집" : "홈페이지 만들기", action: "homepage-edit", symbol: "edit" },
        { label: "공지 쓰기", action: "home-notice-write", symbol: "notice" }], rows: allRows.slice(0, 4).map((row, index) => {
          if (index === 1) return { ...row, label: "검사 대기", value: row.value.replace("전체 ", ""), attention: false };
          if (index === 2) return { ...row, value: row.value.replace(" 확인 필요", "") };
          if (index === 3) return { ...row, label: "상담", value: "18:30", detail: "김지우 보호자" };
          return row;
        }) },
    teacher: { context: "중2 심화반 · 선생님", name: "이도현 선생님", summary: `${allRows[0]?.value ?? ""} · 검사 대기 ${allRows[1]?.value ?? ""}`,
      actions: [attendance, review], rows: allRows.slice(0, 3) },
    student: { context: learner?.group ?? "학생", name: "지우님",
      summary: `${state.submissions.jiwoo ? "과제 제출 확인" : "오늘 마감 과제 1개"} · ${allRows[1]?.value ?? ""}`,
      actions: [upload], rows: allRows.slice(0, 3) },
    parent: { context: learner ? `${learner.name} 보호자` : "학부모", name: `${learner?.name ?? "학생"} 보호자님`,
      summary: `${allRows[0]?.value ?? ""} · 이번 주 과제 완료율 ${allRows[1]?.value ?? ""}`,
      actions: [{ label: "출결 보기", id: "attendance", symbol: "qr" }, { label: "상담 신청", action: "demo-consultation", symbol: "calendar" }],
      rows: allRows.slice(0, 3) },
  };
  const roster = roleStudents();
  const ownCalendarLessons = scheduledClasses();
  const teacherGroups = [...new Set(ownCalendarLessons.filter(teacherLesson).map(lesson => lesson.groupKey ?? lesson.group))];
  const calendar = {
    studentId: learner?.id,
    selectedGroup: learner?.group,
    students,
    teacherGroups,
    lessons: ownCalendarLessons,
    assignments: [
      { id:assignment.id, title:assignment.title, date:"2026-11-16", time:"21:00", groups:["중2 심화반"] },
      { id:reviewAssignment.id, title:reviewAssignment.title, date:"2026-11-18", time:"20:00", groups:["중2 심화반"] },
    ],
    schoolEvents: DemoSchoolAssessments.calendarItems?.() ?? [],
    consultations: [{ id:"fixture-counsel", title:"학습 상담", date:"2026-11-16", time:"18:30", group:"중2 심화반", studentId:"jiwoo", room:"상담실", teacher:"김서윤" }],
  };
  const missingAssignments = [state.submissions.jiwoo, state.reviewSubmissions.jiwoo]
    .filter(record => !["submitted","reviewed"].includes(record?.status)).length;
  const staffProfiles = demoSite?.visibleStaff() ?? state.siteSections?.staff ?? teachers;
  const rows = context[role].rows.map((row) => {
    const countdown = row.screen === "school-schedule" ? row.value.match(/ · (D[+-](?:\d+|day))$/i)?.[1] : "";
    return countdown ? { ...row, value: row.value.slice(0, -(countdown.length + 3)), countdown } : row;
  });
  const teachingToday = role === "teacher" ? window.DemoStaffOperations.teachingToday(ownCalendarLessons).map((lesson) => ({
    ...lesson, studentCount: students.filter((entry) => entry.group === (lesson.groupKey ?? lesson.group)).length,
  })) : [];
  const latestSiteChange = demoSite?.lastChange();
  const notifiedThisWeek = state.notifications.length + homeNotices().filter(({ date }) => parseInt(date?.split("월 ")[1]) >= 16).length;
  return { ...context[role], rows, lessons, profile, teachingToday, currentChild:child,
    homepageEditLabel:latestSiteChange ? `${new Date(latestSiteChange).toLocaleDateString("ko-KR", { month:"numeric", day:"numeric", timeZone:"Asia/Seoul" })} 수정` : "11월 13일 수정",
    bannerCount:window.DemoHomeBanners.activeCount(),
    weeklyNotices:notifiedThisWeek,
    scoreLabel:state.grades["linear-fourth"]?.published ? "11월 발행 완료" : "11월 발행 전", brandName: document.title.split(" ")[0], notices: homeNotices(), staff: staffProfiles.map(({ name }) => name).join(" · "),
    staffProfiles, ownStaff: demoSite?.ownStaff(), timetable: demoSite?.calendar(true) ?? state.siteSections?.timetable ?? classes, selectedGroup: learner?.group, homepageDay,
    controls: role === "parent" ? childPicker() : "", calendar,
    pendingCount: missingAssignments, attendance: learner ? latestEvent(learner.id) : null,
    arrival:learner ? state.attendance.findLast((event) => event.student === learner.id && event.kind === "in")?.time : null,
    todayLessonCount: teachingToday.length,
    reviewCount: roster.filter(({ id }) => state.submissions[id]?.status === "submitted").length,
    presentCount: roster.filter(({ id }) => latestEvent(id)).length, rosterCount: roster.length, appointmentCount: calendar.consultations.length };
}

function editDemoHomepage(section) {
  navigateRole("homepage-edit");
  if (section === "contact") demoSite?.startSection(section);
  else {
    content.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function openDemoSheet(title, fields, save, opener, options = {}) {
  if (dialog.open) return;
  const action = opener?.dataset.action;
  const id = opener?.dataset.id;
  let saving = false;
  dialog.classList.add("demo-sheet");
  dialog.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2><form class="dialog-body" novalidate>
    <div class="demo-sheet-fields">${fields}</div><p role="alert" hidden></p>
    <div class="dialog-actions"><button type="button" class="secondary" data-action="close-dialog">${options.closeOnly ? "닫기" : "취소"}</button>
      ${options.closeOnly ? "" : `<button type="submit" class="primary" data-confirm>${options.confirmLabel || "저장"}</button>`}</div></form>`;
  const form = dialog.querySelector("form");
  const cancelWhileSaving = (event) => { if (saving) event.preventDefault(); };
  dialog.addEventListener("cancel", cancelWhileSaving);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (options.closeOnly || saving) return;
    const payload = new FormData(form);
    const controls = [...form.elements].filter((element) => !element.disabled);
    const confirm = form.querySelector("[data-confirm]");
    saving = true;
    for (const control of controls) control.disabled = true;
    confirm.textContent = "저장 중…";
    const alert = form.querySelector("[role=alert]");
    alert.hidden = true;
    let error;
    try { error = await save(payload); }
    catch { error = "저장하지 못했어요. 기존 값을 유지했습니다. 다시 시도해 주세요."; }
    saving = false;
    for (const control of controls) control.disabled = false;
    confirm.textContent = options.confirmLabel || "저장";
    if (error) {
      alert.textContent = error;
      alert.hidden = false;
      return;
    }
    dialog.close();
    if (options.successMessage !== false) announce(options.successMessage ?? "저장했어요");
  });
  dialog.addEventListener("close", () => {
    dialog.removeEventListener("cancel", cancelWhileSaving);
    dialog.classList.remove("demo-sheet");
    if (action) content.querySelector(`[data-action="${CSS.escape(action)}"][data-id="${CSS.escape(id || "")}"]`)?.focus();
  }, { once: true });
  dialog.showModal();
}

// A fixed-role demo uses local data only. Write the targeted entry to the latest saved
// object, and refresh the display only after the write has succeeded.
function patchDemoField(section, key, value) {
  try {
    const latest = localStorage.getItem(storageKey) ? readState() : state;
    const previous = latest[section]?.[key] ?? null;
    const next = {
      ...latest,
      [section]: { ...latest[section], [key]: value },
      changeHistory: [...(latest.changeHistory ?? []), {
        actor: "demo-owner", at: new Date().toISOString(), section, key, previous, value,
      }].slice(-100),
    };
    localStorage.setItem(storageKey, JSON.stringify(next));
    state = next;
  } catch {
    return "저장하지 못했어요. 기존 값을 유지했습니다. 다시 시도해 주세요.";
  }
  render();
  return "";
}

const lateSettingLabel = (minutes) => Number(minutes) ? `수업 시작 ${Number(minutes)}분 후` : "수업 시작 시각";
const channelSettingLabel = (channel) => channel?.startsWith("앱") ? "앱 알림 · 무료" : `${channel} · 선불 충전`;
const demoField = (label, name, value, maximum) =>
  `<label>${label}<input name="${name}" value="${escapeHtml(value || "")}" maxlength="${maximum}"></label>`;
const demoOption = (value, label, selected) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
const formText = (form, key) => String(form.get(key) ?? "").trim();

function editDemoSetting(key, opener) {
  if (key === "academyName") {
    openDemoSheet("학원 이름", demoField("학원 이름", key, demoWebsiteProfile().name, 50), (form) => {
      const name = formText(form, key);
      if (!name || [...name].length > 50) return "학원 이름을 1자에서 50자까지 입력해 주세요.";
      if (demoSite?.homepage().academyName) return demoSite.saveRegistration({ academyName: name });
      return patchDemoField("settings", key, name);
    }, opener);
  } else if (key === "lateMinutes") {
    const values = ["0", "5", "10", "15"];
    openDemoSheet("지각 기준", `<label>지각 기준<select name="${key}">
      ${values.map((minutes) => demoOption(minutes, lateSettingLabel(minutes), state.settings.lateMinutes)).join("")}</select></label>`, (form) => {
      const minutes = formText(form, key);
      return values.includes(minutes) ? patchDemoField("settings", key, minutes) : "지각 기준을 선택해 주세요.";
    }, opener);
  } else if (key === "channel") {
    const values = ["앱 안 알림", "문자", "알림톡"];
    openDemoSheet("출결 알림 채널", `<label>출결 알림 채널<select name="${key}">
      ${values.map((channel) => demoOption(channel, channelSettingLabel(channel), state.settings.channel)).join("")}</select></label>
      <p class="note" data-channel-hint hidden>문자와 알림톡은 선불 잔액이 필요합니다. 체험에서는 앱 알림을 사용할 수 있어요.</p>`, (form) => {
      const channel = formText(form, key);
      return channel === values[0] ? patchDemoField("settings", key, channel) : "충전 잔액이 없어 선택한 채널을 사용할 수 없어요.";
    }, opener);
    const select = dialog.querySelector("select");
    const refreshHint = () => {
      const prepaid = select.value !== values[0];
      dialog.querySelector("[data-channel-hint]").hidden = !prepaid;
      dialog.querySelector("[data-confirm]").disabled = prepaid;
    };
    select.addEventListener("change", refreshHint);
    refreshHint();
  }
}

function lookupDemoAcademy(opener) {
  const academy = demoWebsiteProfile();
  const fields = [["학원 이름", "academyName", academy.name, 50], ["주소", "address", academy.address, 150],
    ["우편번호", "postalCode", academy.postalCode, 5], ["전화", "phone", academy.phone, 25],
    ["교습과정", "course", academy.course, 80], ["분야", "field", academy.field, 100]];
  openDemoSheet("학원 정보 입력", DemoNeis.searchFields("academy")
    + '<section class="neis-details" aria-labelledby="neis-details-title"><h3 id="neis-details-title">저장할 학원 정보</h3>'
    + fields.map((params) => demoField(...params)).join("") + "</section>", (form) => {
    const registration = Object.fromEntries(fields.map(([, key]) => [key, formText(form, key)]));
    if (!registration.academyName || fields.some(([, key, , limit]) => registration[key].length > limit)) return "학원 이름과 입력 길이를 확인해 주세요.";
    if (registration.postalCode && !/^\d{5}$/.test(registration.postalCode)) return "우편번호를 숫자 다섯 자리로 입력해 주세요.";
    if (registration.phone && !/^[0-9() +\-]{6,25}$/.test(registration.phone)) return "전화번호를 확인해 주세요.";
    return demoSite.saveRegistration(registration);
  }, opener);
  DemoNeis.bindLookup(dialog, "academy", ({ name, ...details }) => {
    const selected = { academyName: name, ...details };
    fields.forEach(([, key]) => { dialog.querySelector(`[name="${key}"]`).value = selected[key]; });
  });
}

function writeDemoNotice() {
  if (demoSite) {
    openDemoSheet("공지 쓰기", `<p>가상 공지를 이 기기에만 저장합니다.</p>
      ${demoField("제목", "title", "", 50)}${demoField("공지 내용", "detail", "", 160)}`, (form) => {
      const title = formText(form, "title"), detail = formText(form, "detail");
      if (!title || !detail || title.length > 50 || detail.length > 160) return "제목과 공지 내용을 확인해 주세요.";
      return demoSite.prependNotice({ title, detail, date: "11월 16일", id: `local-${Date.now()}` });
    });
    return;
  }
  openDialog("공지 쓰기", `<p>가상 공지를 이 기기에만 저장합니다.</p>
    <label>제목<input name="title" maxlength="50"></label><label>공지 내용<input name="detail" maxlength="160"></label>`, "공지 저장", (form) => {
    const title = form.get("title").trim();
    const detail = form.get("detail").trim();
    if (!title || !detail) {
      dialog.querySelector(title ? '[name="detail"]' : '[name="title"]').focus();
      return false;
    }
    const published = { title, detail, date: "11월 16일", id: `local-${Date.now()}` };
    const error = patchDemoField("siteSections", "notices", [published, ...homeNotices()].slice(0, 12));
    announce(error || "저장했어요");
    return !error;
  });
}

function requestDemoConsultation() {
  openDialog("상담 신청", `<p>가상 상담 시간을 선택합니다. 실제 학원에 전송되지 않습니다.</p>
    <label>희망 시간<select name="time"><option>평일 오후 6:00</option><option>평일 오후 7:00</option></select></label>`, "신청 체험", (form) => {
    announce(`${form.get("time")} 상담 신청을 체험했습니다.`);
  });
}

function assignmentRows(id, interactive) {
  return [assignment, reviewAssignment].map((task) => {
    const record = task.id === assignment.id ? state.submissions[id] : state.reviewSubmissions[id];
    const status = record ? submissionBadge(record) : badge(task.id === assignment.id ? "오늘 마감" : "미제출", "orange");
    if (!interactive) return item(task.title, task.due, status);
    return `<li><button type="button" class="demo-assignment-row" data-action="submit-homework" data-id="${task.id}" data-action-level="secondary"><span><strong>${task.title}</strong><small>마감 ${task.due}</small></span>${status}</button></li>`;
  }).join("");
}

function learnerWork(id, interactive) {
  const record = state.submissions[id];
  const roleUi = window.AcademyRoleUi?.enabled(role);
  const assignmentBody = roleUi ? `<ul class="${interactive ? "demo-assignment-list" : "item-list"}">${assignmentRows(id, interactive)}</ul>`
    : list(taskRows(id, interactive).slice(0, 1));
  const actions = roleUi ? `<div class="demo-subnav">${interactive ? button("학습 영상", "navigate", { id: "video" }) : button("성적 추이", "navigate", { id: "grades" })}</div>` : "";
  return `${header(roleUi ? (interactive ? "과제" : "과제/성적") : "과제·공지", interactive && roleUi ? "과제 제목을 누르면 바로 제출 화면이 열립니다." : "과제 제출 상태와 수업 공지를 확인하세요.")}
    ${actions}
    <div class="columns">
      ${panel("과제 목록", assignmentBody + (!roleUi && record?.attachment ? `<p class="note">첨부 ${escapeHtml(record.attachment)}</p>` : "")
        + (!roleUi && record?.note ? `<p class="note">${escapeHtml(record.note)}</p>` : ""))}
      ${!roleUi || interactive ? panel("학원 공지", list(taskRows(id, interactive).slice(1))) : ""}
    </div>`;
}

function childPicker() {
  const roleUi = window.AcademyRoleUi?.enabled(role);
  return `<div class="parent-picker" aria-label="자녀 선택">${["jiwoo", "minjun"].map((id) =>
    `<button class="${roleUi ? "demo-child-chip" : "secondary"}" type="button" data-action="child" data-id="${id}" aria-pressed="${id === child}"><span>${studentName(id)}</span></button>`).join("")}</div>`;
}

function parentView(screen) {
  const controls = childPicker();
  if (screen === "news") {
    const read = state.parentNoticeReads.includes(child);
    return header("소식", "학원 공지와 내신 일정을 확인합니다.") + controls
      + panel("학원 공지", list([item(notice.title, read ? "읽음" : "안 읽음", button("공지 보기", "parent-notice"))]))
      + panel("다가오는 일정", list([
        item("내신 일정", "시험과 수행평가", button("보기", "navigate", { id: "school-schedule" })),
        item("수업 일정", "학원 시간표", button("보기", "navigate", { id: "schedule" })),
      ]), "", "stack")
      + panel("받은 알림", notificationList(child, 3) + (window.AcademyRoleUi?.enabled(role) ? window.DemoTuition.notices(child) : ""), button("전체", "navigate", { id: "notifications", variant: "text-button" }), "stack");
  }
  if (screen === "grades") return learnerGrades(child, "성적 추이");
  if (screen === "attendance") return header("자녀 출결", "자녀별 등원·하원 기록입니다.") + controls + panel("출결 기록", attendanceHistory(child));
  if (screen === "notifications") return header("받은 알림", "자녀별 등원·하원과 학원비 알림을 확인합니다.") + controls + panel("알림 기록", notificationList(child, 20) + (window.AcademyRoleUi?.enabled(role) ? window.DemoTuition.notices(child) : ""));
  if (screen === "learning") return controls + learnerWork(child, false);
  if (screen === "video") return controls + header("학습 영상", "자녀가 볼 수 있는 영상의 시청 상태예요.") + videoCard(child, false);
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

function blockTabsContext() {
  const learner = student(role === "parent" ? child : "jiwoo");
  const roster = roleStudents();
  const exams = assessments.filter(({ group }) => group === "중2 심화반");
  const selected = exams.find(({ id }) => id === selectedExam) ?? exams.at(-1);
  return {
    learner, roster, state, video, notice, tasks: [assignment, reviewAssignment], publishedScores, chartAverage,
    scoreChange: lastScoreChange, lessons: scheduledClasses(), selectedLearner, exam: DemoSchoolAssessments.upcoming(),
    childPicker: role === "parent" ? childPicker() : "", tuition: role === "parent" ? window.DemoTuition.preview(child) : null,
    teacherGroup: roster[0]?.group ?? "", assessmentLabel: selected?.title ?? "평가 없음",
  };
}

function roleScreen(screen) {
  if (role === "owner" && screen === "schedule") return "timetable";
  return menus[role].some(([id]) => id === screen) ? screen : null;
}

function roleNavigationUrl(entry) {
  const url = new URL(location.href);
  for (const key of ["view", "tab", "learner"]) url.searchParams.delete(key);
  if (entry.screen !== "home") url.searchParams.set("view", entry.screen);
  if (entry.tab !== window.AcademyRoleUi.rootFor(role, entry.screen)) url.searchParams.set("tab", entry.tab);
  if (entry.learner) url.searchParams.set("learner", entry.learner);
  if (url.hash === "#school-schedule") url.hash = "";
  return url;
}

function saveNavigation(entry, replace) {
  const data = { ...history.state, gradientDemoNavigation: entry };
  delete data.demoV3Menu;
  delete data.gradientLearningOrigin;
  // A covered application screen is a single history entry, independent of modal/fullscreen entries.
  history[replace ? "replaceState" : "pushState"](data, "", roleNavigationUrl(entry));
}

function setNavigation(entry) {
  if (activeScreen === "roster" && entry.screen !== "roster") {
    rosterUploadId++;
    rosterPreview = null;
  }
  if (selectedLearner !== entry.learner) consultationPeriod = "all";
  selectedLearner = entry.learner ?? null;
  activeScreen = entry.screen;
  activeNavigation = entry;
}

function showNavigation(entry) {
  if (dialog.open) dialog.close();
  setNavigation(entry);
  render();
  content.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function tabEntry(tab) {
  return { role, screen: tab, tab, depth: 0, journey: globalThis.crypto.randomUUID?.() ?? String(Date.now()) };
}

function installTab(tab, truncateForward = false) {
  const entry = tabEntry(tab);
  saveNavigation(entry, true);
  if (truncateForward) saveNavigation(entry, false);
  showNavigation(entry);
}

function initializeNavigation() {
  if (!window.AcademyRoleUi?.enabled(role)) return;
  const url = new URL(location.href);
  const screen = roleScreen(url.searchParams.get("view") ?? activeScreen) ?? "home";
  const openingTab = url.searchParams.get("tab");
  const roots = window.AcademyRoleUi.tabRoots(role);
  const requestedLearner = url.searchParams.get("learner");
  const learner = screen === "students" && roleStudents().some(person => person.id === requestedLearner) ? requestedLearner : undefined;
  const tab = roots.includes(screen) && !learner ? screen : roots.includes(openingTab) ? openingTab : window.AcademyRoleUi.rootFor(role, screen);
  const entry = history.state?.gradientDemoNavigation;
  if (entry?.role === role && entry.screen === screen && entry.tab === tab && entry.learner === learner) {
    setNavigation(entry);
    return;
  }
  const root = tabEntry(tab);
  const destination = screen === tab && !learner ? root : { ...root, screen, depth: 1, learner };
  if (!url.searchParams.has("screen")) {
    saveNavigation(root, true);
    if (destination !== root) saveNavigation(destination, false);
  }
  setNavigation(destination);
}

function navigateRole(screen, { tabLink = false, learner } = {}) {
  if (!window.AcademyRoleUi?.enabled(role)) {
    if (activeScreen === "roster" && screen !== "roster") {
      rosterUploadId++;
      rosterPreview = null;
    }
    if (screen === "students") selectedLearner = learner ?? null;
    activeScreen = screen;
    render();
    content.focus();
    return;
  }
  const destination = roleScreen(screen);
  if (!destination || pendingTab) return;
  if (tabLink) {
    const extra = Number(window.DemoHomeV3.takeDrawerEntry());
    const depth = activeNavigation.depth + extra;
    if (depth) {
      pendingTab = destination;
      history.go(-depth);
    } else installTab(destination);
    return;
  }
  if (destination === activeScreen && (learner ?? null) === selectedLearner) {
    window.DemoHomeV3.backDrawer();
    window.scrollTo(0, 0);
    return;
  }
  const roots = window.AcademyRoleUi.tabRoots(role);
  const isLanding = roots.includes(destination) && !learner;
  const tab = isLanding ? destination : activeNavigation.tab;
  const entry = { ...activeNavigation, screen: destination, tab, learner, depth: activeNavigation.depth + 1 };
  saveNavigation(entry, window.DemoHomeV3.takeDrawerEntry());
  showNavigation(entry);
}

function restoreLearningOrigin(screen) {
  const saved = history.state?.gradientDemoNavigation;
  if (saved?.role === role && saved.screen === screen) {
    setNavigation(saved);
    return;
  }
  // Direct links to an existing full-screen view can carry an origin without route state.
  const tab = window.AcademyRoleUi.rootFor(role, screen);
  const root = tabEntry(tab);
  if (tab === screen) {
    saveNavigation(root, true);
    setNavigation(root);
  } else {
    const entry = { ...root, screen, depth: 1 };
    saveNavigation(root, true);
    saveNavigation(entry, false);
    setNavigation(entry);
  }
}

function demoBack() {
  if (blockDetails?.back()) return true;
  if (window.DemoHomeV3?.backDrawer()) return true;
  const modal = document.querySelector("dialog[open]");
  if (modal) {
    modal.close();
    return true;
  }
  if (!activeNavigation || window.AcademyRoleUi.tabRoots(role).includes(activeScreen) && !selectedLearner) return false;
  if (activeNavigation.depth > 0) history.back();
  else installTab(activeNavigation.tab);
  return true;
}

function render() {
  if (blockDetails?.render()) return;
  const brandName = document.querySelector(".demo-brand-actions .school strong");
  if (brandName) brandName.textContent = demoWebsiteProfile().name;
  const blockTabs = window.AcademyRoleUi?.enabled(role) ? window.DemoBlockTabs : null;
  blockTabs?.scope(role, activeScreen);
  const blockView = blockTabs && document.body.hasAttribute("data-c-block-scope")
    ? blockTabs.render(role, activeScreen, blockTabsContext()) : null;
  navigation.innerHTML = menus[role].map(([screen, label]) => `<button class="nav-button" type="button" data-action="navigate" data-id="${screen}"${screen === activeScreen ? ' aria-current="page"' : ""}><span aria-hidden="true">${symbols[screen]}</span>${label}</button>`).join("");
  if (activeScreen === "website") content.innerHTML = academyWebsite();
  else if (activeScreen === "homepage-edit") content.innerHTML = demoSite.editor(window.AcademyRoleUi, demoWebsiteProfile().name);
  else if (activeScreen === "operations") content.innerHTML = window.DemoStaffOperations.operations(roleHomeOptions());
  else if (activeScreen === "staff-leave") content.innerHTML = window.DemoStaffOperations.leave(staffOperationsContext());
  else if (activeScreen === "staff-pay") content.innerHTML = window.DemoStaffOperations.pay(staffOperationsContext());
  else if (activeScreen === "my-work") content.innerHTML = window.DemoStaffOperations.myWork(staffOperationsContext());
  else if (activeScreen === "timetable") content.innerHTML = demoSite.timetableEditor();
  else if (activeScreen === "tuition") content.innerHTML = window.DemoTuition.render(tuitionContext());
  else if (activeScreen === "schedule") content.innerHTML = calendarView();
  else if (activeScreen === "academy-calendar") content.innerHTML = window.DemoHomeCalendar.render(role, roleHomeOptions(), true);
  else if (activeScreen === "school-schedule") content.innerHTML = DemoSchoolAssessments.view();
  else if (activeScreen === "home" && window.AcademyRoleUi?.enabled(role)) {
    content.innerHTML = window.DemoHomeV3.home(role, roleHomeOptions());
  } else if (activeScreen === "home-overview" && window.AcademyRoleUi?.enabled(role)) {
    content.innerHTML = window.AcademyRoleUi.overview(role, roleHomeRows(), role === "parent" ? childPicker() : "");
  }
  else if (blockView !== null) content.innerHTML = blockView;
  else if (role === "parent") content.innerHTML = parentView(activeScreen);
  else if (role === "student") {
    const screens = { home: studentHome,
      attendance: () => header("QR 출석", "입구 태블릿의 QR을 카메라로 읽으세요.") + panel("출결 확인", `<div class="actions">${button("카메라로 QR 찍기", "camera-qr", { variant: "primary" })}${button("출결 체험하기", "mock-qr")}</div>` + attendanceHistory("jiwoo")),
      notifications: () => header("알림", "숙제·공지·영상의 확인 요청을 모았어요.") + panel("학습 알림", list(state.reminders.filter((entry) => entry.student === "jiwoo").map((entry) => item(entry.topic, entry.time)), "새 학습 알림이 없습니다.")),
      learning: () => learnerWork("jiwoo", true), grades: () => learnerGrades("jiwoo", "내 성적"),
      video: () => header("학습 영상", "마지막 시청 위치에서 이어볼 수 있습니다.") + videoCard("jiwoo", true) };
    content.innerHTML = screens[activeScreen]();
  } else {
    const screens = { home: role === "owner" ? ownerHome : teacherHome, attendance: staffAttendance, learning: staffLearning,
      grades: role === "owner" ? ownerGrades : teacherGrades, roster: ownerRoster, settings: ownerSettings, video: staffVideo, students: staffStudents,
      notifications: () => header(role === "owner" ? "공지·발송" : "발송 기록", "출결과 연결된 발송 예시입니다.",
        role === "owner" && window.AcademyRoleUi?.enabled(role) ? button("공지 쓰기", "home-notice-write", { variant:"primary" }) : "")
        + panel("발송 예시", notificationList(null, 30)) };
    content.innerHTML = screens[activeScreen]();
  }
  if (window.AcademyRoleUi?.enabled(role)) {
    if (activeScreen === "notifications" && window.DemoHomeV3.getNoticeMode()) {
      const reminders = window.DemoHomeCalendar.reminders(role, roleHomeOptions());
      if (reminders.length) content.insertAdjacentHTML("beforeend", panel("일정 알림", list(reminders.map(({ topic, time }) => item(topic, time)))));
    }
    if (activeScreen === "students" && role === "owner" && !selectedLearner) {
      const title = content.querySelector(".page-head");
      if (title) title.insertAdjacentHTML("afterend", window.DemoStaffOperations.schoolTile());
      else content.insertAdjacentHTML("afterbegin", window.DemoStaffOperations.schoolTile());
    }
  }
  if (window.AcademyRoleUi?.enabled(role)) {
    const tabLanding = window.AcademyRoleUi.tabRoots(role).includes(activeScreen) && !(activeScreen === "students" && selectedLearner);
    window.AcademyRoleUi.apply(content, role, activeScreen, activeNavigation?.tab, tabLanding);
    document.body.dataset.demoScreen = activeScreen;
    document.body.dataset.demoTab = activeNavigation?.tab ?? window.AcademyRoleUi.rootFor(role, activeScreen);
  }
  if (window.AcademyRoleUi?.enabled(role)) window.DemoHomeV3.apply(homeV3Context());
  paintScoreCharts();
}

function openDialog(title, body, confirmLabel, handler, destructive = false) {
  dialog.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2><div class="dialog-body">${body}
    <div class="dialog-actions"><button type="button" class="secondary" data-action="close-dialog">닫기</button>
    ${confirmLabel ? `<button type="button" data-confirm class="${destructive ? "secondary danger" : "primary"}">${escapeHtml(confirmLabel)}</button>` : ""}</div></div>`;
  dialog.querySelector("[data-confirm]")?.addEventListener("click", async () => {
    const selected = new Map(Array.from(dialog.querySelectorAll('select[name], input[name]:not([type="file"])'), (control) => [control.name, control.value]));
    if (await handler?.(selected) !== false) dialog.close();
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

function recordAttendance(selectedId) {
  const roster = roleStudents();
  openDialog("수동 출결 기록", `<label>학생<select name="student">${roster.map(({ id, name }) => `<option value="${id}"${id === selectedId ? " selected" : ""}>${name}</option>`).join("")}</select></label>
    <label>기록 종류<select name="kind"><option value="in">등원</option><option value="late">지각 등원</option><option value="out">하원</option></select></label>
    <label>알림 채널<select name="channel">${(nativeShell ? ["앱 안 알림", "알림톡", "문자"] : ["알림톡", "문자"]).map((channel) =>
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
    const selectedChannel = form.get("channel");
    const channel = ["앱 안 알림", "문자", "알림톡"].includes(selectedChannel) ? selectedChannel : state.settings.channel;
    state.attendance.push({ student: id, kind: isCheckout ? "out" : "in", late: kind === "late", time });
    state.notifications.unshift({ student: id, channel, topic: isCheckout ? "하원 안내" : kind === "late" ? "지각 등원 안내" : "등원 안내", time });
    saveState();
    if (!isCheckout && channel === "앱 안 알림") nativeShell?.checkIn();
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

function submitHomework(taskId = assignment.id) {
  const task = [assignment, reviewAssignment].find(({ id }) => id === taskId);
  if (!task) return;
  const submissions = task.id === assignment.id ? state.submissions : state.reviewSubmissions;
  const previous = submissions.jiwoo;
  const roleUi = window.AcademyRoleUi?.enabled(role);
  const heading = roleUi ? `<h3>${task.title}</h3><p class="note">마감 ${task.due}</p>` : "";
  if (previous?.status === "reviewed") {
    openDialog("과제 결과", heading + `<p>${escapeHtml(previous.note || "검사를 마쳤습니다.")}</p>`);
    return;
  }
  let ready = false;
  openDialog("풀이 사진 제출", `${heading}<p>${task.detail}</p>${previous?.note ? `<p class="note">${escapeHtml(previous.note)}</p>` : ""}
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
    submissions.jiwoo = { status: "submitted", attachment: "풀이 사진", note: "" };
    saveState();
    announce("가상 제출 상태를 이 기기에 저장했습니다. 실제 선생님에게 전송되지 않습니다.");
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
  const options = scheduledClasses().filter((lesson) => teacherLesson(lesson) && lesson.day !== "목"
    && !state.leaves.some((entry) => entry.classId === lesson.id && entry.status !== "declined"));
  if (!options.length) {
    announce("신청 가능한 수업이 없습니다.");
    return;
  }
  openDialog("휴가 신청", `<label>수업<select name="class">${options.map(({ id, dayNumber, group, time }) =>
    `<option value="${escapeHtml(id)}">11월 ${dayNumber}일 · ${escapeHtml(group)} · ${time}</option>`).join("")}</select></label>
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
  const lesson = scheduledClasses().find((record) => record.id === id);
  if (!entry || !lesson) return;
  const available = teachers.filter(({ name }) => name !== lesson.teacher && !scheduledClasses().some((candidate) =>
    candidate.teacher === name && candidate.day === lesson.day && candidate.time === lesson.time));
  openDialog("휴가 승인·대체 교사 배정", `<p>${escapeHtml(lesson.teacher)} 선생님 · 11월 ${lesson.dayNumber}일 · ${escapeHtml(lesson.group)}</p>
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
    <label>출결 알림 채널<select name="channel">${(nativeShell ? ["앱 안 알림", "알림톡", "문자"] : ["알림톡", "문자"]).map((channel) =>
      `<option${state.settings.channel === channel ? " selected" : ""}>${channel}</option>`).join("")}</select></label>
    <label>등수 공개<select name="rank"><option value="off"${state.settings.rank ? "" : " selected"}>꺼짐</option>
      <option value="on"${state.settings.rank ? " selected" : ""}>켜짐</option></select></label>`, "설정 저장", (form) => {
    const lateMinutes = form.get("lateMinutes");
    const channel = form.get("channel");
    if (!["0", "5", "10", "15"].includes(lateMinutes) || !(nativeShell ? ["앱 안 알림", "알림톡", "문자"] : ["알림톡", "문자"]).includes(channel)) return false;
    state.settings = { rank: form.get("rank") === "on", lateMinutes, channel };
    saveState();
    announce("학원 설정을 저장했습니다.");
  });
}

function reviewSubmission(id) {
  const record = state.submissions[id];
  if (!["owner", "teacher"].includes(role) || !roleStudents().some((learner) => learner.id === id) || !record) return;
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

function readParentNotice() {
  const read = state.parentNoticeReads.includes(child);
  openDialog(notice.title, `<p>${notice.detail}</p>`, read ? "" : "읽음 확인", () => {
    if (!state.parentNoticeReads.includes(child)) state.parentNoticeReads.push(child);
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
    if (kind === "in" && state.settings.channel === "앱 안 알림") nativeShell?.checkIn();
    announce(`${label} 체험을 완료했습니다. 이 기기에 기록했습니다.`);
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
  const ticket = /^academy-demo-qr:v1:(generic):(in|out):(\d{10}):([a-f0-9]{16})$/.exec(payload ?? "");
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
  if (kind === "in" && state.settings.channel === "앱 안 알림") nativeShell?.checkIn();
  return { message: `${label} 체험을 완료했습니다. 이 기기에 기록했습니다.`, done: true };
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
window.addEventListener("gradient:appearance-change", paintScoreCharts);
window.addEventListener("storage", (event) => {
  const tuitionScreen = ["home", "operations", "tuition"].includes(activeScreen) && window.DemoTuition?.ownsStorage(event.key);
  if (!dialog.open && (tuitionScreen || window.DemoStaffOperations?.ownsStorage(event.key)) && window.AcademyRoleUi?.enabled(role)) render();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && cameraSession?.stream) dialog.close();
});

function homeV3Context() {
  const route = (screen) => navigation.querySelector(`[data-action="navigate"][data-id="${CSS.escape(screen)}"]`)?.click();
  return { role, options:roleHomeOptions(), screen:activeScreen, rerender:render, navigate:route,
    openSheet:openDemoSheet, openDialog, announce,
    openLearningDetail: (source, id) => {
      if (source === "authored" && id === "demo-v31-video") return blockDetails?.open("video", "linear-video");
      if (source !== "assignment") return false;
      if (role === "student") return blockDetails?.open("assignment", id);
      const submissions = id === assignment.id ? state.submissions : state.reviewSubmissions;
      const available = roleStudents().find(learner => submissions[learner.id]?.status === "submitted");
      return role === "teacher" && Boolean(available && blockDetails?.open("review", available.id, activeScreen, id));
    },
    closeDialog:() => { if (dialog.open) dialog.close(); },
    cropFields:photo => demoSite.bannerCropFields(photo),
    setupCrop:() => demoSite.bannerCropPicker(),
    openInstructor:id => { void demoSite.handle({ dataset:{ action:"site-own-card", id } }); },
    openNotice:id => showHomeNotice(id),
  };
}

function tuitionContext() {
  return { role, child, students, navigate:homeV3Context().navigate, childControls: role === "parent" ? childPicker() : "", dialog,
    openSheet: openDemoSheet, rerender: render, announce };
}

function staffOperationsContext() {
  const context = homeV3Context();
  return { ...context, lessons:scheduledClasses(), staffName:demoSite?.teacherName };
}

function showHomeNotice(id) {
  const entry = homeNotices().find(candidate => candidate.id === id);
  if (!entry) return;
  if (role === "parent" && id === "initial" && !state.parentNoticeReads.includes(child)) {
    state.parentNoticeReads.push(child);
    saveState();
  }
  openDialog(entry.title, `<p>${escapeHtml(entry.detail)}</p>`);
}

document.addEventListener("click", (event) => {
  const staffOperation = event.target.closest("[data-staff-operation]");
  if (staffOperation && window.AcademyRoleUi?.enabled(role)) {
    window.DemoStaffOperations.handle(staffOperation, staffOperationsContext());
    return;
  }
  const tuition = event.target.closest("[data-tuition-action]");
  if (tuition && (activeScreen === "tuition" || (activeScreen === "home" && role === "parent")) && window.AcademyRoleUi?.enabled(role)) {
    window.DemoTuition.handle(tuition, tuitionContext());
    return;
  }
  const v3 = event.target.closest("[data-v3-home-action], [data-v3-banner-action], [data-v3-calendar-action]");
  if (v3 && window.AcademyRoleUi?.enabled(role)) {
    const context = homeV3Context();
    if (v3.dataset.v3HomeAction) window.DemoHomeV3.handle(v3, context);
    else if (v3.dataset.v3BannerAction) window.DemoHomeBanners.handle(v3, context);
    else window.DemoHomeCalendar.handle(v3, context);
    return;
  }
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const { action, id } = control.dataset;
  if (action === "app-back") demoBack();
  else if (action.startsWith("block-") && document.body.hasAttribute("data-c-block-scope")) {
    handleBlockTabAction(action, id, control);
  } else if (action === "navigate" && menus[role].some(([screen]) => screen === id)) {
    navigateRole(id, { tabLink: control.hasAttribute("data-demo-tab") });
  } else if (action === "homepage-day" && ["home", "website"].includes(activeScreen) && ["student", "parent"].includes(role) && [...scheduleDays, "일"].includes(id)) {
    const scrollTarget = control.dataset.scrollTarget;
    homepageDay = id;
    render();
    const active = content.querySelector('.demo-polished-days button[aria-pressed="true"]');
    active?.focus({ preventScroll: true });
    if (scrollTarget) document.getElementById(scrollTarget)?.scrollIntoView({ block: "center" });
  } else if (action === "schedule-day" && (scheduleDays.includes(id) || (demoSite && id === "일"))) {
    selectedDay = id;
    render();
    content.querySelector('.day-button[aria-pressed="true"]')?.focus();
  } else if (activeScreen === "school-schedule" && action.startsWith("school-demo-")) DemoSchoolAssessments.handle(action, id);
  else if (action === "neis-academy" && demoSite && role === "owner") lookupDemoAcademy(control);
  else if (action === "record-attendance" && ["owner", "teacher"].includes(role)) recordAttendance();
  else if (action === "submit-homework" && role === "student") {
    if (!blockDetails?.open("assignment", id || assignment.id)) submitHomework(id);
  }
  else if (action === "parent-notice" && role === "parent" && activeScreen === "news") readParentNotice();
  else if (activeScreen === "students" && ["student-detail", "student-list", "consultation-note"].includes(action) && ["owner", "teacher"].includes(role)) {
    if (action === "student-detail" && roleStudents().some((learner) => learner.id === id)) {
      consultationPeriod = "all";
      navigateRole("students", { learner: id });
    } else if (action === "student-list") {
      if (window.AcademyRoleUi?.enabled(role)) demoBack();
      else navigateRole("students");
    } else if (action === "consultation-note") editConsultationNote(id);
  }
  else if (window.AcademyRoleUi?.enabled(role) && action === "home-notice") showHomeNotice(id);
  else if (demoSite && ["owner", "teacher"].includes(role) && action === "homepage-edit") editDemoHomepage(id);
  else if (demoSite && (["website", "homepage-edit", "timetable"].includes(activeScreen) && action.startsWith("site-") || ["site-own-card", "site-staff-detail", "site-staff-all"].includes(action))) void demoSite.handle(control);
  else if (window.AcademyRoleUi?.enabled("owner") && role === "owner" && activeScreen === "settings" && action === "setting-field") editDemoSetting(id, control);
  else if (window.AcademyRoleUi?.enabled("owner") && role === "owner" && activeScreen === "settings" && action === "setting-switch" && id === "rank") {
    const error = patchDemoField("settings", id, !state.settings.rank);
    content.querySelector('[data-action="setting-switch"]')?.focus();
    announce(error || "저장했어요");
  }
  else if (window.AcademyRoleUi?.enabled("owner") && role === "owner" && action === "home-notice-write") writeDemoNotice();
  else if (window.AcademyRoleUi?.enabled("parent") && role === "parent" && action === "demo-consultation") requestDemoConsultation();
  else if (window.AcademyRoleUi?.enabled(role) && action === "demo-contact" && ["address", "phone", "kakao"].includes(id)) {
    const value = demoWebsiteProfile()[id];
    if (value) openDialog({ address: "지도 열기", phone: "전화 걸기", kakao: "카카오 채널 보기" }[id],
      `<p>${escapeHtml(value)}</p><p class="note">가상 학원 정보입니다. 이 데모에서는 외부 앱을 열지 않습니다.</p>`);
  }
  else if (action === "website-notice") openDialog(notice.title, `<p>${escapeHtml(notice.detail)}</p>`);
  else if (!demoSite && action === "request-leave" && role === "teacher") requestLeave();
  else if (!demoSite && action === "review-leave" && role === "owner") reviewLeave(id);
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
  else if (action === "send-roster-invites" && role === "owner" && activeScreen === "roster") sendRosterInvites();
  else if (action === "print-roster-invites" && role === "owner" && activeScreen === "roster") printRosterInvites();
  else if (action === "review") {
    if (!blockDetails?.open("review", id, activeScreen, control.dataset.taskId)) reviewSubmission(id);
  }
  else if (action === "open-notice") readNotice();
  else if (action === "watch-video") {
    if (!blockDetails?.open("video", id)) watchVideo();
  }
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
    const task = [assignment, reviewAssignment].find(item => item.id === control.dataset.taskId);
    state.reminders.unshift({ student: learner, topic: `${topic} 리마인드`, time: sessionTime(), ...(task ? { task: task.id } : {}) });
    saveState();
    announce(`${studentName(learner)} 학생 홈에 학습 알림을 남겼습니다.`);
  }
});

function handleBlockTabAction(action, id, control) {
  if (action === "block-jump") {
    const target = document.getElementById(`c-row-${id}`);
    if (!target) return;
    if (target.tagName !== "BUTTON") target.tabIndex = -1;
    target.focus({ preventScroll:true });
    target.scrollIntoView({ block:"center" });
  } else if (action === "block-attendance" && role === "teacher" && activeScreen === "attendance" && roleStudents().some(person => person.id === id)) {
    recordAttendance(id);
  } else if (action === "block-remind-all" && role === "teacher" && activeScreen === "learning") {
    const task = [assignment, reviewAssignment].find(item => item.id === id);
    if (!task && id !== "notice") return;
    const records = task === assignment ? state.submissions : state.reviewSubmissions;
    const recipients = roleStudents().filter(person => task ? !records[person.id] : !state.notices.includes(person.id));
    if (!recipients.length) return;
    const time = sessionTime();
    const topic = task ? "과제 제출 리마인드" : "공지 확인 리마인드";
    state.reminders.unshift(...recipients.map(person => ({ student:person.id, topic, time, ...(task ? { task:task.id } : {}) })));
    saveState();
    announce(`${recipients.length}명에게 리마인드를 남겼어요.`);
  } else if (["student", "parent"].includes(role)) {
    const info = window.DemoBlockTabs.info(action,id,blockTabsContext());
    if (info) openDemoSheet(info.title,`<p>${escapeHtml(info.detail)}</p>`,null,control,{ closeOnly:true });
  }
}

content.addEventListener("change", (event) => {
  const field = event.target;
  if (field.id === "roster-file" && role === "owner" && activeScreen === "roster") {
    const file = field.files?.[0];
    field.value = "";
    if (file) void previewRosterFile(file);
    return;
  }
  if (field.id === "consultation-period" && activeScreen === "students" && ["all", "november"].includes(field.value)) {
    consultationPeriod = field.value;
    render();
    content.querySelector("#consultation-period")?.focus();
    return;
  }
  if (field.id !== "grade-assessment") return;
  selectedExam = field.value;
  render();
  content.querySelector("#grade-assessment")?.focus();
});

roleSelect.addEventListener("change", () => {
  if (activeNavigation) {
    roleSelect.value = role;
    return;
  }
  rosterUploadId++;
  rosterPreview = null;
  role = window.ACADEMY_APP_ROLE;
  roleSelect.value = role;
  if (activeScreen !== "school-schedule") activeScreen = "home";
  render();
});


window.academyDemoRequestReset = (afterReset) => {
  if (dialog.open) dialog.close();
  openDialog("데모 초기화", "<p>이 기기의 가상 출결·숙제·성적·내신·학원비 체험과 데모 알림만 초기화합니다. 실제 학원 계정과 자료에는 영향을 주지 않습니다.</p>", "데모만 초기화", async () => {
    const siteError = await demoSite?.reset();
    if (siteError) { announce(siteError); return false; }
    rosterUploadId++;
    rosterPreview = null;
    releasePhotoPreview();
    stopCamera();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key === storageKey) localStorage.removeItem(key);
      }
    } catch { /* Reset still works in memory if local storage is unavailable. */ }
    state = freshState();
    child = "jiwoo";
    selectedDay = "목";
    homepageDay = undefined;
    selectedExam = "linear-fourth";
    selectedLearner = null;
    consultationPeriod = "all";
    DemoSchoolAssessments.reset();
    window.DemoTuition.reset();
    window.DemoStaffOperations.reset();
    window.DemoHomeCalendar?.reset();
    window.DemoHomeBanners?.reset();
    saveState();
    nativeShell?.resetDemo?.();
    window.academyDemoGuide?.reset();
    afterReset?.();
    announce("가상 데모와 데모 알림을 초기화했습니다.");
  }, true);
};
document.getElementById("reset").addEventListener("click", () => window.academyDemoRequestReset());


const standaloneMode = window.matchMedia("(display-mode: standalone)");
function updateInstallButton() {
  installButton.hidden = Boolean(nativeShell) || standaloneMode.matches || navigator.standalone === true;
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
if (!nativeShell && window.isSecureContext && "serviceWorker" in navigator && /^https?:$/.test(demoRoot.protocol)) {
  navigator.serviceWorker.register(new URL("demo-worker.js", demoRoot)).catch(() => {
    // The browser's manual home screen option remains available without a worker.
  });
}

blockDetails = window.DemoBlockDetails?.create({
  content, dialog, render, role: () => role, screen: () => activeScreen, state: () => state, save: saveState,
  setScreen: restoreLearningOrigin,
  enabled: () => window.AcademyRoleUi?.enabled(role),
  validScreen: (screen) => menus[role].some(([id]) => id === screen),
  tasks: [assignment, reviewAssignment], visibleStudents: roleStudents,
  studentGroup: () => student("jiwoo")?.group ?? "학생",
  canSubmit: (task) => task.id !== assignment.id || state.clock < 21 * 60,
  openSheet: openDemoSheet,
});
initializeNavigation();
render();
blockDetails?.initialize();
window.academyDemoBack = demoBack;
window.addEventListener("popstate", () => {
  if (!activeNavigation || new URL(location.href).searchParams.has("screen")) return;
  if (pendingTab) {
    const tab = pendingTab;
    pendingTab = undefined;
    installTab(tab, true);
    return;
  }
  // Full-screen routes restore their origin in the earlier detail listener.
  const entry = history.state?.gradientDemoNavigation;
  if (entry?.journey === activeNavigation.journey && entry.role === role) {
    if (entry.screen !== activeScreen || (entry.learner ?? null) !== selectedLearner) showNavigation(entry);
  } else installTab(activeNavigation.tab);
});
showDemoInvite();
window.addEventListener("hashchange", showDemoInvite);

window.academyDemoNavigate = (screen, nextRole) => {
  if (nextRole && nextRole !== window.ACADEMY_APP_ROLE) return false;
  if (nextRole && Object.hasOwn(menus, nextRole)) {
    roleSelect.value = nextRole;
    roleSelect.dispatchEvent(new Event("change"));
  }
  const button = [...navigation.querySelectorAll("button")].find((entry) => entry.dataset.id === screen);
  if (dialog.open) dialog.close();
  button?.click();
};

window.academyDemoRunGuideAction = (action) => {
  if (action === "attendance") {
    if (latestEvent("jiwoo")?.kind === "in") {
      window.academyDemoNavigate("notifications", "parent");
      announce("등원 기록이 있습니다. 새 등원 알림은 데모 초기화 후 다시 시연하세요.");
    } else openMockQr();
  } else if (action === "homework") reviewSubmission("seoha");
  else if (action === "grades") window.academyDemoNavigate("grades", "parent");
  else if (action === "school") {
    const field = content.querySelector('[data-action="school-demo-check"]');
    if (field && !field.checked) field.click();
    content.querySelector('[data-action="school-demo-check"]')?.scrollIntoView({ block: "center" });
  }
};

roleSelect.hidden = true; roleSelect.disabled = true; roleSelect.setAttribute("aria-hidden", "true");
