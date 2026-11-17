/* Owner launch progress and offline synthetic workbook review. */
(() => {
  "use strict";

  const storageKey = "gradient-demo-launch-v1";
  const fixtureList = window.DemoWorkbookFixtures;
  const oneDay = 24 * 60 * 60 * 1000;
  const fields = { name:"학생 이름", guardian:"보호자 번호", group:"반", teacher:"선생님", outstanding:"미납액", status:"상태", secondary:"추가 보호자 번호", school:"학교" };
  const actions = [
    ["neis", "나이스 자동 입력", "학원 정보를 찾아 채워요."],
    ["workbook", "엑셀", "기존 명부의 열과 등록 대상을 확인해요."],
    ["timetable", "반·시간표", "반과 수업 시간, 담당 선생님을 확인해요."],
    ["teacher", "선생님 초대", "선생님용 초대를 준비해요."],
    ["tuition", "수납 설정", "교습비와 청구일을 정해요."],
  ];
  const manualColumns = ["학생 이름","보호자 번호","반","선생님","미납액","상태","추가 보호자 번호","학교"];
  const text = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;",
  })[character]);
  const won = value => `${value.toLocaleString("ko-KR")}원`;
  const block = (title, content) => `<section class="launch-block"><h2>${title}</h2>${content}</section>`;
  const button = (label, action, id = "", primary = false) =>
    `<button type="button" class="launch-button${primary ? " launch-primary" : ""}" data-launch-action="${action}" data-launch-id="${id}">${label}</button>`;
  const link = (name, screen) => `<button type="button" class="launch-button" data-action="navigate" data-id="${screen}">${name}</button>`;
  const option = (value, label, selected) => `<option value="${value}"${value === selected ? " selected" : ""}>${text(label)}</option>`;
  const input = (label, name, value = "", attributes = "") => `<label>${label}<input name="${name}" value="${text(value)}" ${attributes}></label>`;
  const workbookUrl = new URL("./assets/workbooks/", document.currentScript.src);

  const fresh = () => ({ completed:[], skipped:false, batches:[], linked:false, fee:null });
  let memory;
  let draft;
  let uploadSequence = 0;

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(value?.completed) && Array.isArray(value?.batches)) return value;
    } catch { /* The active demo still works in memory. */ }
    return memory ??= fresh();
  }

  function save(data, context) {
    memory = data;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* Running without storage. */ }
    context?.rerender();
  }

  function reset() {
    memory = undefined;
    leaveWorkbook();
    try { localStorage.removeItem(storageKey); } catch { /* Cleared in memory. */ }
  }

  function leaveWorkbook() {
    uploadSequence++;
    draft = undefined;
  }

  function mark(data, id) {
    if (!data.completed.includes(id)) data.completed.push(id);
  }

  function complete(id, context) {
    const data = read();
    mark(data, id);
    save(data, context);
  }

  function checklist() {
    const { completed, skipped } = read();
    if (skipped) return `<div class="launch-mini">${button("시작 체크리스트 다시 보기", "resume")}</div>`;
    return block("시작 체크리스트", `<div class="launch-progress"><progress value="${completed.length}" max="5"
      aria-label="시작 체크리스트 진행률"></progress><strong>${completed.length} / 5 완료</strong></div>
      <ol class="launch-steps">${actions.map(([id, label, description], index) =>
        `<li><button class="launch-step" type="button" data-launch-action="step" data-launch-id="${id}">
          <span class="launch-step-index${completed.includes(id) ? " launch-done" : ""}" aria-hidden="true">${completed.includes(id) ? "✓" : index + 1}</span>
          <span><strong>${label}</strong><small>${description}</small></span>
          <span aria-hidden="true">›</span></button></li>`).join("")}</ol>
      <div class="launch-actions">${button("나중에 하기", "skip")}</div>`);
  }

  function supplement(screen) {
    switch (screen) {
      case "timetable": return read().completed.includes("timetable") ? "" :
        block("반·시간표 확인", `<p>반별 시간과 담당 선생님을 확인한 뒤 완료로 표시하세요.</p>
          ${button("반·시간표 확인 완료", "finish-timetable")}`);
      case "my-work": return block("급여 확인 방법",
        "<p>내 근무에서 기록과 승인 상태를 확인하고, 내 명세서에서 지급·공제 내역을 볼 수 있어요. 예상 급여에 차이가 있으면 근무 기록과 계약 조건을 원장에게 확인하세요.</p>");
      default: return "";
    }
  }

  function parent() {
    return block("학부모 시작 안내", read().linked
      ? `<p>가상 자녀 연결이 확인됐어요. 홈에서 자녀를 고르면 출결과 과제·성적, 해당 자녀의 청구서를 볼 수 있어요.</p>
        <div class="launch-actions">${link("학원비 보기", "tuition")}</div>`
      : `<p>학원에서 받은 보호자 초대 코드를 확인하고 자녀를 연결하세요.</p>
        ${button("가상 초대 연결", "parent-link")}`);
  }

  function setNeis(row) {
    const data = read();
    data.fee = row?.publicTuition ?? null;
    mark(data,"neis");
    save(data);
  }

  function tuitionGuide() {
    const fee = read().fee;
    return fee ? `<p class="launch-guide">공개 교습비 ${won(fee.amount)} · ${text(fee.basis)}. 같은 기준의 월 교습비만 비교해요.</p>`
      : '<p class="launch-guide">비교할 나이스 공개 교습비가 없어요. 교습비와 청구 기준을 직접 확인해 주세요.</p>';
  }

  function tuitionWarning(form) {
    const fee = read().fee;
    const notice = form.querySelector("[data-launch-tuition-warning]");
    if (!fee || !notice) return;
    const basis = form.querySelector('[name="publicTuitionBasis"]');
    const amount = Number(form.querySelector('[name="tuition"]').value);
    notice.hidden = basis.value !== "comparable" || !Number.isFinite(amount) || amount <= fee.amount;
    notice.textContent = notice.hidden ? "" : `입력한 월 교습비가 같은 기준의 나이스 공개 교습비 ${won(fee.amount)}보다 높아요. 공개 정보와 청구 금액을 확인해 주세요.`;
  }

  function tuitionBasis() {
    return read().fee ? '<label>나이스 공개 교습비 비교 기준<select name="publicTuitionBasis"><option value="">비교 기준 선택</option><option value="comparable">같은 과정·기간의 교습비</option><option value="different">과정·기간이 다르거나 확인이 필요함</option></select></label><p class="launch-warning" data-launch-tuition-warning role="status" hidden></p>' : "";
  }

  function selectFixture(sample) {
    const raw = sample.sheets.flatMap(sheet => sheet.rows.map((row, index) => {
      const cells = [...row];
      if (sheet.merged && !cells[2]) cells[2] = sheet.rows[index - 1]?.[2] ?? "";
      return cells.map(value => String(value));
    }));
    return { sample, raw, headers:sample.sheets[0].headers, mapping:Object.keys(fields).map((_, index) => index), hints:"", status:"review" };
  }

  function normalize(source) {
    return source.raw.map((cells, index) => {
      const row = Object.fromEntries(Object.keys(fields).map((field, position) => [field, cells[source.mapping[position]]?.trim() ?? ""]));
      const rowNumber = index + 2;
      const withdrawn = row.status === "퇴원";
      const validPhone = phone => !phone || /^010-0000-\d{4}$/.test(phone);
      const issue = !withdrawn && (!row.name || !row.group || !validPhone(row.guardian) || !validPhone(row.secondary) ||
        (row.outstanding && !/^\d{1,7}$/.test(row.outstanding)));
      const phoneColumns = [source.mapping[1], source.mapping[6]];
      const guardians = [row.guardian, row.secondary].flatMap((number, position) => {
        if (!number) return [];
        const column = phoneColumns[position];
        const header = source.headers[column] ?? "";
        const relation = (column === 1 && source.hints.includes("B열은 아빠 번호")) || /^(?:아빠|부)(?:\s|$)/.test(header)
          ? "아빠" : /^(?:엄마|모)(?:\s|$)/.test(header) ? "엄마" : null;
        return [{ number, relation }];
      });
      return { ...row, rowNumber, withdrawn, issue, guardians, outstanding:Number(row.outstanding || 0) };
    });
  }

  function flagsFor(source, rows) {
    const flags = source.sample?.id === "merged" ? [...source.sample.flags] : [];
    for (const row of rows) {
      if (row.withdrawn) flags.push(`${row.rowNumber}행 퇴원생 → 등록에서 제외했어요.`);
      else if (row.guardians.length === 2 && row.guardians.some(guardian => !guardian.relation)) {
        flags.push(`${row.rowNumber}행 보호자 번호 2개 → 관계 확인 필요`);
      }
    }
    for (const row of rows.filter(entry => entry.issue)) flags.push(`${row.rowNumber}행에서 이름·반·가상 번호·미납액을 확인해 주세요.`);
    return flags;
  }

  function review() {
    if (!draft) return "";
    if (draft.status === "manual") {
      return block("학생 직접 입력", `<p>가상 학생 이름과 반을 입력해 등록 미리보기를 열어요.</p>${button("가상 학생 추가", "manual-add", "", true)}`);
    }
    const rows = normalize(draft);
    const active = rows.filter(row => !row.withdrawn);
    const flags = flagsFor(draft, rows);
    const counts = [
      ["학생", active.length],
      ["보호자", new Set(active.flatMap(row => row.guardians.map(guardian => guardian.number))).size],
      ["반", new Set(active.map(row => row.group).filter(Boolean)).size],
      ["선생님", new Set(active.map(row => row.teacher).filter(Boolean)).size],
      ["미납", active.filter(row => row.outstanding > 0).length],
      ["확인 필요", flags.length],
    ];
    return block("등록 전 검토", `<p id="launch-review" class="launch-source" tabindex="-1">${text(draft.sample?.label ?? "직접 입력")}${draft.hints ? ` · 힌트 적용: ${text(draft.hints)}` : ""}</p>
      ${flags.length ? `<ul class="launch-warning" aria-label="확인 필요">${flags.map(flag => `<li>${text(flag)}</li>`).join("")}</ul>` : ""}
      <dl class="launch-counts">${counts.map(([label, count]) => `<div><dt>${label}</dt><dd>${count}</dd></div>`).join("")}</dl>
      <ul class="launch-students">${rows.map(row => `<li><strong>${text(row.name || `${row.rowNumber}행`)}</strong>
      <small>${text(row.group)}${row.withdrawn ? " · 퇴원 · 등록 제외" : ""}</small>
      ${row.school ? `<small>학교 · ${text(row.school)}</small>` : ""}
      ${row.guardians.map(guardian => `<small>${guardian.relation ?? "관계 확인 필요"} ${text(guardian.number)}</small>`).join("")}
      ${row.outstanding ? `<small>미납 ${won(row.outstanding)}</small>` : ""}</li>`).join("")}</ul>
      <div class="launch-actions launch-actions-grid" aria-label="등록 전 검토 작업">
        ${button("이대로 등록", "register", "", true)}${button("다시 진행하기", "rerun")}
        ${button("직접 수정하기", "edit")}${button("직접 입력하기", "manual")}
      </div>`);
  }

  function batchesMarkup(data) {
    if (!data.batches.length) return "";
    return block("가져오기 기록", data.batches.toReversed().map(batch => {
      const expires = batch.created + oneDay;
      const canUndo = Date.now() < expires;
      return `<article class="launch-batch"><h3>학생 ${batch.rows.length}명 등록</h3>
        <p>${batch.rows.map(row => text(row.name)).join(", ")}</p>
        <p>${batch.invited ? "보호자 초대 모의 발송 완료" : "보호자 초대 대기"}</p>
        <p>등록 뒤 24시간 안에 되돌릴 수 있어요.</p>
        <div class="launch-actions">${canUndo ? button("가져오기 되돌리기", "undo", batch.id) : ""}
        ${!batch.invited && batch.rows.some(row => row.guardians.length) ? button("보호자 초대 준비", "invite", batch.id) : ""}</div></article>`;
    }).join(""));
  }

  function workbook() {
    return block("엑셀 명부 가져오기", `<p>가상 엑셀 파일을 고르면 등록 전에 변환 결과를 확인할 수 있어요.</p>
      <label class="launch-upload launch-button" for="launch-workbook-file">가상 엑셀 파일 선택
      <input class="sr-only" id="launch-workbook-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label>
      <ul class="launch-samples">${fixtureList.map(sample => `<li>${button(sample.label,"sample",sample.id)}
        <a class="launch-button" href="${new URL(sample.id + ".xlsx", workbookUrl)}" download aria-label="${sample.label} 다운로드">받기</a></li>`).join("")}</ul>`)
      + review() + batchesMarkup(read());
  }

  function reviewEdits(opener, context) {
    if (!draft) return;
    const current = draft;
    const mapping = `<fieldset class="launch-sheet-group"><legend>열 매핑</legend>${Object.entries(fields).map(([key, label], index) =>
      `<label>${label}<select name="map-${key}">${option(-1, "사용 안 함", current.mapping[index])}
        ${current.headers.map((header, column) => option(column, `${String.fromCharCode(65 + column)}열 · ${header}`, current.mapping[index])).join("")}</select></label>`).join("")}</fieldset>`;
    const data = current.raw.map((cells, row) => `<fieldset class="launch-sheet-group"><legend>${row + 2}행 값</legend>
      ${cells.map((cell, column) => input(`${String.fromCharCode(65 + column)}열 · ${text(current.headers[column])}`, `cell-${row}-${column}`, cell, 'maxlength="80"')).join("")}</fieldset>`).join("");
    context.openSheet("열·셀 직접 수정", mapping + data, form => {
      const updated = Object.keys(fields).map(key => Number(form.get(`map-${key}`)));
      if (updated[0] < 0 || updated[2] < 0 || new Set(updated.filter(value => value >= 0)).size !== updated.filter(value => value >= 0).length) {
        return "이름과 반을 지정하고 같은 열을 중복 연결하지 마세요.";
      }
      current.mapping = updated;
      current.raw = current.raw.map((cells, row) => cells.map((_, column) => String(form.get(`cell-${row}-${column}`) ?? "")));
      context.rerender();
    }, opener, { confirmLabel:"다시 검토" });
  }

  function apply(context, reject = context.announce) {
    if (!draft || draft.status !== "review") return;
    const rows = normalize(draft).filter(row => !row.withdrawn);
    if (!rows.length || rows.some(row => row.issue)) return reject("등록할 학생과 확인이 필요한 행을 먼저 확인해 주세요.");
    const data = read();
    const known = new Set(data.batches.flatMap(batch => batch.rows.map(row => `${row.name}|${row.group}`)));
    const newRows = rows.filter(row => {
      const key = `${row.name}|${row.group}`;
      if (known.has(key)) return false;
      known.add(key);
      return true;
    });
    if (!newRows.length) return reject("가져올 새 학생이 없어요.");
    const id = crypto.randomUUID();
    data.batches.push({ id, rows:newRows.map((row, index) => ({ ...row, id:`launch-${id}-${index}` })), created:Date.now(), invited:false });
    mark(data, "workbook");
    leaveWorkbook();
    save(data, context);
    context.announce(`학생 ${newRows.length}명을 등록했어요. 보호자 초대는 기록에서 준비하세요.`);
  }

  function handle(control, context) {
    const { launchAction:mode, launchId:id } = control.dataset;
    if (context.role === "parent" && context.screen === "home" && mode === "parent-link") {
      return context.openSheet("보호자 초대 연결", `<p>가상 초대 코드 <strong>DEMO-G-01</strong>을 사용하세요.</p>${input("초대 코드","code")}`, form => {
        if (String(form.get("code")).trim().toUpperCase() !== "DEMO-G-01") return "가상 초대 코드를 확인해 주세요.";
        save({ ...read(), linked:true },context);
      }, control, { confirmLabel:"가상 자녀 연결" });
    }
    if (context.role !== "owner") return;
    if (mode === "step" && context.screen === "home") {
      if (id === "neis") return context.lookupAcademy(control);
      if (id === "workbook") return context.navigate("roster");
      if (id === "timetable") return context.navigate("timetable");
      if (id === "tuition") return context.navigate("tuition");
      if (id === "teacher") return context.openSheet("선생님 초대", '<p>가상 선생님 이도현에게 보낼 초대를 준비합니다. 체험용 코드는 <strong>DEMO-T-01</strong>이에요.</p>', () => {
        complete("teacher", context);
      }, control, { confirmLabel:"모의 초대 보내기" });
    }
    if (["skip","resume"].includes(mode) && context.screen === "home") return save({ ...read(), skipped:mode === "skip" },context);
    if (mode === "finish-timetable" && context.screen === "timetable") return complete("timetable",context);
    if (context.screen !== "roster") return;
    if (mode === "sample") {
      uploadSequence++;
      const sample = fixtureList.find(entry => entry.id === id);
      if (sample) draft = selectFixture(sample);
      context.rerender();
      document.getElementById("launch-review")?.focus();
      return;
    }
    if (mode === "register" && draft?.status === "review") {
      const count = flagsFor(draft, normalize(draft)).length;
      if (!count) return apply(context);
      return context.openSheet("초안 등록 확인", `<p>확인 필요 ${count.toLocaleString("ko-KR")}건이 남아 있어요. 그래도 등록할까요?</p>`,
        () => apply(context, message => message), control, { confirmLabel:"확인하고 등록", successMessage:false });
    }
    if (mode === "rerun" && draft?.status === "review") {
      return context.openSheet("힌트로 다시 진행", `<p>예를 들어 B열은 아빠 번호라고 알려 주세요.</p>${input("변환 힌트","hint",draft.hints,'maxlength="100"')}`, form => {
        const hint = String(form.get("hint")).trim();
        if (!hint) return "변환 힌트를 입력해 주세요.";
        if (hint !== "B열은 아빠 번호") return "이 체험에서는 B열은 아빠 번호 힌트를 적용할 수 있어요.";
        draft.hints = hint;
        context.rerender();
      }, control, { confirmLabel:"힌트로 검토" });
    }
    if (mode === "edit" && draft?.status === "review") return reviewEdits(control,context);
    if (mode === "manual") {
      draft = { status:"manual" };
      return context.rerender();
    }
    if (mode === "manual-add" && draft?.status === "manual") return context.openSheet("학생 직접 입력",
      `${input("가상 학생 이름","name","",'maxlength="40"')}${input("반 이름","group","",'maxlength="40"')}${input("가상 학교 이름","school","",'maxlength="60"')}`, form => {
        const name = String(form.get("name")).trim();
        const group = String(form.get("group")).trim();
        if (!name || !group) return "가상 학생 이름과 반 이름을 입력해 주세요.";
        const school = String(form.get("school") ?? "").trim();
        draft = { status:"review", raw:[[name,"",group,"","0","재원","",school]], headers:manualColumns,
          mapping:Object.keys(fields).map((_, index) => index), hints:"" };
        context.rerender();
      }, control, { confirmLabel:"직접 입력 검토" });
    const batch = read().batches.find(entry => entry.id === id);
    if (mode === "undo" && batch && Date.now() < batch.created + oneDay) {
      return context.openSheet("가져오기 되돌리기", "<p>이 가져오기로 추가한 학생과 가상 초대 기록을 함께 지워요.</p>", () => {
        const data = read();
        if (Date.now() >= batch.created + oneDay) return "등록 후 24시간이 지나 되돌리기 시간이 끝났어요.";
        data.batches = data.batches.filter(entry => entry.id !== id);
        if (!data.batches.length) data.completed = data.completed.filter(step => step !== "workbook");
        save(data, context);
      }, control, { confirmLabel:"되돌리기" });
    }
    if (mode === "invite" && batch && !batch.invited) return context.openSheet("보호자 초대 준비",
      "<p>가상 보호자 번호별로 초대 안내를 보낼 수 있어요. 학생을 등록한 뒤 초대를 따로 준비합니다.</p>", () => {
        const data = read();
        const latest = data.batches.find(entry => entry.id === id);
        if (!latest) return "가져오기가 이미 되돌려졌어요.";
        latest.invited = true;
        save(data,context);
      }, control, { confirmLabel:"모의 초대 보내기" });
  }

  const registeredStudents = () => read().batches.flatMap(batch => batch.rows.map(row => ({ id:row.id, name:row.name, group:row.group })));

  async function upload(file, context) {
    const request = ++uploadSequence;
    if (!file || !/\.xlsx$/i.test(file.name) || file.size === 0 || file.size > 1024 * 1024) return context.announce("1MiB 이하의 가상 엑셀 원본을 골라 주세요.");
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,"0")).join("");
      if (request !== uploadSequence) return;
      const sample = fixtureList.find(entry => entry.hash === hash);
      if (!sample) return context.announce("이 화면에서 받을 수 있는 합성 예시 파일을 골라 주세요.");
      draft = selectFixture(sample);
      context.rerender();
      document.getElementById("launch-review")?.focus();
    } catch {
      if (request === uploadSequence) context.announce("가상 원본을 읽지 못했어요. 예시 버튼으로 검토할 수 있어요.");
    }
  }

  window.DemoLaunch = Object.freeze({ checklist, parent, supplement, setNeis, tuitionGuide, tuitionBasis, tuitionWarning, complete,
    workbook, handle, upload, reset, leaveWorkbook, registeredStudents });
})();
