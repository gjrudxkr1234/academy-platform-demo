/* Applied synchronously before styles paint. The preference belongs to this device. */
(() => {
  "use strict";
  if (!document.querySelector('meta[name="gradient-appearance"]')) return;
  const key = "gradient.appearance";
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const valid = (value) => value === "dark" || value === "light" || value === "system";
  let mode = "system";
  let nativePreference;
  try {
    nativePreference = window.AcademyDemo?.getAppearance?.();
  } catch { /* Use the device's saved web preference when the bridge is unavailable. */ }
  try {
    const current = localStorage.getItem(key);
    if (valid(current)) mode = current;
  } catch { /* The device can still follow its system preference. */ }
  if (valid(nativePreference)) mode = nativePreference;
  const apply = () => {
    const resolved = mode === "system" ? (system.matches ? "dark" : "light") : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.demoAppearance = "";
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", resolved);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#0B0B0C" : "#FFFFFF");
    try {
      window.AcademyDemo?.setAppearance?.(mode, resolved);
    } catch { /* Native chrome is independent of the web theme. */ }
    window.dispatchEvent(new CustomEvent("gradient:appearance-change", { detail: { mode, resolved } }));
  };
  window.GradientAppearance = Object.freeze({
    preference: () => mode,
    set(value) {
      if (!valid(value)) return;
      mode = value;
      try { localStorage.setItem(key, value); } catch { /* Current display remains usable. */ }
      apply();
    },
  });
  const followSystem = () => { if (mode === "system") apply(); };
  if (system.addEventListener) system.addEventListener("change", followSystem);
  else system.addListener?.(followSystem);
  window.addEventListener("storage", ({ key: changed, newValue }) => {
    if (changed === key) {
      mode = valid(newValue) ? newValue : "system";
      apply();
    }
  });
  apply();
})();
