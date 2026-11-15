/* Browser-only adapter for the synthetic demo. No push provider or API requests. */
(() => {
  "use strict";
  const root = new URL(".", document.currentScript.src);
  const notification = document.getElementById("demo-notification");
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
  const status = document.getElementById("offline-status");
  let prepared = false;
  function renderStatus() {
    status.textContent = prepared
      ? (navigator.onLine ? "오프라인 준비 완료" : "오프라인 · 저장된 데모로 체험 중")
      : "온라인 체험 가능 · 오프라인 저장 확인 중";
    status.dataset.ready = String(prepared);
  }
  window.addEventListener("online", renderStatus);
  window.addEventListener("offline", renderStatus);
  function workerStatus(worker) {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(false); }, 6000);
      channel.port1.onmessage = ({ data }) => {
        clearTimeout(timer); channel.port1.close(); resolve(data?.ready === true);
      };
      worker.postMessage({ type: "iphone-demo-cache-status" }, [channel.port2]);
    });
  }
  async function prepare() {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) throw new Error("Unavailable");
    const registration = await navigator.serviceWorker.register(new URL("demo-worker.js", root), { scope: root.pathname });
    const worker = registration.installing ?? registration.waiting ?? registration.active;
    if (!worker) throw new Error("No worker");
    if (worker.state !== "activated") await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { worker.removeEventListener("statechange", check); reject(new Error("Preparation timeout")); }, 20000);
      function check() {
        if (worker.state === "activated" || worker.state === "redundant") {
          clearTimeout(timeout); worker.removeEventListener("statechange", check);
          if (worker.state === "activated") resolve(); else reject(new Error("Install failed"));
        }
      }
      worker.addEventListener("statechange", check); check();
    });
    prepared = await workerStatus(worker);
    if (!prepared) throw new Error("Incomplete cache");
    renderStatus();
  }
  prepare().catch(() => {
    status.dataset.ready = "false";
    status.textContent = "오프라인 저장을 완료하지 못했어요. 인터넷 연결 후 다시 열어 주세요.";
  });
})();
