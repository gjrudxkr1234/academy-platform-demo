/* Synthetic academy billing fixture. There are no provider calls or real payment fields. */
(() => {
  "use strict";

  const storageKey = "academy-gradient-v1-demo-tuition";
  const date = "2026-11-17";
  const children = new Set(["jiwoo", "minjun"]);
  const methods = {
    card: "카드", toss: "토스페이", naver: "네이버페이", kakao: "카카오페이", transfer: "계좌이체",
    virtual: "가상계좌", cash: "현금", academy_bank: "학원 통장 이체", terminal: "카드단말기",
  };
  const online = ["card", "toss", "naver", "kakao", "transfer", "virtual"];
  const offline = ["cash", "academy_bank", "terminal"];
  const categories = { tuition: "교습비", books: "교재비", clinic: "특강비", discount: "할인" };
  const wholeWon = new Intl.NumberFormat("ko-KR");
  let memory;
  let selectedOwner;
  let selectedParent;

  const text = (value) => String(value).replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const won = (value) => `${wholeWon.format(value)}원`;
  const monthTitle = (month) => `${month.slice(0, 4)}년 ${Number(month.slice(5))}월 학원비`;
  const sum = (lines) => lines.reduce((total, line) => total + line.amount, 0);
  const refundable = (lineAmount, used, total) => {
    if (used === -1) return lineAmount;
    if (used * 3 < total) return Math.ceil(lineAmount * 2 / 3);
    if (used * 2 < total) return Math.ceil(lineAmount / 2);
    return 0;
  };
  const nextDay = (value, after) => {
    const result = new Date(`${value}T00:00:00Z`);
    result.setUTCDate(result.getUTCDate() + after);
    return result.toISOString().slice(0, 10);
  };
  const todayDue = (due) => due < date ? "기한 지남" : due <= nextDay(date, 3) ? "납부 기한 임박" : "";
  const amountPaid = (invoice) => invoice.payment?.amount ?? 0;
  const amountRefunded = (invoice) => invoice.refunds.reduce((total, refund) => total + refund.amount, 0);
  const balance = (invoice) => Math.max(0, sum(invoice.lines) - amountPaid(invoice));
  const readableDate = (value) => `${Number(value.slice(5, 7))}월 ${Number(value.slice(8, 10))}일`;

  function freshState() {
    return { sequence: 3, settings: { tuition: 240000, billingDay: 1, dueDay: 20, sibling: 0, prorate: false },
      connection: "draft",
      invoices: [
        { id: "v1", learner: "jiwoo", month: "2026-11", due: "2026-11-19", lines: [
          { type: "tuition", amount: 240000 }, { type: "books", amount: 22000 }, { type: "discount", amount: -12000 },
        ], payment: null, pending: false, refunds: [], notes: [] },
        { id: "v2", learner: "minjun", month: "2026-11", due: "2026-11-20", lines: [{ type: "tuition", amount: 210000 }],
          payment: null, pending: false, refunds: [], notes: [] },
        { id: "v3", learner: "seoha", month: "2026-11", due: "2026-11-14", lines: [{ type: "tuition", amount: 240000 }],
          payment: { method: "academy_bank", amount: 240000, date: "2026-11-14" }, pending: false, refunds: [], notes: [] },
      ],
    };
  }

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (value && Array.isArray(value.invoices) && Number.isInteger(value.sequence) && value.settings) return value;
    } catch { /* The same demo screen remains usable during a restricted browser session. */ }
    return memory ??= freshState();
  }

  function save(data, context, message) {
    memory = data;
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* The current role can still demo in memory. */ }
    context.rerender();
    if (message) context.announce(message);
  }

  function reset() {
    memory = undefined;
    selectedOwner = undefined;
    selectedParent = undefined;
    try { localStorage.removeItem(storageKey); } catch { /* The screen uses the initial fixture. */ }
  }

  function action(label, name, id, variant = "quiet") {
    return `<button type="button" class="tuition-button tuition-button-${variant}" data-tuition-action="${name}"
      ${id ? `data-tuition-id="${text(id)}"` : ""}>${text(label)}</button>`;
  }

  function status(invoice) {
    if (invoice.payment) {
      const refunded = amountRefunded(invoice);
      if (refunded) return [refunded === amountPaid(invoice) ? "환불 완료" : "부분 환불", "info"];
      return ["완납", "success"];
    }
    if (invoice.pending) return ["입금 대기", "info"];
    return [invoice.due < date ? "미납" : "납부 전", "due"];
  }

  const student = (context, id) => context.students.find((learner) => learner.id === id);
  const name = (context, invoice) => student(context, invoice.learner)?.name ?? "가상 학생";
  const matching = (data, context) => context.role === "owner" ? data.invoices :
    context.role === "parent" && children.has(context.child) ? data.invoices.filter((entry) => entry.learner === context.child) : [];

  function stateBadge(invoice) {
    const [message, kind] = status(invoice);
    return `<span class="tuition-status tuition-status-${kind}" data-tuition-status>${message}</span>`;
  }

  function invoiceList(data, context) {
    const invoices = [...matching(data, context)].reverse();
    if (!invoices.length) return '<p class="tuition-empty">이 자녀의 청구서가 없어요.</p>';
    return `<ul class="tuition-list">${invoices.map((invoice) =>
      `<li><button type="button" class="tuition-invoice" data-tuition-action="details" data-tuition-id="${text(invoice.id)}">
        <span><strong>${context.role === "owner" ? text(name(context, invoice)) + " · " : ""}${monthTitle(invoice.month)}</strong>
          <small>납부 기한 ${readableDate(invoice.due)}</small></span>
        <span>${stateBadge(invoice)}<strong>${won(sum(invoice.lines))}</strong></span></button></li>`).join("")}</ul>`;
  }

  function ownerSummary(data) {
    const issued = data.invoices.reduce((total, invoice) => total + sum(invoice.lines), 0);
    const net = data.invoices.reduce((total, invoice) => total + amountPaid(invoice) - amountRefunded(invoice), 0);
    const outstanding = data.invoices.reduce((total, invoice) => total + balance(invoice), 0);
    return `<dl class="tuition-summary">
      <div><dt>수납액</dt><dd>${won(net)}</dd></div>
      <div><dt>미수납</dt><dd>${won(outstanding)}</dd></div>
      <div><dt>수납률</dt><dd>${issued ? Math.round(net / issued * 100) : 0}%</dd></div>
    </dl>`;
  }

  function details(invoice, context) {
    const isOwner = context.role === "owner";
    const total = sum(invoice.lines);
    const offlineCash = ["cash", "academy_bank"].includes(invoice.payment?.method) && invoice.payment.amount >= 100000;
    const actions = context.role === "parent"
      ? invoice.payment ? action("영수증 보기", "receipt", invoice.id, "primary")
        : invoice.pending ? action("가상계좌 입금 체험", "deposit", invoice.id, "primary") : action("결제하기", "pay", invoice.id, "primary")
      : invoice.payment ? `${action("영수증 보기", "receipt", invoice.id)}
          ${amountRefunded(invoice) < amountPaid(invoice) ? action("환불 계산", "refund", invoice.id, "outline") : ""}`
        : `${action("수동 수납 기록", "offline", invoice.id, "outline")}${action("미납 알림", "remind", invoice.id)}`;
    return `<div class="tuition-actions">${action("청구서 목록", "list")}</div>
      <section class="tuition-card" data-tuition-detail="${text(invoice.id)}">
        <header class="tuition-card-heading"><div><span>${text(name(context, invoice))}</span><h2>${monthTitle(invoice.month)}</h2>
          <p>납부 기한 ${text(invoice.due.replaceAll("-", "."))}</p></div>${stateBadge(invoice)}</header>
        <dl class="tuition-amounts">${invoice.lines.map((line) => `<div><dt>${categories[line.type]}</dt><dd>${won(line.amount)}</dd></div>`).join("")}
          <div class="tuition-total"><dt>청구 금액</dt><dd>${won(total)}</dd></div>
          ${amountRefunded(invoice) ? `<div><dt>누적 환불</dt><dd>${won(amountRefunded(invoice))}</dd></div>` : ""}</dl>
        ${invoice.pending ? '<p class="tuition-note">입금 대기 중이에요. 체험용으로 실제 계좌번호는 발급하지 않아요.</p>' : ""}
        ${isOwner && offlineCash ? `<p class="tuition-note">현금·이체 수납 10만 원 이상은 5일 안에 현금영수증을 발급해야 해요. 가상 발급 기한 ${readableDate(nextDay(invoice.payment.date, 5))}.</p>` : ""}
        <div class="tuition-actions">${actions}</div></section>`;
  }

  function render(context) {
    const data = read();
    const owner = context.role === "owner";
    const allowed = matching(data, context);
    const requested = owner ? selectedOwner : selectedParent;
    const active = allowed.find((entry) => entry.id === requested);
    if (!owner && context.role !== "parent") return "";
    return `<section class="tuition-view" aria-labelledby="tuition-title">
      <header class="tuition-heading"><span class="tuition-demo">가상 결제</span><h1 id="tuition-title">${owner ? "수납 관리" : "학원비"}</h1>
      <p>청구·수납·환불 기록은 이 기기에 저장해요.</p></header>
      ${context.childControls}
      ${active ? details(active, context) : `${owner ? `${ownerSummary(data)}
        <div class="tuition-actions" aria-label="수납 관리 도구">${action("청구서 만들기", "create", "", "primary")}
          ${action("수납 설정", "settings", "", "outline")}${action("결제 켜기", "connect", "", "outline")}</div>` : ""}
        <section class="tuition-card"><header class="tuition-card-heading"><h2>${owner ? "청구·수납 장부" : "자녀의 청구서"}</h2></header>
          ${invoiceList(data, context)}</section>`}
    </section>`;
  }

  function notices(child) {
    if (!children.has(child)) return "";
    const records = read().invoices.filter((entry) => entry.learner === child).flatMap((entry) => {
      const latest = entry.notes.at(-1);
      if (entry.payment) return [{ title: "학원비 결제 완료", detail: `${monthTitle(entry.month)} · ${won(entry.payment.amount)}` }];
      if (latest || todayDue(entry.due)) return [{ title: latest ?? todayDue(entry.due),
        detail: `${monthTitle(entry.month)} · ${readableDate(entry.due)}까지` }];
      return [];
    });
    if (!records.length) return "";
    return `<ul class="tuition-notices">${records.slice().reverse().map(({ title, detail }) =>
      `<li><strong>${text(title)}</strong><small>${text(detail)}</small></li>`).join("")}</ul>`;
  }

  const field = (label, key, value, type = "text", attributes = "") =>
    `<label>${label}<input name="${key}" type="${type}" value="${text(value)}" ${attributes}></label>`;
  const integerField = (label, key, value, max, min = 0) => field(label, key, value, "number", `inputmode="numeric" min="${min}" max="${max}" step="1" required`);
  const integer = (value, min, max) => /^(0|[1-9][0-9]*)$/.test(value ?? "") && Number(value) >= min && Number(value) <= max ? Number(value) : null;
  const choice = (label, key, items, selected) => `<label>${label}<select name="${key}">${items.map(([id, caption]) =>
    `<option value="${text(id)}"${id === selected ? " selected" : ""}>${text(caption)}</option>`).join("")}</select></label>`;
  const receiptItems = (invoice) => `<dl class="tuition-amounts">
    <div><dt>납부 금액</dt><dd>${won(amountPaid(invoice))}</dd></div><div><dt>결제수단</dt><dd>${methods[invoice.payment.method]}</dd></div>
    <div><dt>납부일</dt><dd>${text(invoice.payment.date.replaceAll("-", "."))}</dd></div>
    ${amountRefunded(invoice) ? `<div><dt>환불 합계</dt><dd>${won(amountRefunded(invoice))}</dd></div>` : ""}
    <div class="tuition-total"><dt>최종 수납액</dt><dd>${won(amountPaid(invoice) - amountRefunded(invoice))}</dd></div></dl>`;

  function createInvoice(opener, context) {
    const data = read();
    const due = `2026-12-${String(data.settings.dueDay).padStart(2, "0")}`;
    context.openSheet("가상 청구서 만들기",
      choice("학생", "student", context.students.map(({ id, name: fullName }) => [id, fullName]), "jiwoo") +
      `<div class="tuition-field-pair">${field("청구 월", "month", "2026-12", "month", "required")}
      ${field("납부 기한", "due", due, "date", "required")}</div>` +
      `<div class="tuition-field-pair">${Object.entries(categories).map(([type, caption]) =>
        integerField(caption, type, type === "tuition" ? data.settings.tuition : 0, 10000000)).join("")}</div>` +
      '<p class="tuition-note">할인액은 청구 총액에서 차감돼요.</p><p class="tuition-live-total">예상 합계 <strong data-tuition-preview role="status"></strong></p>',
    (form) => {
      const current = read();
      const learner = form.get("student"), month = form.get("month"), dueDate = form.get("due");
      if (!student(context, learner) || !/^20\d\d-(0[1-9]|1[0-2])$/.test(month) ||
          !/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dueDate)) return "학생·청구 월·납부 기한을 확인해 주세요.";
      if (current.invoices.some((entry) => entry.learner === learner && entry.month === month)) return "해당 학생의 같은 월 청구서가 이미 있어요.";
      const parsed = Object.keys(categories).map((type) => ({ type, amount: integer(form.get(type), 0, 10000000) }));
      if (parsed.some(({ amount }) => amount === null)) return "항목마다 0원 이상 정수 금액을 입력해 주세요.";
      const lines = parsed.filter(({ amount }) => amount !== 0).map(({ type, amount }) => ({ type, amount: type === "discount" ? -amount : amount }));
      if (sum(lines) < 1) return "청구 합계는 1원 이상이어야 해요.";
      const invoice = { id: `v${++current.sequence}`, learner, month, due: dueDate, lines, payment: null, pending: false, refunds: [], notes: [] };
      current.invoices.push(invoice);
      selectedOwner = invoice.id;
      save(current, context);
    }, opener, { confirmLabel: "청구서 생성" });
    const form = context.dialog.querySelector("form");
    const refreshTotal = () => {
      const values = new FormData(form);
      const total = Object.keys(categories).reduce((value, key) =>
        value + (integer(values.get(key), 0, 10000000) ?? 0) * (key === "discount" ? -1 : 1), 0);
      form.querySelector("[data-tuition-preview]").textContent = won(total);
    };
    form.addEventListener("input", refreshTotal);
    refreshTotal();
  }

  function settings(opener, context) {
    const preferences = read().settings;
    context.openSheet("가상 수납 설정", integerField("기본 교습비", "tuition", preferences.tuition, 10000000, 1) +
      integerField("매달 청구일", "billingDay", preferences.billingDay, 28, 1) +
      integerField("매달 납부일", "dueDay", preferences.dueDay, 28, 1) +
      integerField("형제 할인 금액", "sibling", preferences.sibling, 1000000) +
      choice("중간 등록 일할 계산", "prorate", [["off", "끄기"], ["on", "켜기"]], preferences.prorate ? "on" : "off") +
      '<p class="tuition-note">이 체험에서는 수동 청구를 만들 수 있어요.</p>',
    (form) => {
      const tuition = integer(form.get("tuition"), 1, 10000000);
      const billingDay = integer(form.get("billingDay"), 1, 28), dueDay = integer(form.get("dueDay"), 1, 28);
      const sibling = integer(form.get("sibling"), 0, 1000000);
      if ([tuition, billingDay, dueDay, sibling].includes(null) || dueDay < billingDay || sibling >= tuition) return "청구일·납부일·할인액을 확인해 주세요.";
      const current = read();
      current.settings = { tuition, billingDay, dueDay, sibling, prorate: form.get("prorate") === "on" };
      save(current, context);
    }, opener);
  }

  function connect(opener, context) {
    const states = { draft: "신청 전", review: "심사 중", ready: "사용 중" };
    context.openSheet("결제 연결 준비 중",
      '<p>학원이 PG와 직접 가맹 계약을 맺고 학원 계좌로 정산받는 방식이에요.</p><p>준비 서류는 사업자등록증, 학원 등록·신고 서류, 정산계좌 사본 등에 해당해요. PG 단계에 맞춰 실제 제출 목록을 확인해요.</p>' +
      choice("가상 신청 상태", "stage", Object.entries(states), read().connection) +
      '<p class="tuition-note">신청 상태 예시만 확인해요. 계약이나 정산계좌 입력을 요청하지 않아요.</p>',
    (form) => {
      const next = form.get("stage");
      if (!Object.hasOwn(states, next)) return "가상 신청 상태를 선택해 주세요.";
      const current = read();
      current.connection = next;
      save(current, context);
    }, opener, { confirmLabel: "가상 상태 저장" });
  }

  function settle(current, invoice, method, context) {
    if (invoice.payment) return "이미 수납을 처리했어요.";
    invoice.payment = { method, amount: sum(invoice.lines), date };
    invoice.pending = false;
    save(current, context);
  }

  function result(context, caption, message) {
    // A single shared dialog first closes the chooser, then opens the result.
    context.dialog.addEventListener("close", () => {
      context.openSheet(caption, `<p class="tuition-demo">가상 결제</p><p>${text(message)}</p>`, undefined, undefined, { closeOnly: true });
    }, { once: true });
  }

  function payment(invoice, opener, context, isOffline = false) {
    const choices = isOffline ? offline : online;
    const cases = [["success", "성공"], ["fail", "실패"], ["cancel", "사용자 취소"]];
    context.openSheet(isOffline ? "수동 수납 기록" : "가상 결제",
      `<p class="tuition-live-total">${isOffline ? "기록 금액" : "결제 금액"} <strong>${won(sum(invoice.lines))}</strong></p>` +
      choice("결제수단", "method", choices.map((id) => [id, methods[id]]), choices[0]) +
      (isOffline ? "" : choice("체험 결과", "case", cases, "success")) +
      '<p class="tuition-note">가상 수납만 처리해요. 카드번호나 실제 계좌번호는 입력하지 않아요.</p>',
    (form) => {
      const method = form.get("method"), outcome = form.get("case");
      const current = read();
      const latest = matching(current, context).find(({ id }) => id === invoice.id);
      if (!choices.includes(method) || !latest || latest.payment) return "수납 정보를 다시 확인해 주세요.";
      if (isOffline) return settle(current, latest, method, context);
      if (!cases.some(([id]) => id === outcome) || latest.pending) return "결제 상태를 다시 확인해 주세요.";
      if (outcome === "fail" || outcome === "cancel") {
        result(context, outcome === "fail" ? "가상 결제 실패" : "가상 결제 취소",
          outcome === "fail" ? "청구서는 납부 전 상태예요. 다시 결제할 수 있어요." : "청구서와 결제 금액은 그대로예요.");
        return;
      }
      if (method === "virtual") {
        latest.pending = true;
        save(current, context);
        result(context, "가상계좌 입금 대기", "청구서의 가상계좌 입금 체험 버튼으로 입금을 완료할 수 있어요.");
        return;
      }
      const error = settle(current, latest, method, context);
      if (!error) result(context, "가상 결제 완료", `${won(sum(latest.lines))} 납부를 기록했어요. 청구서에서 영수증을 볼 수 있어요.`);
      return error;
    }, opener, { confirmLabel: isOffline ? "수납 저장" : "선택한 결과 체험", successMessage: isOffline ? "가상 수납을 기록했어요." : false });
  }

  function refund(invoice, opener, context) {
    context.openSheet("가상 환불 계산",
      `<p>1개월 이내 과정의 교습시간을 기준으로 계산해요. 이 체험에서는 교습비 항목만 계산합니다.</p>
       <p class="tuition-note">개강 전 전액 · 1/3 이전 2/3 · 1/2 이전 1/2 · 1/2 이후 0원</p>` +
      choice("교습 상태", "before", [["after", "교습 시작 후"], ["before", "교습 시작 전"]], "after") +
      integerField("전체 교습시간", "total", 12, 999, 1) + integerField("경과 교습시간", "used", 2, 999) +
      '<p class="tuition-live-total">이번 환불액 <strong data-tuition-refund-amount></strong></p>',
    (form) => {
      const current = read();
      const latest = matching(current, context).find(({ id }) => id === invoice.id);
      const amount = latest && refundAmount(latest, form);
      if (!amount) return "환불할 교습비가 없거나 교습시간 값을 다시 확인해 주세요.";
      latest.refunds.push({ date, amount });
      save(current, context);
    }, opener, { confirmLabel: "확인하고 환불 기록" });
    const form = context.dialog.querySelector("form");
    const update = () => {
      const amount = refundAmount(invoice, new FormData(form));
      form.querySelector("[data-tuition-refund-amount]").textContent = amount === null ? "교습시간 확인" : won(amount);
    };
    form.addEventListener("input", update);
    update();
  }

  function refundAmount(invoice, form) {
    const before = form.get("before");
    const total = integer(form.get("total"), 1, 999);
    const used = integer(form.get("used"), 0, 999);
    if (!invoice.payment || !total || used === null || used > total || !["before", "after"].includes(before)) return null;
    const tuition = invoice.lines.find(({ type }) => type === "tuition")?.amount ?? 0;
    const discount = -Math.min(0, invoice.lines.find(({ type }) => type === "discount")?.amount ?? 0);
    const base = Math.min(Math.max(0, tuition - discount), amountPaid(invoice));
    return Math.max(0, refundable(base, before === "before" ? -1 : used, total) - amountRefunded(invoice));
  }

  function handle(button, context) {
    const { tuitionAction: command, tuitionId: identifier } = button.dataset;
    const isOwner = context.role === "owner";
    if (!isOwner && context.role !== "parent") return;
    const data = read();
    if (command === "create" && isOwner) return createInvoice(button, context);
    if (command === "settings" && isOwner) return settings(button, context);
    if (command === "connect" && isOwner) return connect(button, context);
    if (command === "list") {
      if (isOwner) selectedOwner = undefined;
      else selectedParent = undefined;
      return context.rerender();
    }
    const invoice = matching(data, context).find(({ id }) => id === identifier);
    if (!invoice) return;
    if (command === "details") {
      if (isOwner) selectedOwner = invoice.id;
      else selectedParent = invoice.id;
      return context.rerender();
    }
    if (command === "pay" && !isOwner && !invoice.payment && !invoice.pending) return payment(invoice, button, context);
    if (command === "offline" && isOwner && !invoice.payment) return payment(invoice, button, context, true);
    if (command === "refund" && isOwner && invoice.payment) return refund(invoice, button, context);
    if (command === "receipt" && invoice.payment) {
      return context.openSheet("가상 영수증", `<p class="tuition-note">${text(name(context, invoice))} · ${monthTitle(invoice.month)} · 체험용</p>${receiptItems(invoice)}`,
        undefined, button, { closeOnly: true });
    }
    if (command === "remind" && isOwner && !invoice.payment) {
      if (invoice.notes.at(-1) !== "학원비 납부 안내") invoice.notes.push("학원비 납부 안내");
      return save(data, context, "가상 앱 알림을 이 기기에 남겼어요.");
    }
    if (command === "deposit" && !isOwner && invoice.pending && !invoice.payment) {
      context.openSheet("가상계좌 입금 체험", `<p>가상 입금액 ${won(sum(invoice.lines))}</p><p class="tuition-note">실제 이체는 진행되지 않아요.</p>`,
        () => {
          const current = read();
          const latest = matching(current, context).find(({ id }) => id === invoice.id);
          if (!latest?.pending || latest.payment) return "이미 입금 처리를 끝냈어요.";
          const error = settle(current, latest, "virtual", context);
          if (!error) result(context, "가상 입금 완료", "입금으로 수납을 완료했어요. 영수증을 열어 확인할 수 있어요.");
          return error;
        }, button, { confirmLabel: "입금 처리 체험", successMessage: false });
    }
  }

  window.DemoTuition = Object.freeze({ render, notices, handle, reset, ownsStorage: (key) => key === storageKey });
})();
