/* Browser-only adapter for the synthetic demo. No push provider or API requests. */
(() => {
  "use strict";
  const root = new URL(".", document.currentScript.src);
  const notification = document.getElementById("demo-notification");
  if (notification) {
    window.AcademyDemo = Object.freeze({
      checkIn() { notification.hidden = false; },
      resetDemo() { notification.hidden = true; },
      printSlips() { window.print(); },
    });
    notification.addEventListener("click", () => {
      notification.hidden = true;
      window.academyDemoNavigate?.("notifications", window.ACADEMY_APP_ROLE);
    });
    const help = document.getElementById("iphone-help");
    document.getElementById("iphone-install").addEventListener("click", () => {
      if (document.getElementById("dialog").open) document.getElementById("dialog").close();
      if (!help.open) help.showModal();
    });
    document.getElementById("iphone-help-close").addEventListener("click", () => help.close());
  }
  const workers = navigator.serviceWorker;
  const pageVersion = document.querySelector('meta[name="iphone-demo-build"]')?.content;
  const status = document.getElementById("offline-status");
  const field = 'input:not([type="hidden"],[type="button"],[type="submit"],[readonly],[disabled],[data-v3-system]),textarea:not([readonly],[disabled]),select:not([disabled]),[contenteditable="true"]';
  const drafts = new Set();
  let releaseBanner;
  let observer;
  let prepared = false;
  let registration;
  let activeVersion;
  let lastCheck = -Infinity;
  let statusRequest = 0;
  let refreshing = false;
  let triedReload;
  const reloadKey = "gradient.iphone-demo.last-refresh";

  function rememberDraft(event) {
    if (event.target instanceof Element && event.target.matches(field)) drafts.add(event.target);
  }
  document.addEventListener("input", rememberDraft, true);
  document.addEventListener("change", rememberDraft, true);

  function isEditing() {
    for (const input of drafts) {
      if (!input.isConnected || input.closest("dialog:not([open])")) drafts.delete(input);
    }
    return drafts.size > 0 || document.activeElement?.matches(field) ||
      document.querySelector('dialog[open]:not(#demo-v3-drawer,#iphone-help), #content [data-action="apply-roster"]:not([disabled])');
  }

  function reloadId() {
    return `${pageVersion}:${activeVersion}`;
  }

  function reload(expectedUserAction) {
    if (refreshing) return;
    if (expectedUserAction && isEditing() && !window.confirm("작성 중인 내용을 저장했나요? 새로고침하면 저장하지 않은 내용은 사라져요.")) return;
    refreshing = true;
    triedReload = reloadId();
    try { sessionStorage.setItem(reloadKey, triedReload); } catch { /* Reload is still possible. */ }
    window.location.reload();
  }

  function showUpdate() {
    if (!releaseBanner) {
      releaseBanner = document.createElement("div");
      releaseBanner.className = "iphone-update";
      releaseBanner.setAttribute("role", "region");
      releaseBanner.setAttribute("aria-label", "데모 업데이트");
      const message = document.createElement("span");
      message.setAttribute("role", "status");
      message.textContent = "새 버전이 있어요";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "새로고침";
      button.addEventListener("click", () => reload(true));
      releaseBanner.append(message, button);
      observer = new MutationObserver(showUpdate);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open"] });
    }
    // The update button must stay inside the currently open modal's top layer.
    const dialogs = document.querySelectorAll("dialog[open]");
    const parent = dialogs[dialogs.length - 1] ?? document.body;
    if (releaseBanner.parentElement !== parent) parent.prepend(releaseBanner);
  }

  function applyUpdate() {
    if (!activeVersion || !pageVersion || document.hidden || refreshing) return;
    if (activeVersion === pageVersion) {
      observer?.disconnect();
      releaseBanner?.remove();
      releaseBanner = undefined;
      return;
    }
    let previous;
    try { previous = sessionStorage.getItem(reloadKey); } catch { /* Some devices disable storage. */ }
    if (releaseBanner || isEditing() || previous === reloadId() || triedReload === reloadId()) showUpdate();
    else reload(false);
  }

  function renderStatus() {
    if (!status) return;
    status.textContent = prepared
      ? (navigator.onLine ? "오프라인 준비 완료" : "오프라인 · 저장된 데모로 체험 중")
      : "온라인 체험 가능 · 오프라인 저장 확인 중";
    status.dataset.ready = String(prepared);
  }
  window.addEventListener("offline", renderStatus);
  function workerStatus(worker) {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      const finish = (data) => {
        clearTimeout(timer); channel.port1.close(); resolve(data);
      };
      const timer = setTimeout(() => finish(null), 6000);
      channel.port1.onmessage = ({ data }) => finish(data);
      try {
        worker.postMessage({ type: "iphone-demo-cache-status" }, [channel.port2]);
      } catch {
        channel.port2.close();
        finish(null);
      }
    });
  }
  async function readActiveWorker() {
    const request = ++statusRequest;
    const worker = workers.controller;
    if (!worker) return;
    const state = await workerStatus(worker);
    if (request !== statusRequest || worker !== workers.controller) return;
    prepared = state?.ready === true;
    activeVersion = prepared && state.refreshProtocol === 1 && /^[a-f0-9]{16}$/.test(state.version) ? state.version : undefined;
    renderStatus();
    applyUpdate();
  }
  function checkWorker() {
    if (!registration || document.hidden || !navigator.onLine || performance.now() - lastCheck < 15_000) return;
    lastCheck = performance.now();
    registration.update().catch(() => { /* Keep serving the installed build while offline. */ });
  }
  function resume() {
    renderStatus();
    if (document.hidden) return;
    applyUpdate();
    if (!refreshing) {
      void readActiveWorker();
      checkWorker();
    }
  }
  async function prepare() {
    if (!workers || !window.isSecureContext) throw new Error("Unavailable");
    workers.addEventListener("controllerchange", readActiveWorker);
    for (const event of ["focus", "online", "pageshow"]) window.addEventListener(event, resume);
    document.addEventListener("visibilitychange", resume);
    window.setInterval(checkWorker, 60_000);
    const installed = await workers.getRegistration(root);
    try {
      registration = await workers.register(new URL("demo-worker.js", root), { scope: root.pathname, updateViaCache: "none" });
    } catch (error) {
      if (!installed?.active) throw error;
      registration = installed;
    }
    await readActiveWorker();
  }
  prepare().catch(() => {
    if (!status) return;
    status.dataset.ready = "false";
    status.textContent = "오프라인 저장을 완료하지 못했어요. 인터넷 연결 후 다시 열어 주세요.";
  });
})();
