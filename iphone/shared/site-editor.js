"use strict";

window.AcademyDemoSite = (() => {
  const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
  const sectionLabels = { intro: "학원 소개", staff: "강사진", timetable: "수업 시간표", notices: "공지", hours: "운영시간", contact: "연락처" };
  const actor = { owner: "demo-owner", teacher: "demo-teacher" };
  const maxBytes = 300 * 1024;
  const failedSave = "저장하지 못했어요. 기존 값을 유지했습니다. 다시 시도해 주세요.";
  const escaped = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const asText = (form, key) => String(form.get(key) ?? "").trim();
  const field = (name, label, value, size, type = "text") =>
    `<label>${label}<input name="${name}" type="${type}" value="${escaped(value)}" maxlength="${size}"></label>`;
  const area = (name, label, value, size) =>
    `<label>${label}<textarea name="${name}" rows="3" maxlength="${size}">${escaped(value)}</textarea></label>`;
  const option = (value, label, selected) =>
    `<option value="${escaped(value)}"${value === selected ? " selected" : ""}>${escaped(label)}</option>`;
  const checked = (value) => value ? " checked" : "";
  const pencil = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m4 16 12-12 4 4L8 20H4zM14 6l4 4"/></svg>';
  const camera = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const album = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15" cy="8" r="1"/></svg>';
  const trash = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 6h16M7 6l1 15h8l1-15M9 6V3h6v3m-4 4v7m2-7v7"/></svg>';
  const illustrations = Object.fromEntries(["demo-owner", "demo-teacher", "demo-teacher-2"].map((account, index) => [
    account, new URL(`assets/brand/portrait-${index}.svg`, document.currentScript.src).href,
  ]));
  const demoCredentials = {
    "demo-owner": ["고등 수학 지도 10년", "수학교육 전공"],
    "demo-teacher": ["중등 수학·서술형 지도 7년", "수학교육 전공"],
    "demo-teacher-2": ["중등 수학 보충 수업 5년", "수학 전공"],
  };
  const timeFormat = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  const printableHours = (hours) => typeof hours === "string" ? hours : weekdays
    .filter((day) => hours[day])
    .map((day) => `${day} ${hours[day].start}–${hours[day].end}`).join(" · ");

  function weeklyHours(hours) {
    if (typeof hours !== "string") {
      return Object.fromEntries(weekdays.map((day) => [day, hours[day] ?? null]));
    }
    const entries = Object.fromEntries(weekdays.map((day) => [day, null]));
    for (const part of hours.split("·")) {
      const match = /^\s*(매일|평일|[월화수목금토일])(?:요일)?\s+(\d\d:\d\d)[–-](\d\d:\d\d)\s*$/.exec(part);
      if (!match) continue;
      const [, label, start, end] = match;
      const days = label === "매일" ? weekdays : label === "평일" ? weekdays.slice(0, 5) : [label];
      for (const day of days) entries[day] = { start, end };
    }
    return entries;
  }

  function initialSite(profile, staff, lessons, notices, legacy) {
    const accounts = staff.map(({ name, role }, index) => ({ id: ["demo-owner", "demo-teacher", "demo-teacher-2"][index] ?? `demo-teacher-${index}`, name, role }));
    const accountFor = (name) => accounts.find((account) => account.name === name)?.id ?? "";
    const byGroup = new Map();
    for (const lesson of lessons) {
      const [start, end] = lesson.time.split("–");
      if (!byGroup.has(lesson.group)) {
        byGroup.set(lesson.group, { id: `class-${byGroup.size}`, group: lesson.group, groupKey: lesson.group, grade: lesson.group.slice(0, 2),
          teacherId: accountFor(lesson.teacher), room: lesson.room, note: "", visible: true, slots: [] });
      }
      byGroup.get(lesson.group).slots.push({ id: lesson.id, day: lesson.day, start, end });
    }
    const savedCards = Array.isArray(legacy?.staff)
      ? [...legacy.staff, ...staff.slice(3).filter((member) => !legacy.staff.some((card) => card.name === member.name))]
      : staff;
    return {
      accounts,
      staff: savedCards.map((card, index) => ({ id: `staff-${index}`, account: accountFor(card.name), name: card.name,
        title: card.role === "원장" ? "원장" : "선생님", subject: card.subject, grade: "", detail: card.detail,
        credentials: demoCredentials[accountFor(card.name)] ?? [], visible: true, photo: null })),
      classes: [...byGroup.values()],
      sections: Object.keys(sectionLabels).map((id) => ({ id, visible: true })),
      intro: { short: legacy?.intro ?? profile.intro, long: "", tags: ["중등", "고등", "수학"], photo: null },
      hours: legacy?.hours ?? profile.hours,
      contact: { address: profile.address, phone: profile.phone, kakao: "", ...legacy?.contact },
      notices: legacy?.notices ?? notices,
      audit: [],
    };
  }

  // A single per-demo-origin IDB transaction stores the edit, crop bytes, and audit
  // together. Downloads, server calls, and cross-origin photos are unnecessary.
  function create({ profile, staff, lessons, notices, legacy, currentRole, openSheet, dialog, refresh, announce }) {
    let original = initialSite(profile, staff, lessons, notices, legacy);
    let state = original;
    let database;
    const urls = new Map();
    // A saved demo may predate the new instructor. Add only newly introduced
    // account fixtures. Existing edits, hidden cards and class schedules keep priority.
    function withNewFixtures(saved) {
      const newAccounts = original.accounts.filter(({ id }) => !saved.accounts.some((account) => account.id === id));
      if (!newAccounts.length) return saved;
      const addedIds = new Set(newAccounts.map(({ id }) => id));
      const newCards = original.staff.filter((card) => addedIds.has(card.account)
        && !saved.staff.some((current) => current.id === card.id || current.account === card.account || current.name === card.name));
      const classes = [...saved.classes];
      for (const proposed of original.classes.filter((item) => addedIds.has(item.teacherId))) {
        if (classes.some((current) => current.id === proposed.id || current.groupKey === proposed.groupKey
          || (current.room === proposed.room && current.slots.some((slot) => proposed.slots.some((next) =>
            next.day === slot.day && next.start < slot.end && slot.start < next.end))))) continue;
        classes.push(proposed);
      }
      return { ...saved, accounts:[...saved.accounts, ...newAccounts], staff:[...saved.staff, ...newCards], classes };
    }
    function useSnapshot(next) {
      if (!next || next === state) return;
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      state = withNewFixtures(next);
      refresh();
    }

    function openStorage() {
      database ??= new Promise((resolve, reject) => {
        let request;
        try { request = indexedDB.open("gradient-synthetic-homepage", 1); } catch (error) { reject(error); return; }
        request.onupgradeneeded = () => request.result.createObjectStore("snapshot");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }).catch((error) => { database = undefined; throw error; });
      return database;
    }

    async function readState() {
      const db = await openStorage();
      return new Promise((resolve, reject) => {
        const request = db.transaction("snapshot").objectStore("snapshot").get("demo");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("gradient-demo-homepage") : null;
    async function reload() {
      try { useSnapshot(await readState() ?? original); } catch { /* The default synthetic data remains visible. */ }
    }
    channel?.addEventListener("message", (event) => {
      if (event.data === "reset") original = initialSite(profile, staff, lessons, notices);
      void reload();
    });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) void reload(); });
    void reload();

    async function write(group, key, modify) {
      const role = currentRole();
      if (!(role in actor)) return "수정 권한이 없어요.";
      try {
        const db = await openStorage();
        const next = await new Promise((resolve, reject) => {
          const transaction = db.transaction("snapshot", "readwrite");
          const store = transaction.objectStore("snapshot");
          let result;
          transaction.oncomplete = () => resolve(result);
          transaction.onabort = transaction.onerror = () => reject(transaction.error);
          const request = store.get("demo");
          request.onsuccess = () => {
            try {
              const persisted = request.result ? withNewFixtures(request.result) : original;
              const change = modify(persisted, role);
              if (typeof change === "string") { result = change; return; }
              const summary = (value) => {
                if (value?.bytes instanceof ArrayBuffer) return { bytes: value.bytes.byteLength, type: value.type };
                if (Array.isArray(value)) return value.map(summary);
                if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([child, item]) => [child, summary(item)]));
                return value;
              };
              const visible = { ...persisted, [group]: change };
              result = { ...visible, audit: [...persisted.audit, { actor: actor[role], at: new Date().toISOString(), group, key,
                before: summary(persisted[group]), after: summary(change) }].slice(-100) };
              store.put(result, "demo");
            } catch {
              transaction.abort();
            }
          };
        });
        if (typeof next === "string") return next;
        useSnapshot(next);
        channel?.postMessage("saved");
        return "";
      } catch {
        return failedSave;
      }
    }

    async function reset() {
      try {
        const db = await openStorage();
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("snapshot", "readwrite");
          transaction.objectStore("snapshot").delete("demo");
          transaction.oncomplete = resolve;
          transaction.onabort = transaction.onerror = reject;
        });
        original = initialSite(profile, staff, lessons, notices);
        useSnapshot(original);
        channel?.postMessage("reset");
        return "";
      } catch { return failedSave; }
    }

    function photoUrl(photo) {
      if (!(photo?.bytes instanceof ArrayBuffer) || photo.type !== "image/jpeg") return "";
      if (!urls.has(photo)) urls.set(photo, URL.createObjectURL(new Blob([photo.bytes], { type: photo.type })));
      return urls.get(photo);
    }

    function presentStaff(card) {
      return {
        id: card.id, name: card.name, title: card.title, subject: card.subject, grade: card.grade,
        detail: card.detail, credentials: card.credentials, photoUrl: photoUrl(card.photo),
        illustrationUrl: card.illustration === false ? "" : illustrations[card.account] ?? "",
      };
    }

    function portrait(card) {
      const { photoUrl: photo, illustrationUrl } = presentStaff(card);
      const url = photo || illustrationUrl;
      return url ? `<img class="demo-site-photo" src="${escaped(url)}" alt="${escaped(card.name)} ${photo ? "강사 사진" : "일러스트"}" width="44" height="44">`
        : `<span class="demo-site-initial" aria-hidden="true">${escaped(Array.from(card.name)[0] || "·")}</span>`;
    }

    function visibleStaff() {
      return state.staff.filter(({ visible }) => visible).map(presentStaff);
    }

    function ownStaff() {
      const role = currentRole();
      const card = state.staff.find(({ account }) => account === actor[role]);
      return card ? presentStaff(card) : null;
    }

    function teacherName(id) {
      return state.staff.find((card) => card.account === id)?.name ?? state.accounts.find((account) => account.id === id)?.name ?? "";
    }

    function calendar(published = false) {
      return state.classes.filter((classroom) => !published || classroom.visible).flatMap((classroom) =>
        classroom.slots.map(({ id, day, start, end }) => ({
          id, day, dayNumber: 9 + weekdays.indexOf(day), group: classroom.group, groupKey: classroom.groupKey, shortName: classroom.shortName,
          time: `${start}–${end}`, teacher: teacherName(classroom.teacherId), teacherId: classroom.teacherId, room: classroom.room,
        })));
    }

    function permitted(group, record, role) {
      return role === "owner" || (role === "teacher" && record && (group === "staff" ? record.account : record.teacherId) === actor.teacher);
    }

    function action(label, name, id = "", extra = "") {
      return `<button class="demo-home-link" type="button" data-action="${name}" data-id="${escaped(id)}" ${extra}>${label === "편집" ? pencil : ""}${label}</button>`;
    }

    const chevronActions = (group, id, index, size) => [
      ["up", "위로", index === 0], ["down", "아래로", index === size - 1],
    ].map(([direction, label, disabled]) => action(label, "site-move", id,
      `data-group="${group}" data-direction="${direction}"${disabled ? " disabled" : ""}`)).join("");

    function sectionPicker() {
      return state.sections.map(({ id, visible }, index) => `<li><span>${sectionLabels[id]}</span><div class="demo-site-editor-actions">
        ${action(visible ? "숨기기" : "보이기", "site-toggle-section", id, `aria-label="${sectionLabels[id]} ${visible ? "숨기기" : "보이기"}"`)}
        ${chevronActions("sections", id, index, state.sections.length)}</div></li>`).join("");
    }

    function classRows() {
      return state.classes.map((record, index) => {
        const controls = currentRole() === "owner" ? chevronActions("classes", record.id, index, state.classes.length) : "";
        const edit = permitted("classes", record, currentRole())
          ? action("편집", "site-class-edit", record.id, `aria-label="${escaped(record.group)} 편집"`) : "";
        return `<li><div><strong>${escaped(record.group)}</strong><p>${escaped([record.grade, teacherName(record.teacherId), record.room].filter(Boolean).join(" · "))}</p>
          <p>${escaped(record.slots.map(({ day, start, end }) => `${day} ${start}–${end}`).join(" · "))}</p>
          ${!record.visible ? "<small>홈페이지 숨김</small>" : ""}</div><div class="demo-site-editor-actions">${edit}${controls}</div></li>`;
      }).join("");
    }

    function staffRows() {
      return state.staff.map((card, index) => {
        const controls = currentRole() === "owner" ? chevronActions("staff", card.id, index, state.staff.length) : "";
        const edit = permitted("staff", card, currentRole())
          ? action("편집", "site-staff-edit", card.id, `aria-label="${escaped(card.name)} 편집"`) : "";
        const photo = currentRole() === "owner"
          ? `<button class="demo-staff-photo-edit" type="button" data-action="site-staff-photo" data-id="${escaped(card.id)}" aria-label="${escaped(card.name)} 사진 바꾸기">${portrait(card)}</button>`
          : portrait(card);
        return `<li>${photo}<div><strong>${escaped(card.name)}</strong><p>${escaped([card.title, card.subject, card.grade].filter(Boolean).join(" · "))}</p>
          ${!card.visible ? "<small>홈페이지 숨김</small>" : ""}</div><div class="demo-site-editor-actions">${edit}${controls}</div></li>`;
      }).join("");
    }

    function timetableEditor() {
      return `<div class="ops-page" data-staff-screen="timetable"><header class="ops-heading">
        <button type="button" class="ops-back" data-action="navigate" data-id="operations" aria-label="뒤로 가기">‹</button><h1>수업 시간표</h1></header>
        <section class="demo-home-section" aria-labelledby="ops-timetable-classes"><header class="demo-home-section-heading demo-edit-heading">
          <h2 id="ops-timetable-classes">반·반복 수업</h2>${action("반 추가", "site-class-edit")}</header>
          <p class="demo-site-paragraph">강사 ${escaped(state.accounts.map(({ id }) => teacherName(id)).join(" · "))}</p>
          <ul class="demo-site-editor-list">${classRows()}</ul></section></div>`;
    }

    function editor(ui, name) {
      const role = currentRole();
      const owner = role === "owner";
      const section = (id, visible) => {
        const title = sectionLabels[id];
        const heading = `<header class="demo-home-section-heading demo-edit-heading"><h2 id="site-${id}">${title}${visible ? "" : ' <small>숨김</small>'}</h2>`;
        const isCollection = id === "staff" || id === "timetable";
        if (!owner && !isCollection) return "";
        const controls = !owner ? ""
          : isCollection ? action(id === "staff" ? "강사 추가" : "반 추가", id === "staff" ? "site-staff-edit" : "site-class-edit")
            : action("편집", "site-section", id, `aria-label="${title} 편집"`);
        const photo = photoUrl(state.intro.photo);
        const content = {
          intro: `${photo ? `<img class="demo-site-cover" src="${escaped(photo)}" alt="학원 대표 사진">` : ""}<p class="demo-site-paragraph">${escaped(state.intro.short || "수업 시간표와 학원 소식을 한곳에서 확인하세요.")}</p>
            ${state.intro.tags.length ? `<p class="demo-site-tags">${state.intro.tags.map((tag) => `<span>${escaped(tag)}</span>`).join("")}</p>` : ""}`,
          staff: `<ul class="demo-site-editor-list">${staffRows()}</ul>`,
          timetable: `<ul class="demo-site-editor-list">${classRows()}</ul>`,
          notices: `<ul class="demo-site-editor-list">${state.notices.map(({ title: heading, detail }) => `<li><div><strong>${escaped(heading)}</strong><p>${escaped(detail)}</p></div></li>`).join("")}</ul>`,
          hours: `<p class="demo-site-paragraph">${escaped(printableHours(state.hours) || "운영시간을 입력해 주세요.")}</p>`,
          contact: ui.contactList(state.contact),
        };
        return `<section class="demo-home-section" aria-labelledby="site-${id}">${heading}${controls}</header>${content[id]}</section>`;
      };
      return `<header class="demo-role-heading"><div><h1>홈페이지 편집</h1><p>${escaped(name)}</p></div></header>
        ${owner ? action("구역 표시·순서", "site-layout") : "<p class=\"note\">연결된 강사 카드와 담당 반을 수정할 수 있어요.</p>"}
        ${state.sections.map(({ id, visible }) => section(id, visible)).join("")}`;
    }

    function swapOrder(group, id, direction) {
      if (!["staff", "classes", "sections"].includes(group) || !["up", "down"].includes(direction)) return;
      return write(group, id, (latest, role) => {
        if (role !== "owner") return "수정 권한이 없어요.";
        const list = latest[group].slice();
        const index = list.findIndex((entry) => entry.id === id);
        const other = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || other < 0 || other >= list.length) return "이미 끝에 있어요.";
        [list[index], list[other]] = [list[other], list[index]];
        return list;
      });
    }

    function rowFieldset(entries, key, emptyLabel) {
      return `<div data-list="${key}">${entries.map((entry) => rowInput(key, entry, emptyLabel)).join("")}</div>
        <button type="button" class="secondary" data-site-add-row="${key}">${emptyLabel} 추가</button>`;
    }

    function rowInput(key, value, label) {
      return `<div class="demo-site-dynamic-row">${field(key, label, value, 120)}<button type="button" class="demo-home-link" data-site-remove-row aria-label="${label} 삭제">삭제</button></div>`;
    }

    function configureRows() {
      const form = dialog.querySelector("form");
      form.addEventListener("click", (event) => {
        const control = event.target.closest("button");
        if (!control) return;
        if ("siteRemoveRow" in control.dataset) {
          control.closest(".demo-site-dynamic-row").remove();
          return;
        }
        const key = control.dataset.siteAddRow;
        if (["tag", "credential"].includes(key)) {
          const list = form.querySelector(`[data-list="${key}"]`);
          list.insertAdjacentHTML("beforeend", rowInput(key, "", key === "tag" ? "태그" : "경력·학력"));
          list.lastElementChild.querySelector("input").focus();
        }
      });
    }

    function cropControls(existing, ratio = 1, label = "강사 사진") {
      const landscape = ratio > 1;
      return `<fieldset class="demo-site-crop"><legend>${escaped(label)}</legend>
        <div class="demo-site-files">
          <label>카메라 촬영<input type="file" accept="image/*" capture="environment" data-site-photo></label>
          <label>앨범에서 선택<input type="file" accept="image/*" data-site-photo></label>
        </div>
        <p class="note">사진은 이 기기에만 저장돼요.</p>
        <output data-site-photo-message role="status"></output>
        <div data-site-photo-preview${existing ? "" : " hidden"}>${existing ? `<img class="demo-crop-preview${landscape ? " is-landscape" : ""}" src="${escaped(photoUrl(existing))}" alt="현재 사진">` : ""}
          <canvas class="demo-crop-preview${landscape ? " is-landscape" : ""}" width="240" height="${Math.round(240 / ratio)}" aria-label="잘린 사진 미리보기" hidden></canvas></div>
        <div data-site-crop-controls hidden>${landscape ? "가로형" : "정사각형"} 자르기
          <label>확대<input type="range" min="100" max="300" value="100" data-site-crop="zoom"></label>
          <label>가로 위치<input type="range" min="0" max="100" value="50" data-site-crop="x"></label>
          <label>세로 위치<input type="range" min="0" max="100" value="50" data-site-crop="y"></label></div>
        <button class="secondary" type="button" data-site-remove-photo${existing ? "" : " hidden"}>사진 삭제</button>
      </fieldset>`;
    }

    function cropPicker(ratio = 1) {
      const fields = dialog.querySelector(".demo-site-crop");
      const preview = fields.querySelector("[data-site-photo-preview]");
      const canvas = fields.querySelector("canvas");
      const controls = fields.querySelector("[data-site-crop-controls]");
      const status = fields.querySelector("[data-site-photo-message]");
      const remove = fields.querySelector("[data-site-remove-photo]");
      const sliders = [...controls.querySelectorAll("input")];
      let bitmap;
      let change;
      let pending = false;
      let invalid = false;
      let ticket = 0;

      function draw(target) {
        const [zoom, x, y] = sliders.map((slider) => Number(slider.value) / 100);
        const width = Math.min(bitmap.width, bitmap.height * ratio) / zoom;
        const height = width / ratio;
        const context = target.getContext("2d", { alpha: false });
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, target.width, target.height);
        context.drawImage(bitmap, (bitmap.width - width) * x, (bitmap.height - height) * y, width, height, 0, 0, target.width, target.height);
      }

      for (const slider of sliders) slider.addEventListener("input", () => { if (bitmap) draw(canvas); });
      for (const input of fields.querySelectorAll("[data-site-photo]")) input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const attempt = ++ticket;
        pending = true;
        invalid = false;
        status.textContent = "사진을 준비하고 있어요.";
        try {
          if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) throw new Error("파일");
          const image = await createImageBitmap(file, { imageOrientation: "from-image" });
          if (attempt !== ticket) { image.close(); return; }
          if (image.width * image.height > 40_000_000) { image.close(); throw new Error("크기"); }
          bitmap?.close();
          bitmap = image;
          change = "replace";
          preview.querySelector("img")?.remove();
          preview.hidden = canvas.hidden = controls.hidden = remove.hidden = false;
          sliders.forEach((slider) => { slider.value = slider.defaultValue; });
          draw(canvas);
          status.textContent = "미리보기를 확인해 주세요.";
        } catch {
          if (attempt === ticket) {
            invalid = true;
            status.textContent = "사진을 열 수 없어요. 25MB 이하의 이미지 파일을 다시 선택해 주세요.";
          }
        } finally {
          if (attempt === ticket) pending = false;
          input.value = "";
        }
      });
      remove.addEventListener("click", () => {
        ticket++;
        bitmap?.close();
        bitmap = undefined;
        change = "remove";
        pending = invalid = false;
        preview.hidden = controls.hidden = remove.hidden = true;
        status.textContent = "저장하면 사진을 삭제합니다.";
      });
      dialog.addEventListener("close", () => { ticket++; bitmap?.close(); bitmap = undefined; }, { once: true });

      return async () => {
        if (pending || invalid) return { error: pending ? "사진 처리가 끝나면 저장해 주세요." : "사진을 다시 선택하거나 제거해 주세요." };
        if (!bitmap) return { change };
        const output = document.createElement("canvas");
        const width = Math.min(800, bitmap.width, Math.floor(bitmap.height * ratio));
        let size = Math.max(1, width);
        for (const quality of [0.9, 0.76, 0.6, 0.45, 0.38, 0.3]) {
          output.width = size;
          output.height = Math.max(1, Math.round(size / ratio));
          draw(output);
          const photo = await new Promise((resolve) => output.toBlob(resolve, "image/jpeg", quality));
          if (photo && photo.type === "image/jpeg" && photo.size <= maxBytes) {
            return { change, photo: { type: photo.type, bytes: await photo.arrayBuffer() } };
          }
          size = Math.max(1, Math.floor(size * 0.85));
        }
        return { error: "사진을 300KB 이하로 줄이지 못했어요. 다른 사진을 골라 주세요." };
      };
    }

    function staffPhotoControls(card) {
      const { photoUrl: photo, illustrationUrl } = presentStaff(card);
      const current = photo || illustrationUrl;
      return `<div class="demo-staff-avatar-control">
        <button class="demo-staff-avatar-trigger" type="button" data-site-photo-open>
          <span class="demo-staff-avatar">
            <span data-site-photo-initial${current ? " hidden" : ""} aria-hidden="true">${escaped(Array.from(card.name)[0] || "·")}</span>
            ${current ? `<img src="${escaped(current)}" alt="">` : ""}
            <canvas width="240" height="240" hidden></canvas>
            <span class="demo-staff-camera">${camera}</span>
          </span>
          <span>사진 바꾸기</span>
        </button>
        <output role="status" data-site-photo-message></output>
      </div>`;
    }

    async function loadPhoto(file) {
      if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.size > 25 * 1024 * 1024) throw new Error("파일");
      if (typeof createImageBitmap === "function") {
        try {
          return await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch { /* iOS file decoders can support more formats than createImageBitmap. */ }
      }
      const url = URL.createObjectURL(file);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        return image;
      } finally { URL.revokeObjectURL(url); }
    }

    function configureStaffPhoto() {
      const inputFields = `<input type="file" accept="image/*" capture="user" data-site-photo="camera" hidden>
        <input type="file" accept="image/*" data-site-photo="album" hidden>`;
      const source = document.createElement("dialog");
      source.id = "demo-photo-source";
      source.setAttribute("aria-label", "사진 바꾸기");
      source.innerHTML = `<div class="demo-photo-source-actions">
        <button type="button" data-site-pick="camera">${camera} 사진 찍기</button>
        <button type="button" data-site-pick="album">${album} 앨범에서 선택</button>
        <button type="button" data-site-remove-photo>${trash} 사진 삭제</button>
        <p data-site-photo-error role="alert" hidden></p>
      </div><button class="demo-photo-source-cancel" type="button" data-site-photo-close>취소</button>${inputFields}`;
      const crop = document.createElement("dialog");
      crop.id = "demo-photo-crop";
      crop.setAttribute("aria-labelledby", "demo-photo-crop-title");
      crop.innerHTML = `<header class="demo-photo-crop-header"><button type="button" data-site-photo-close>취소</button>
        <h2 id="demo-photo-crop-title">사진 자르기</h2><button type="button" data-site-crop-complete>완료</button></header>
        <div class="demo-photo-crop-body">
          <div class="demo-photo-crop-stage"><div class="demo-photo-frame" tabindex="0" role="group" aria-label="잘라낼 영역. 방향키로 이동">
            <canvas width="240" height="240"></canvas><span class="demo-photo-frame-corners" aria-hidden="true"></span>
          </div></div>
          <p class="demo-photo-crop-help">끌어서 위치를 맞추고, 두 손가락으로 확대해요</p>
          <label class="demo-photo-zoom"><span aria-hidden="true">−</span><input type="range" min="100" max="300" value="100" data-site-crop="zoom" aria-label="확대"><span aria-hidden="true">+</span></label>
          <div class="demo-photo-crop-actions"><button type="button" data-site-pick="album">${album} 다시 선택</button>
            <button type="button" data-site-pick="camera">${camera} 다시 찍기</button></div>
          <p data-site-photo-error role="alert" hidden></p>
        </div>${inputFields}`;
      document.body.append(source, crop);
      const trigger = dialog.querySelector("[data-site-photo-open]");
      const status = dialog.querySelector("[data-site-photo-message]");
      const preview = trigger.querySelector("canvas");
      const initials = trigger.querySelector("[data-site-photo-initial]");
      const originalPhoto = trigger.querySelector("img");
      const frame = crop.querySelector(".demo-photo-frame");
      const canvas = frame.querySelector("canvas");
      const range = crop.querySelector('[data-site-crop="zoom"]');
      const finish = crop.querySelector("[data-site-crop-complete]");
      const removal = source.querySelector("[data-site-remove-photo]");
      const pointers = new Map();
      let image;
      let photo;
      let change;
      let zoom = 1;
      let centerX = .5;
      let centerY = .5;
      let ticket = 0;

      const canRemove = () => change === "replace" || change !== "remove" && Boolean(originalPhoto);
      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
      function constrain() {
        const side = Math.min(image.width, image.height) / zoom;
        const horizontal = side / (2 * image.width);
        const vertical = side / (2 * image.height);
        centerX = clamp(centerX, horizontal, 1 - horizontal);
        centerY = clamp(centerY, vertical, 1 - vertical);
        return side;
      }
      function paint(target) {
        const side = constrain();
        const context = target.getContext("2d", { alpha: false });
        context.fillStyle = "white";
        context.fillRect(0, 0, target.width, target.height);
        context.drawImage(image, image.width * centerX - side / 2, image.height * centerY - side / 2, side, side, 0, 0, target.width, target.height);
      }
      function move(dx, dy) {
        const side = constrain();
        const width = frame.getBoundingClientRect().width;
        centerX -= (dx * side) / (width * image.width);
        centerY -= (dy * side) / (width * image.height);
        paint(canvas);
      }
      function setZoom(value, anchorX = .5, anchorY = .5) {
        const side = constrain();
        zoom = clamp(value, 1, 3);
        const delta = side - Math.min(image.width, image.height) / zoom;
        centerX += (anchorX - .5) * delta / image.width;
        centerY += (anchorY - .5) * delta / image.height;
        range.value = String(Math.round(100 * zoom));
        range.style.setProperty("--crop-progress", `${50 * (zoom - 1)}%`);
        paint(canvas);
      }
      function position(event) {
        return { x: event.clientX, y: event.clientY };
      }
      function geometry([a, b]) {
        return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y) } : a;
      }
      frame.addEventListener("pointerdown", (event) => {
        if (!image || pointers.size >= 2) return;
        frame.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, position(event));
      });
      frame.addEventListener("pointermove", (event) => {
        if (!image || !pointers.has(event.pointerId)) return;
        const before = geometry([...pointers.values()]);
        pointers.set(event.pointerId, position(event));
        const after = geometry([...pointers.values()]);
        if (before.distance > 0 && after.distance > 0) {
          const rect = frame.getBoundingClientRect();
          setZoom(zoom * after.distance / before.distance, (before.x - rect.left) / rect.width, (before.y - rect.top) / rect.height);
        }
        move(after.x - before.x, after.y - before.y);
      });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
        frame.addEventListener(name, ({ pointerId }) => pointers.delete(pointerId));
      }
      frame.addEventListener("keydown", (event) => {
        const steps = { ArrowLeft: [12, 0], ArrowRight: [-12, 0], ArrowUp: [0, 12], ArrowDown: [0, -12] };
        if (!image || !steps[event.key]) return;
        event.preventDefault();
        move(...steps[event.key]);
      });
      range.addEventListener("input", () => { if (image) setZoom(Number(range.value) / 100); });

      function showMessage(container, message) {
        const element = container.querySelector("[data-site-photo-error]");
        element.hidden = !message;
        element.textContent = message;
      }
      for (const panel of [source, crop]) {
        panel.querySelector("[data-site-photo-close]").addEventListener("click", () => panel.close());
        for (const choice of panel.querySelectorAll("[data-site-pick]")) choice.addEventListener("click", () => {
          panel.querySelector(`[data-site-photo="${choice.dataset.sitePick}"]`).click();
        });
        for (const input of panel.querySelectorAll("[data-site-photo]")) input.addEventListener("change", async () => {
          const file = input.files?.[0];
          if (!file) return;
          input.value = "";
          const attempt = ++ticket;
          finish.disabled = true;
          showMessage(panel, "사진을 준비하고 있어요.");
          try {
            const decoded = await loadPhoto(file);
            if (attempt !== ticket || !panel.open) { decoded.close?.(); return; }
            if (decoded.width * decoded.height > 40_000_000) { decoded.close?.(); throw new Error("크기"); }
            image?.close?.();
            image = decoded;
            zoom = 1;
            centerX = centerY = .5;
            range.value = "100";
            range.style.removeProperty("--crop-progress");
            paint(canvas);
            showMessage(panel, "");
            if (!crop.open) {
              // Opening the crop first keeps focus and cancellation inside the edit flow.
              crop.showModal();
              source.close();
            }
          } catch {
            if (attempt === ticket) showMessage(panel, "사진을 열 수 없어요. 25MB 이하의 이미지 파일을 다시 선택해 주세요.");
          } finally {
            if (attempt === ticket) finish.disabled = false;
          }
        });
      }
      source.addEventListener("close", () => { if (!crop.open) trigger.focus(); });
      crop.addEventListener("close", () => {
        ticket++;
        pointers.clear();
        image?.close?.();
        image = undefined;
        finish.disabled = false;
        trigger.focus();
      });
      removal.addEventListener("click", () => {
        photo = undefined;
        change = "remove";
        preview.hidden = true;
        if (originalPhoto) originalPhoto.hidden = true;
        initials.hidden = false;
        status.textContent = "저장하면 사진을 삭제해요.";
        source.close();
      });
      const openSource = () => {
        removal.hidden = !canRemove();
        showMessage(source, "");
        if (!source.open) source.showModal();
      };
      trigger.addEventListener("click", openSource);
      finish.addEventListener("click", async () => {
        if (!image) return;
        const attempt = ++ticket;
        finish.disabled = true;
        const output = document.createElement("canvas");
        try {
          let size = Math.max(1, Math.min(800, image.width, image.height));
          for (const quality of [.9, .76, .6, .45, .38, .3]) {
            output.width = output.height = size;
            paint(output);
            const blob = await new Promise((resolve) => output.toBlob(resolve, "image/jpeg", quality));
            if (attempt !== ticket) return;
            if (blob?.type === "image/jpeg" && blob.size <= maxBytes) {
              const bytes = await blob.arrayBuffer();
              if (attempt !== ticket) return;
              photo = { type: blob.type, bytes };
              change = "replace";
              preview.hidden = false;
              if (originalPhoto) originalPhoto.hidden = true;
              initials.hidden = true;
              const context = preview.getContext("2d");
              context.drawImage(output, 0, 0, preview.width, preview.height);
              status.textContent = "사진을 바꿨어요. 저장하면 강사 카드에 반영돼요.";
              crop.close();
              return;
            }
            size = Math.max(1, Math.floor(size * .85));
          }
          showMessage(crop, "사진을 300KB 이하로 줄이지 못했어요. 다른 사진을 골라 주세요.");
        } catch {
          if (attempt === ticket) showMessage(crop, "사진을 준비하지 못했어요. 다시 시도해 주세요.");
        } finally { finish.disabled = false; }
      });
      dialog.addEventListener("close", () => {
        ticket++;
        image?.close?.();
        image = undefined;
        source.remove();
        crop.remove();
      }, { once: true });
      return { pendingPhoto: () => ({ change, photo }), openSource };
    }

    function startStaff(id, opener, photoOnly = false) {
      const current = state.staff.find((entry) => entry.id === id);
      const role = currentRole();
      if (!permitted("staff", current, role) || (!current && id)) return;
      const card = current ?? { id: crypto.randomUUID(), account: "", name: "", title: "선생님", subject: "", grade: "", detail: "", credentials: [], visible: true, photo: null };
      const custom = !["원장", "선생님"].includes(card.title) ? card.title : "";
      let pendingPhoto;
      const title = current ? role === "teacher" ? "내 강사 카드" : `${card.name} 강사 편집` : "강사 추가";
      openSheet(title, staffPhotoControls(card)
        + (role === "owner" ? `<label class="demo-site-check"><input type="checkbox" name="photo-consent">다른 사람의 사진은 본인 동의를 받았어요.</label>` : "")
        + field("name", "이름", card.name, 50)
        + field("subject", "담당 과목", card.subject, 50)
        + `<label>직함<select name="title">${["원장", "선생님", "직접 입력"].map((title) => option(title, title, custom ? "직접 입력" : card.title)).join("")}</select></label>`
        + `<div data-site-custom-title${custom ? "" : " hidden"}>${field("custom-title", "직함 직접 입력", custom, 40)}</div>`
        + field("grade", "담당 학년", card.grade, 50)
        + field("detail", "한 줄 소개", card.detail, 160)
        + `<fieldset><legend>경력·학력</legend>${rowFieldset(card.credentials, "credential", "경력·학력")}</fieldset>`
        + (role === "owner" ? `<label>연결된 선생님 계정<select name="account">${option("", "연결 안 함", card.account)}
          ${state.accounts.map((account) => option(account.id, `${account.name} · ${account.role}`, card.account)).join("")}</select></label>` : "")
        + `<label class="demo-site-check"><input type="checkbox" name="visible"${checked(card.visible)}>홈페이지에 보이기</label>`
        + (role === "owner" && current ? action("강사 삭제", "site-delete", card.id, 'data-group="staff"') : ""),
      async (form) => {
        const title = asText(form, "title") === "직접 입력" ? asText(form, "custom-title") : asText(form, "title");
        const changes = { name: asText(form, "name"), title, subject: asText(form, "subject"), grade: asText(form, "grade"),
          detail: asText(form, "detail"), credentials: form.getAll("credential").map((row) => String(row).trim()).filter(Boolean), visible: form.has("visible") };
        if (!changes.name || !title) return "이름과 직함을 입력해 주세요.";
        if (changes.name.length > 50 || title.length > 40 || changes.subject.length > 50 || changes.grade.length > 50
          || changes.detail.length > 160 || changes.credentials.some((entry) => entry.length > 120)) return "입력 길이를 확인해 주세요.";
        const cropped = await pendingPhoto();
        if (cropped.error) return cropped.error;
        return write("staff", card.id, (latest, savingRole) => {
          const live = latest.staff.find((entry) => entry.id === card.id);
          if (!permitted("staff", live, savingRole) || (current && !live)) return "수정 권한이 없거나 삭제된 강사예요.";
          const account = savingRole === "owner" ? asText(form, "account") : live.account;
          if (account && (!latest.accounts.some((item) => item.id === account)
            || latest.staff.some((item) => item.id !== card.id && item.account === account))) return "이미 다른 카드에 연결된 계정이에요.";
          if (cropped.change === "replace" && account !== actor[savingRole] && !form.has("photo-consent")) return "사진 속 본인의 동의를 확인해 주세요.";
          const next = { ...live, ...changes, id: card.id, account,
            illustration: cropped.change ? false : live?.illustration,
            photo: cropped.change === "replace" ? cropped.photo : cropped.change === "remove" ? null : live?.photo ?? null };
          return live ? latest.staff.map((entry) => entry.id === card.id ? next : entry) : [...latest.staff, next];
        });
      }, opener);
      const picker = configureStaffPhoto();
      pendingPhoto = picker.pendingPhoto;
      configureRows();
      const titleInput = dialog.querySelector('select[name="title"]');
      const customTitle = dialog.querySelector("[data-site-custom-title]");
      titleInput.addEventListener("change", () => { customTitle.hidden = titleInput.value !== "직접 입력"; });
      if (photoOnly) picker.openSource();
    }

    function startClass(id, opener) {
      const current = state.classes.find((entry) => entry.id === id);
      const role = currentRole();
      if (!permitted("classes", current, role) || (!current && id)) return;
      const classId = current?.id ?? crypto.randomUUID();
      const record = current ?? { group: "", grade: "", teacherId: "demo-teacher", room: "", note: "", visible: true, slots: [] };
      const days = weekdays.map((day, index) => {
        const slot = record.slots.find((item) => item.day === day);
        return `<div class="demo-site-day" data-site-day><label class="demo-site-check"><input type="checkbox" name="day-${index}"${checked(Boolean(slot))}>${day}요일</label>
          <div class="demo-site-time"${slot ? "" : " hidden"}>${field(`start-${index}`, `${day}요일 시작`, slot?.start ?? "16:00", 5, "time")}
          ${field(`end-${index}`, `${day}요일 끝`, slot?.end ?? "17:30", 5, "time")}</div></div>`;
      }).join("");
      openSheet(current ? `${record.group} 반 편집` : "반 추가", field("group", "반 이름", record.group, 50)
        + field("short-name", "반 짧은 이름 (최대 4자)", record.shortName, 4)
        + field("grade", "대상 학년", record.grade, 50)
        + `<fieldset><legend>요일·시간</legend>${days}</fieldset>`
        + (role === "owner" ? `<label>담당 선생님<select name="teacher">
          ${state.accounts.map((account) => option(account.id, account.name, record.teacherId)).join("")}</select></label>` : "")
        + field("room", "강의실", record.room, 50) + area("note", "메모", record.note, 400)
        + (role === "owner" ? `<label class="demo-site-check"><input type="checkbox" name="visible"${checked(record.visible)}>홈페이지에 보이기</label>`
          + (current ? action("반 삭제", "site-delete", record.id, 'data-group="classes"') : "") : ""),
      (form) => {
        const changes = { group: asText(form, "group"), shortName: asText(form, "short-name").replace(/\s/g,""), grade: asText(form, "grade"), room: asText(form, "room"), note: asText(form, "note") };
        if (!changes.group || !changes.grade || changes.group.length > 50 || changes.grade.length > 50
          || Array.from(changes.shortName).length > 4 || changes.room.length > 50 || changes.note.length > 400) return "반 이름과 대상 학년 및 입력 길이를 확인해 주세요.";
        const draftedSlots = weekdays.flatMap((day, index) => form.has(`day-${index}`) ? [{ day, start: asText(form, `start-${index}`), end: asText(form, `end-${index}`) }] : []);
        if (!draftedSlots.length || draftedSlots.some(({ start, end }) => !timeFormat.test(start) || !timeFormat.test(end) || start >= end))
          return "요일을 고르고 시작보다 늦은 종료 시간을 입력해 주세요.";
        return write("classes", classId, (latest, savingRole) => {
          const live = latest.classes.find((entry) => entry.id === classId);
          if (!permitted("classes", live, savingRole) || (current && !live)) return "수정 권한이 없거나 삭제된 반이에요.";
          const teacherId = savingRole === "owner" ? asText(form, "teacher") : live.teacherId;
          if (!latest.accounts.some(({ id: accountId }) => accountId === teacherId)) return "담당 선생님을 선택해 주세요.";
          const roomKey = changes.room.normalize("NFKC").toLocaleLowerCase("ko");
          for (const other of latest.classes) {
            if (other.id === classId) continue;
            const sameTeacher = other.teacherId === teacherId;
            const sameRoom = roomKey && other.room.normalize("NFKC").toLocaleLowerCase("ko") === roomKey;
            if ((sameTeacher || sameRoom) && other.slots.some((slot) => draftedSlots.some((draft) => draft.day === slot.day && draft.start < slot.end && slot.start < draft.end)))
              return `겹치는 수업이 있어요. ${other.group}의 ${sameTeacher ? "담당 선생님" : "강의실"}과 시간이 겹칩니다.`;
          }
          const slots = draftedSlots.map((slot) => ({ ...slot, id: live?.slots.find(({ day }) => day === slot.day)?.id ?? `${classId}-${slot.day}` }));
          const next = { ...live, ...changes, id: classId, slots, teacherId, visible: savingRole === "owner" ? form.has("visible") : live.visible,
            groupKey: live?.groupKey ?? changes.group };
          return live ? latest.classes.map((entry) => entry.id === classId ? next : entry) : [...latest.classes, next];
        });
      }, opener);
      for (const day of dialog.querySelectorAll("[data-site-day]")) {
        const input = day.querySelector('input[type="checkbox"]');
        input.addEventListener("change", () => { day.querySelector(".demo-site-time").hidden = !input.checked; });
      }
    }

    function setSection(id, value) {
      return write(id, id, (_latest, role) => role === "owner" ? value : "수정 권한이 없어요.");
    }

    function startSection(id, opener) {
      if (currentRole() !== "owner" || !sectionLabels[id]) return;
      if (id === "intro") {
        const intro = state.intro;
        let pendingPhoto;
        openSheet("학원 소개", cropControls(intro.photo, 16 / 9, "대표 사진")
          + `<label class="demo-site-check"><input type="checkbox" name="photo-consent">대표 사진 사용 동의를 받았어요.</label>`
          + field("short", "한 줄 소개", intro.short, 160) + area("long", "긴 소개", intro.long, 1200)
          + `<fieldset><legend>대상 학년·과목 태그</legend>${rowFieldset(intro.tags, "tag", "태그")}</fieldset>`, async (form) => {
          const short = asText(form, "short"), long = asText(form, "long");
          const tags = form.getAll("tag").map((tag) => String(tag).trim()).filter(Boolean);
          if (short.length > 160 || long.length > 1200 || tags.some((tag) => tag.length > 120)) return "입력 길이를 확인해 주세요.";
          const crop = await pendingPhoto();
          if (crop.error) return crop.error;
          if (crop.change === "replace" && !form.has("photo-consent")) return "대표 사진 사용 동의를 확인해 주세요.";
          return write("intro", "intro", (latest, role) => role === "owner" ? { short, long, tags,
            photo: crop.change === "replace" ? crop.photo : crop.change === "remove" ? null : latest.intro.photo } : "수정 권한이 없어요.");
        }, opener);
        pendingPhoto = cropPicker(16 / 9);
        configureRows();
      } else if (id === "hours") {
        const operatingHours = weeklyHours(state.hours);
        const fields = weekdays.map((day, index) => {
          const current = operatingHours[day];
          return `<fieldset><legend>${day}요일</legend><div class="demo-site-time">${field(`start-${index}`, "시작", current?.start, 5, "time")}
            ${field(`end-${index}`, "종료", current?.end, 5, "time")}</div></fieldset>`;
        }).join("");
        openSheet("운영시간", `<p class="note">쉬는 요일은 시작과 종료를 비워 두세요.</p>${fields}`, (form) => {
          const hours = {};
          for (const [index, day] of weekdays.entries()) {
            const start = asText(form, `start-${index}`), end = asText(form, `end-${index}`);
            if (!start && !end) continue;
            if (!timeFormat.test(start) || !timeFormat.test(end) || start >= end) return `${day}요일 운영시간을 확인해 주세요.`;
            hours[day] = { start, end };
          }
          return setSection("hours", hours);
        }, opener);
      } else if (id === "contact") {
        const { address, phone, kakao } = state.contact;
        openSheet("연락처", field("address", "주소", address, 150) + field("phone", "전화", phone, 25)
          + field("kakao", "카카오 채널 링크", kakao, 200, "url"), (form) => {
          const next = { address: asText(form, "address"), phone: asText(form, "phone"), kakao: asText(form, "kakao") };
          if (next.address.length > 150 || next.phone && !/^[0-9() +\-]{6,25}$/.test(next.phone)
            || next.kakao && (next.kakao.length > 200 || !/^https:\/\/pf\.kakao\.com\/[A-Za-z0-9_\/-]+$/.test(next.kakao))) return "주소, 전화번호와 카카오 채널 링크를 확인해 주세요.";
          return setSection("contact", next);
        }, opener);
      } else if (id === "notices") {
        const rows = [...state.notices, {}];
        openSheet("공지", rows.map((row, index) => `<fieldset><legend>${row.id ? `공지 ${index + 1}` : "새 공지"}</legend>
          ${field(`title-${index}`, "제목", row.title, 50)}${area(`detail-${index}`, "내용", row.detail, 160)}</fieldset>`).join(""), (form) => {
          const next = [];
          for (const [index, row] of rows.entries()) {
            const title = asText(form, `title-${index}`), detail = asText(form, `detail-${index}`);
            if (title.length > 50 || detail.length > 160) return "제목과 내용의 길이를 확인해 주세요.";
            if (title) next.push({ ...row, title, detail, id: row.id ?? crypto.randomUUID(), date: row.date ?? "11월 16일" });
          }
          return setSection("notices", next);
        }, opener);
      }
    }

    function renderLayout() {
      const list = dialog.querySelector(".demo-site-layout");
      if (list) list.innerHTML = sectionPicker();
    }

    function staffDetail(card) {
      return `<div class="demo-staff-detail">${portrait(card)}<div>
        <p><strong>${escaped([card.name, card.title].filter(Boolean).join(" "))}</strong></p>
        <p>${escaped([card.subject, card.grade].filter(Boolean).join(" · "))}</p>
        ${card.detail ? `<p>${escaped(card.detail)}</p>` : ""}
        ${card.credentials.length ? `<h3>경력·학력</h3><ul>${card.credentials.map((entry) => `<li>${escaped(entry)}</li>`).join("")}</ul>` : ""}
      </div></div>`;
    }

    async function handle(control) {
      const { action: command, id, group, direction } = control.dataset;
      if (command === "site-staff-edit") startStaff(id, control);
      else if (command === "site-staff-photo" && currentRole() === "owner") startStaff(id, control, true);
      else if (command === "site-own-card" && currentRole() === "teacher") {
        const own = ownStaff();
        if (own) startStaff(own.id, control);
      } else if (["site-staff-detail", "site-staff-all"].includes(command) && state.sections.some((section) => section.id === "staff" && section.visible)) {
        const published = state.staff.filter(({ visible }) => visible);
        const cards = command === "site-staff-all" ? published : published.filter((card) => card.id === id);
        if (cards.length) openSheet(command === "site-staff-all" ? "강사진" : `${cards[0].name} 선생님 소개`, cards.map(staffDetail).join(""), () => "", control, { closeOnly: true });
      }
      else if (command === "site-class-edit") startClass(id, control);
      else if (command === "site-section") startSection(id, control);
      else if (command === "site-layout" && currentRole() === "owner") {
        openSheet("홈페이지 구역 표시·순서", '<ul class="demo-site-editor-list demo-site-layout"></ul>', () => "", control, { closeOnly: true });
        renderLayout();
      } else if (command === "site-delete" && currentRole() === "owner" && ["staff", "classes"].includes(group)) {
        dialog.close();
        setTimeout(() => openSheet(group === "staff" ? "강사 삭제" : "반 삭제",
          `<p>${group === "staff" ? "이 카드와 사진을 기기에서 삭제합니다." : "이 반과 예정된 수업을 데모 시간표에서 삭제합니다."}</p>`,
          () => write(group, id, (latest, role) => role === "owner" ? latest[group].filter((entry) => entry.id !== id) : "수정 권한이 없어요."),
          undefined, { confirmLabel: "삭제" }), 0);
      } else if (currentRole() === "owner" && ["site-move", "site-toggle-section"].includes(command)) {
        control.disabled = true;
        const error = command === "site-move" ? await swapOrder(group, id, direction)
          : await write("sections", id, (latest, role) => role !== "owner" ? "수정 권한이 없어요." : latest.sections.map((entry) =>
            entry.id === id ? { ...entry, visible: !entry.visible } : entry));
        control.disabled = false;
        if (!error) renderLayout();
        announce(error || "저장했어요");
      }
    }

    function prependNotice(entry) {
      return write("notices", "notices", (latest, role) => role === "owner" ? [entry, ...latest.notices] : "수정 권한이 없어요.");
    }

    function homepage() {
      return { ...state.contact, hours: printableHours(state.hours), weeklyHours: weeklyHours(state.hours), intro: state.intro.short,
        longIntro: state.intro.long, tags: state.intro.tags, cover: photoUrl(state.intro.photo), sections: state.sections.filter(({ visible }) => visible).map(({ id }) => id) };
    }

    return Object.freeze({ calendar, teacherName, visibleStaff, ownStaff, homepage, notices: () => state.notices, editor, timetableEditor, lastChange: () => state.audit?.at(-1)?.at, startSection, handle, reset, prependNotice,
      bannerCropFields: photo => cropControls(photo, 2, "배너 사진 · 2:1 자르기"), bannerCropPicker: () => cropPicker(2) });
  }

  return Object.freeze({ create });
})();
