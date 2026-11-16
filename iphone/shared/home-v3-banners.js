/* Banner content and editing for the synthetic app. Images are stored only on this device. */
(() => {
  "use strict";
  const key = "gradient.demo.v3.banners";
  const today = "2026-11-16";
  const presets = ["차콜", "아몬드", "황토", "구리", "밤색", "그을음"];
  const audienceLabels = { all:"전체", student:"학생", parent:"학부모", class:"반" };
  const targetLabels = { notice:"공지", consultation:"상담 신청", schedule:"일정", external:"외부 링크" };
  const defaultBanners = [
    { id:"academy-exam", title:"중2 시험 대비 클리닉", subtitle:"11월 19일 목요일 · 강의실 A", label:"안내", preset:2,
      source:"color", target:"schedule", audience:"class", groups:["중2 심화반"], start:"2026-11-01", end:"2026-11-19" },
    { id:"new-semester", title:"11월 학습 상담", subtitle:"자녀의 진도를 함께 점검해요.", label:"모집 중", preset:4,
      source:"color", target:"consultation", audience:"parent", groups:[], start:"2026-11-01", end:"2026-11-30" },
    { id:"study-room", title:"토요 자습실 이용 안내", subtitle:"오후 1시부터 이용할 수 있어요.", label:"안내", preset:1,
      source:"color", target:"notice", audience:"all", groups:[], start:"2026-11-01", end:"2026-11-30" },
    { id:"expired", title:"기간이 지난 가상 배너", subtitle:"전시 종료", label:"이벤트", preset:3,
      source:"color", target:"notice", audience:"all", groups:[], start:"2026-11-01", end:"2026-11-05" },
  ];
  const e = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const imageCache = new Map();
  let localState;

  function state() {
    try { localState = JSON.parse(localStorage.getItem(key)) || localState; }
    catch { /* Keep the available in-memory state. */ }
    return localState ?? { teacherCanEdit:false, banners:defaultBanners };
  }
  function save(next) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { return "이 기기의 저장 공간이 부족해 배너를 저장하지 못했어요."; }
    localState = next;
    const images = new Set(next.banners.flatMap(banner => banner.image ? [banner.image] : []));
    for (const [image, url] of imageCache) if (!images.has(image)) {
      URL.revokeObjectURL(url);
      imageCache.delete(image);
    }
    return "";
  }
  function canManage(role, data = state()) {
    return role === "owner" || role === "teacher" && data.teacherCanEdit;
  }
  function validUrl(value) {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; }
    catch { return ""; }
  }
  function photoValue(image) {
    if (!image) return null;
    try { return { type:"image/jpeg", bytes:Uint8Array.from(atob(image), char => char.charCodeAt(0)).buffer }; }
    catch { return null; }
  }
  function blobUrl(image) {
    const previous = imageCache.get(image);
    if (previous) return previous;
    const photo = photoValue(image);
    if (!photo) return "";
    const url = URL.createObjectURL(new Blob([photo.bytes], { type:photo.type }));
    imageCache.set(image, url);
    return url;
  }
  const showing = banner => banner.start <= today && today <= banner.end;
  function visible(banner, role, options) {
    if (!showing(banner)) return false;
    if (role === "owner" || role === "teacher" || banner.audience === "all") return true;
    return banner.audience === "class" ? banner.groups.includes(options.selectedGroup) : role === banner.audience;
  }
  const editAttrs = 'data-v3-banner-action="manage"';
  const opener = label => `<button type="button" ${editAttrs}>${label}</button>`;

  function slide(banner, index, options) {
    const preview = banner.source === "image" && blobUrl(banner.image);
    const img = preview ? `<img class="demo-v3-banner-photo" src="${e(preview)}" alt="">` : "";
    const attrs = banner.target === "schedule" ? 'data-v3-home-action="calendar"'
      : banner.target === "consultation" && options.role === "parent" ? 'data-action="demo-consultation"'
      : banner.target === "external" && validUrl(banner.url) ? "" : `data-v3-banner-action="open" data-v3-id="${e(banner.id)}"`;
    const body = `${img}<span class="demo-v3-banner-copy">${banner.label ? `<small>${e(banner.label)}</small>` : ""}<strong>${e(banner.title)}</strong>
      <span>${e(banner.subtitle)}</span></span>`;
    return `<div class="demo-v3-slide demo-v3-banner-preset-${Number(banner.preset) || 0}" data-v3-slide hidden>
      ${banner.target === "external" && validUrl(banner.url)
        ? `<a href="${e(validUrl(banner.url))}" target="_blank" rel="noopener noreferrer" class="demo-v3-slide-target">${body}</a>`
        : `<button class="demo-v3-slide-target" type="button" ${attrs} aria-label="${e(banner.title)} 배너">${body}</button>`}
      </div>`;
  }

  function render(role, options) {
    const data = state();
    const profile = options.profile;
    const banners = data.banners.filter(banner => visible(banner, role, options));
    const cover = profile.cover ? `<img class="demo-v3-banner-photo" src="${e(profile.cover)}" alt="">` : "";
    const academy = `<div class="demo-v3-slide demo-v3-banner-academy${cover ? " has-cover" : ""}" data-v3-slide>
      <button class="demo-v3-slide-target" type="button" data-v3-home-action="academy" aria-label="학원 소개 배너">${cover}
        <span class="demo-v3-banner-copy"><small>학원 소개</small><strong>${e(profile.name)}</strong><span>${e(profile.intro)}</span></span></button></div>`;
    return `<div class="demo-v3-banner" data-v3-banner aria-label="학원 배너">
      ${academy}${banners.map((banner, index) => slide(banner, index + 1, { ...options, role })).join("")}
      ${canManage(role, data) ? `<span class="demo-v3-banner-editor">${opener("배너 편집")}</span>` : ""}
      <div class="demo-v3-banner-controls">
        ${banners.length ? '<button type="button" data-v3-banner-step="-1" aria-label="이전 배너">‹</button>' : ""}
        <span data-v3-banner-count>1 / ${banners.length + 1}</span>
        ${banners.length ? '<button type="button" data-v3-banner-step="1" aria-label="다음 배너">›</button>' : ""}
      </div>
    </div>`;
  }

  function enhance(root) {
    const viewport = root?.querySelector("[data-v3-banner]");
    if (!viewport) return undefined;
    const slides = [...viewport.querySelectorAll("[data-v3-slide]")];
    if (slides.length < 2) return undefined;
    const count = viewport.querySelector("[data-v3-banner-count]");
    let current = 0;
    let start;
    let timer;
    let blockClickUntil = 0;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
      viewport.dataset.autoPaused = "true";
    };
    const step = delta => {
      slides[current].hidden = true;
      current = (current + delta + slides.length) % slides.length;
      slides[current].hidden = false;
      count.textContent = `${current + 1} / ${slides.length}`;
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => { if (reduce.matches) stop(); };
    reduce.addEventListener("change", motionChange);
    if (reduce.matches) stop();
    else timer = setInterval(() => { if (!document.hidden && viewport.isConnected) step(1); }, 5000);
    viewport.addEventListener("pointerdown", event => { stop(); start = { x:event.clientX, y:event.clientY }; });
    viewport.addEventListener("focusin", stop);
    viewport.addEventListener("pointerup", event => {
      if (!start) return;
      const horizontal = event.clientX - start.x;
      if (Math.abs(horizontal) > 45 && Math.abs(horizontal) > Math.abs(event.clientY - start.y) * 1.2) {
        step(horizontal < 0 ? 1 : -1);
        blockClickUntil = performance.now() + 300;
      }
      start = undefined;
    });
    viewport.addEventListener("pointercancel", () => { start = undefined; });
    viewport.addEventListener("click", event => {
      if (performance.now() < blockClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const control = event.target.closest("[data-v3-banner-step]");
      if (control) { stop(); step(Number(control.dataset.v3BannerStep)); }
    }, true);
    return () => { stop(); reduce.removeEventListener("change", motionChange); };
  }

  function manage(context) {
    const data = state();
    if (!canManage(context.role, data)) return false;
    const list = data.banners.map(({ id, title, audience, start, end }, index) =>
      `<li><div><strong>${e(title)}</strong><small>${e(audienceLabels[audience])} · ${e(start)}–${e(end)}</small></div>
      <button type="button" class="secondary" data-v3-banner-action="edit" data-v3-id="${e(id)}">편집</button>
      <button type="button" class="text-button" data-v3-banner-action="up" data-v3-id="${e(id)}" aria-label="${e(title)} 위로"${index === 0 ? " disabled" : ""}>↑</button>
      <button type="button" class="text-button" data-v3-banner-action="down" data-v3-id="${e(id)}" aria-label="${e(title)} 아래로"${index === data.banners.length - 1 ? " disabled" : ""}>↓</button></li>`).join("");
    context.openDialog("배너 관리", `<p>학원 소개 배너 다음에 최대 5개까지 함께 게시할 수 있어요.</p>
      ${context.role === "owner" ? `<label class="demo-v3-banner-permission"><input type="checkbox" data-v3-banner-permission${data.teacherCanEdit ? " checked" : ""}>선생님 배너 편집 허용</label>` : ""}
      <ul class="demo-v3-banner-admin-list">${list}</ul>
      <button type="button" class="primary" data-v3-banner-action="new">배너 추가</button>`);
    return true;
  }

  function edit(context, id, control) {
    const data = state();
    if (!canManage(context.role, data)) return;
    const saved = id ? data.banners.find(item => item.id === id) : null;
    if (id && !saved) return;
    const current = saved ?? { title:"", subtitle:"", label:"안내", source:"color", preset:0, audience:"all", target:"notice", start:today, end:"2026-11-30", groups:[] };
    const knownGroups = [...new Set(context.options.calendar.students.map(student => student.group))];
    const choices = (entries, key) => Object.entries(entries).map(([value, label]) => `<option value="${e(value)}"${key === value ? " selected" : ""}>${e(label)}</option>`).join("");
    let crop;
    context.closeDialog();
    context.openSheet(saved ? "배너 편집" : "배너 추가", `<label>꼬리표<input name="label" maxlength="20" value="${e(current.label)}"></label>
      <label>제목<input name="title" maxlength="60" value="${e(current.title)}"></label>
      <label>부제목<input name="subtitle" maxlength="120" value="${e(current.subtitle)}"></label>
      <label>배경<select name="source"><option value="color"${current.source === "color" ? " selected" : ""}>그라데이션</option><option value="image"${current.source === "image" ? " selected" : ""}>이미지</option></select></label>
      <label data-v3-banner-colors>색상<select name="preset">${choices(presets, String(current.preset))}</select></label>
      <div data-v3-banner-photo>${context.cropFields(photoValue(current.image))}</div>
      <label>이동<select name="target">${choices(targetLabels, current.target)}</select></label>
      <label data-v3-banner-url>외부 링크 (https)<input name="url" type="url" placeholder="https://" value="${e(current.url)}"></label>
      <label>게시 시작<input name="start" type="date" value="${e(current.start)}"></label>
      <label>게시 끝<input name="end" type="date" value="${e(current.end)}"></label>
      <label>대상<select name="audience">${choices(audienceLabels, current.audience)}</select></label>
      <fieldset data-v3-banner-groups><legend>대상 반</legend>${knownGroups.map(group => `<label><input type="checkbox" name="groups" value="${e(group)}"${current.groups.includes(group) ? " checked" : ""}>${e(group)}</label>`).join("")}</fieldset>
      ${saved ? `<button type="button" class="text-button danger" data-v3-banner-action="remove" data-v3-id="${e(id)}">이 배너 삭제</button>` : ""}`,
    async payload => {
      const latest = state();
      if (!canManage(context.role, latest)) return "배너 수정 권한이 없어요.";
      const title = String(payload.get("title") ?? "").trim();
      const subtitle = String(payload.get("subtitle") ?? "").trim();
      const label = String(payload.get("label") ?? "").trim();
      const source = payload.get("source");
      const preset = Number(payload.get("preset"));
      const target = payload.get("target");
      const audience = payload.get("audience");
      const start = String(payload.get("start") ?? "");
      const end = String(payload.get("end") ?? "");
      const groups = audience === "class" ? payload.getAll("groups").filter(group => knownGroups.includes(group)) : [];
      const url = target === "external" ? validUrl(String(payload.get("url") ?? "")) : "";
      if (!title || title.length > 60 || subtitle.length > 120 || label.length > 20) return "제목을 입력하고 글자 수를 확인해 주세요.";
      if (!["color","image"].includes(source) || !presets[preset] || !Object.hasOwn(audienceLabels, audience) || !Object.hasOwn(targetLabels, target)) return "배경·이동·대상을 다시 선택해 주세요.";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) return "게시 기간을 확인해 주세요.";
      if (audience === "class" && groups.length === 0 || target === "external" && !url) return "대상 반이나 HTTPS 주소를 확인해 주세요.";
      const cropResult = source === "image" ? await crop?.() : null;
      if (cropResult?.error) return cropResult.error;
      let image = cropResult?.change === "remove" ? null : current.image;
      if (cropResult?.photo) {
        const bytes = new Uint8Array(cropResult.photo.bytes);
        image = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
      }
      if (source === "image" && !image) return "배너 사진을 선택해 주세요.";
      const banner = { id:saved?.id ?? `banner-${Date.now()}`, title, subtitle, label, source, preset, target, audience, start, end, groups, url,
        image:source === "image" ? image : null };
      const banners = saved ? latest.banners.map(item => item.id === saved.id ? banner : item) : [...latest.banners, banner];
      const at = new Map();
      for (const item of banners) {
        at.set(item.start, (at.get(item.start) ?? 0) + 1);
        const following = new Date(`${item.end}T00:00:00Z`);
        following.setUTCDate(following.getUTCDate() + 1);
        const next = following.toISOString().slice(0, 10);
        at.set(next, (at.get(next) ?? 0) - 1);
      }
      let concurrent = 0;
      for (const date of [...at.keys()].sort()) {
        concurrent += at.get(date);
        if (concurrent > 5) return "같은 날에는 추가 배너를 5개까지만 게시할 수 있어요.";
      }
      const error = save({ ...latest, banners });
      if (!error) context.rerender();
      return error;
    }, control);
    crop = context.setupCrop();
    const form = document.querySelector("#dialog form");
    const fields = () => {
      form.querySelector("[data-v3-banner-colors]").hidden = form.elements.source.value !== "color";
      form.querySelector("[data-v3-banner-photo]").hidden = form.elements.source.value !== "image";
      form.querySelector("[data-v3-banner-url]").hidden = form.elements.target.value !== "external";
      form.querySelector("[data-v3-banner-groups]").hidden = form.elements.audience.value !== "class";
    };
    form.addEventListener("change", fields);
    fields();
  }

  function handle(control, context) {
    const action = control.dataset.v3BannerAction;
    if (!action) return false;
    const id = control.dataset.v3Id;
    const data = state();
    if (action === "open") {
      const banner = data.banners.find(item => item.id === id);
      if (!banner || !visible(banner, context.role, context.options)) return true;
      if (banner.target === "notice" && context.options.notices[0]) context.openNotice(context.options.notices[0].id);
      else if (banner.target === "consultation") context.openDialog(banner.title, `<p>${e(banner.subtitle)}</p>`);
      return true;
    }
    if (!canManage(context.role, data)) return true;
    if (action === "manage") manage(context);
    else if (action === "edit" || action === "new") edit(context, id, control);
    else if (action === "remove") {
      context.closeDialog();
      context.openDialog("배너 삭제", "<p>이 기기에 저장된 배너를 지울까요?</p>", "삭제", () => {
        const latest = state();
        const error = !canManage(context.role, latest) ? "배너 수정 권한이 없어요."
          : save({ ...latest, banners:latest.banners.filter(item => item.id !== id) });
        if (!error) context.rerender();
        context.announce(error || "배너를 삭제했어요.");
      }, true);
    } else if (action === "up" || action === "down") {
      const list = [...data.banners];
      const index = list.findIndex(item => item.id === id);
      const swap = index + (action === "up" ? -1 : 1);
      if (index >= 0 && swap >= 0 && swap < list.length) {
        [list[index], list[swap]] = [list[swap], list[index]];
        const error = save({ ...data, banners:list });
        if (!error) {
          context.closeDialog();
          context.rerender();
          manage(context);
        }
        context.announce(error || "배너 순서를 저장했어요.");
      }
    }
    return true;
  }

  document.addEventListener("change", event => {
    if (!event.target.matches("[data-v3-banner-permission]") || document.body.dataset.appRole !== "owner") return;
    const error = save({ ...state(), teacherCanEdit:event.target.checked });
    if (error) {
      event.target.checked = !event.target.checked;
      event.target.insertAdjacentText("afterend", error);
    }
  });
  window.addEventListener("storage", (event) => { if (event.key === key && event.newValue === null) localState = undefined; });

  function reset() {
    save({ teacherCanEdit:false, banners:defaultBanners });
  }
  const activeCount = () => state().banners.filter(showing).length;
  window.DemoHomeBanners = Object.freeze({ render, enhance, handle, reset, canManage, activeCount });
})();
