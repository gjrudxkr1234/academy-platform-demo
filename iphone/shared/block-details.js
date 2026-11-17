/* Full-page learning for the synthetic role demos. Browser data stays on device. */
(() => {
  "use strict";

  const titles = { assignment: "과제 제출", video: "학습 영상", review: "과제 검토" };
  const videos = {
    "linear-video": { title: "일차함수의 그래프 풀이", duration: 720, assignment: "linear-practice",
      parts: [[0, "기울기 복습"], [190, "y절편 찾기"], [288, "그래프 그리기"], [510, "실전 문제 풀이"]] },
    "slope-video": { title: "기울기와 y절편", duration: 540, assignment: "graph-review",
      parts: [[0, "기울기 복습"], [130, "y절편 찾기"], [310, "연습 문제 풀이"]] },
  };
  const worksheet = {
    "linear-practice": ["교재 84쪽", "8–12번 · 5문제"],
    "graph-review": ["교재 85쪽", "1–3번 · 3문제"],
  };
  const paths = {
    back: '<path d="m15 5-7 7 7 7"/>',
    next: '<path d="m9 5 7 7-7 7"/>',
    book: '<path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1zM12 6v14"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="m8 7 1-3h6l1 3"/><circle cx="12" cy="13.5" r="3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m4 17 5-5 4 4 3-3 4 4"/><circle cx="16" cy="8" r="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    fullscreen: '<path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/>',
  };
  const screenKeys = ["screen", "id", "task", "from"];
  const storageLimit = 20 * 1024 * 1024;
  const maximumPhotos = 5;
  const photoTypes = /^image\/(?:jpeg|png|webp|gif|avif|heic|heif)$/i;
  const photoExtensions = /\.(?:jpe?g|png|webp|gif|avif|heic|heif)$/i;
  const icon = name => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  const text = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const time = seconds => Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
  const action = (label, name, classes = "", extra = "") =>
    '<button type="button" data-block-action="' + name + '" class="' + classes + '" ' + extra + '>' + label + '</button>';
  const badge = (label, tone = "") => '<span class="block-detail-badge ' + tone + '">' + label + '</span>';
  const listScores = ["일차함수 풀이", "좌표와 그래프"];
  const makeRange = (task, range) => '<div class="block-detail-row">' + icon("book") + '<span><strong>' + text(task) + '</strong><small>' + text(range) + '</small></span></div>';

  function baseUrl() {
    const url = new URL(location.href);
    if (Object.hasOwn(titles, url.searchParams.get("screen"))) {
      for (const key of screenKeys) url.searchParams.delete(key);
    }
    return url;
  }

  function detailUrl(route) {
    const url = baseUrl();
    url.searchParams.set("screen", route.screen);
    url.searchParams.set("id", route.id);
    url.searchParams.set("from", route.from);
    if (route.task) url.searchParams.set("task", route.task);
    return url;
  }

  function makeMedia() {
    return { position: 0, ranges: [], speed: 1, playing: false, timer: null, lastSave: 0 };
  }

  function create(ctx) {
    let route;
    let journey;
    let initialized = false;
    let draft = { photos: [], note: "", error: "", editing: false };
    let review = { page: 0, zoom: 1, note: "", message: "" };
    let media = makeMedia();
    let nextKey = 0;
    const landscape = window.matchMedia("(orientation: landscape)");
    let manualFullscreen = false;
    let landscapeDismissed = false;

    const enabled = () => ctx.enabled() && ["student", "teacher"].includes(ctx.role());
    const originalScreen = value => ctx.validScreen(value) && value !== "video" ? value : "learning";
    const taskFor = id => ctx.tasks.find(task => task.id === id);
    const state = () => ctx.state();
    const collection = task => task === ctx.tasks[0].id ? state().submissions : state().reviewSubmissions;
    const clearPhotos = () => {
      for (const photo of draft.photos) URL.revokeObjectURL(photo.url);
      draft = { photos: [], note: "", error: "", editing: false };
      window.removeEventListener("beforeunload", beforeUnload);
    };

    function beforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    function normalize(screen, id, from, task) {
      if (!enabled()) return null;
      const origin = originalScreen(from);
      if (ctx.role() === "student" && screen === "assignment" && taskFor(id)) return { screen, id, from: origin };
      if (ctx.role() === "student" && screen === "video" && Object.hasOwn(videos, id)) return { screen, id, from: origin };
      if (ctx.role() === "teacher" && screen === "review") {
        const lesson = taskFor(task)?.id ?? ctx.tasks[0].id;
        if (ctx.visibleStudents().some(student => student.id === id) && collection(lesson)[id]) {
          return { screen, id, from: origin, task: lesson };
        }
      }
      return null;
    }

    function readRoute() {
      const values = new URLSearchParams(location.search);
      return normalize(values.get("screen"), values.get("id"), values.get("from"), values.get("task"));
    }

    function restoreMedia(id) {
      const asset = videos[id];
      const saved = state().blockVideo?.[id];
      const fallback = id === "linear-video" ? Number(state().progress.jiwoo || 0) * asset.duration / 100 : asset.duration;
      const valid = value => Math.max(0, Math.min(asset.duration, Number(value) || 0));
      media = { ...makeMedia(), position: valid(saved?.position ?? fallback) };
      const savedRanges = Array.isArray(saved?.ranges) ? saved.ranges : [[0, saved?.watched ?? fallback]];
      for (const range of savedRanges) {
        if (Array.isArray(range)) markWatched(valid(range[0]), valid(range[1]));
      }
    }

    function markWatched(from, until) {
      if (from >= until) return;
      const ordered = [...media.ranges, [from, until]].sort((a, b) => a[0] - b[0]);
      media.ranges = ordered.reduce((merged, range) => {
        const last = merged.at(-1);
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else merged.push(range);
        return merged;
      }, []);
    }

    function watchProgress(asset) {
      return Math.min(100, Math.floor(100 * media.ranges.reduce((sum, [from, until]) => sum + until - from, 0) / asset.duration));
    }

    function storeMedia() {
      if (route?.screen !== "video") return;
      const asset = videos[route.id];
      state().blockVideo = { ...state().blockVideo, [route.id]: { position: media.position, ranges: media.ranges } };
      if (route.id === "linear-video") state().progress.jiwoo = watchProgress(asset);
      media.lastSave = Date.now();
      ctx.save(false);
    }

    function stopPlayback() {
      if (route?.screen !== "video") return;
      window.clearInterval(media.timer);
      media.timer = null;
      media.playing = false;
      manualFullscreen = false;
      document.body.removeAttribute("data-block-wide");
      if (document.fullscreenElement?.matches(".block-player")) void document.exitFullscreen?.().catch(() => {});
      storeMedia();
    }

    function setRoute(next, { focus = true } = {}) {
      stopPlayback();
      clearPhotos();
      review = { page: 0, zoom: 1, note: "", message: "" };
      route = next;
      if (next?.screen === "video") {
        landscapeDismissed = false;
        restoreMedia(next.id);
      }
      if (next?.screen === "review") {
        const record = collection(next.task)[next.id];
        review.note = record.feedback ?? (record.status === "submitted" ? "" : record.note ?? "");
      }
      ctx.render();
      if (focus) {
        ctx.content.querySelector(".block-detail-top h1")?.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      }
    }

    function goOrigin(destination) {
      const origin = originalScreen(destination?.from ?? route?.from);
      const scroll = Number.isFinite(destination?.scroll) ? destination.scroll : 0;
      ctx.setScreen(origin);
      setRoute(null, { focus: false });
      ctx.content.focus({ preventScroll: true });
      requestAnimationFrame(() => window.scrollTo(0, scroll));
      journey = undefined;
    }

    function ensureOrigin(next, url) {
      const key = "gradient-learning-" + Date.now() + "-" + ++nextKey;
      const origin = { key, from: next.from, scroll: window.scrollY };
      history.replaceState({ ...history.state, gradientLearningOrigin: origin }, "", baseUrl());
      history.pushState({ gradientLearning: origin }, "", url);
      journey = origin;
    }

    function open(screen, id, from = ctx.screen(), task) {
      const next = normalize(screen, id || (screen === "video" ? "linear-video" : ctx.tasks[0].id), route?.from ?? from, task);
      if (!next) return false;
      if (route) {
        history.replaceState({ ...history.state, gradientLearning: journey }, "", detailUrl(next));
        setRoute(next);
      } else {
        ensureOrigin(next, detailUrl(next));
        setRoute(next);
      }
      return true;
    }

    function canGuard() { return route?.screen === "assignment" && draft.photos.length > 0; }

    function askToLeave(proceed) {
      if (ctx.dialog.open) return;
      ctx.openSheet("작성 중인 사진이 있어요. 나갈까요?", "<p>사진을 다시 선택해야 해요.</p>",
        () => { clearPhotos(); proceed(); }, undefined, { confirmLabel: "나가기", successMessage: false });
    }

    function back() {
      if (!route) return false;
      const navigate = () => history.back();
      if (canGuard()) askToLeave(navigate);
      else navigate();
      return true;
    }

    function initialize() {
      if (!enabled()) return;
      initialized = true;
      const next = readRoute();
      if (!next) {
        const origin = history.state?.gradientLearningOrigin;
        if (origin?.key) goOrigin(origin);
        return;
      }
      journey = history.state?.gradientLearning;
      if (!journey?.key || journey.from !== next.from) ensureOrigin(next, detailUrl(next));
      setRoute(next);
    }

    window.addEventListener("popstate", () => {
      if (!enabled()) return;
      const next = readRoute();
      if (next) {
        const nextJourney = history.state?.gradientLearning;
        if (nextJourney?.key) journey = nextJourney;
        setRoute(next);
      } else if (route) {
        const destination = history.state?.gradientLearningOrigin;
        if (ctx.dialog.open) ctx.dialog.close();
        if (canGuard()) {
          history.pushState({ gradientLearning: journey }, "", detailUrl(route));
          if (ctx.dialog.open) ctx.dialog.addEventListener("close", () => askToLeave(() => history.back()), { once: true });
          else askToLeave(() => history.back());
          return;
        }
        goOrigin(destination?.key === journey?.key ? destination : journey);
      }
    });

    document.addEventListener("visibilitychange", () => { if (document.hidden && route?.screen === "video") { stopPlayback(); updatePlayer(); } });
    window.addEventListener("pagehide", () => { stopPlayback(); clearPhotos(); });
    landscape.addEventListener("change", () => { landscapeDismissed = false; updateLandscape(); });

    function summary(task, meta) {
      return '<header class="block-detail-summary"><h2>' + text(task.title) + '</h2><p>' + text(meta) + '</p></header>';
    }

    function paper(variant) {
      return '<span class="block-sample-paper" aria-hidden="true"><span>' + listScores[variant % listScores.length] +
        '</span><b>' + (variant % 2 ? "y = 2x + 1" : "y = x + 2") + '</b><span>' +
        (variant % 2 ? "(1, 3) / (2, 5)" : "(1, 3) / (3, 5)") + '</span><span>기울기와 절편을 확인했어요.</span></span>';
    }

    function photoGrid() {
      const photos = draft.photos.map((photo, index) => '<div class="block-photo"><img alt="선택한 풀이 사진 ' + (index + 1) +
        '" data-photo-preview src="' + text(photo.url) + '">' + action("×", "remove-photo", "block-remove-photo",
          'data-photo-key="' + photo.key + '" aria-label="사진 ' + (index + 1) + ' 삭제"') + '</div>');
      if (draft.photos.length < maximumPhotos) photos.push(action('<strong>＋</strong><span>추가</span>', "choose-photo", "block-photo block-photo-add", 'aria-label="풀이 사진 추가"'));
      return photos.join("");
    }

    function assignmentContent() {
      const task = taskFor(route.id);
      const record = collection(route.id).jiwoo;
      const reviewDone = record?.status === "reviewed";
      const submitted = record?.status === "submitted";
      const returned = record?.status === "returned";
      const canResubmit = !reviewDone && ctx.canSubmit(task);
      const editing = !reviewDone && canResubmit && (!submitted || draft.editing);
      const count = Math.max(1, Math.min(maximumPhotos, Number(record?.photoCount) || 1));
      const [book, range] = worksheet[task.id];
      return '<article>' + summary(task, ctx.studentGroup() + " · 이도현 선생님") +
        '<div class="block-detail-chips">' + badge(icon("clock") + text(task.due) + " 마감", "notice") + badge("풀이 사진 제출") + '</div>' +
        '<section class="block-detail-section"><h3>선생님 안내</h3><p>' + text(task.detail) + '</p>' + makeRange(book, range) + '</section>' +
        (submitted || reviewDone || returned ? '<section class="block-detail-section block-submission-status">' +
          badge(reviewDone ? "확인 완료" : returned ? "재제출 요청" : "제출 완료 · 선생님 확인 대기", returned ? "notice" : "done") +
          (record.note ? '<p>' + text(record.note) + '</p>' : "") +
          (submitted && !draft.editing ? '<p>풀이 사진 ' + count + '장 · ' + (canResubmit ? "마감 전 다시 제출할 수 있어요." : "다시 제출할 수 없어요.") + '</p>' +
            (canResubmit ? action("다시 제출하기", "edit-submission", "block-detail-secondary") : "") : "") +
          '</section>' : "") +
        (editing ? '<section class="block-detail-section"><div class="block-detail-line"><h3>풀이 사진 <span data-block-count>' + draft.photos.length +
          '장</span></h3><small>최대 ' + maximumPhotos + '장</small></div><div class="block-photos">' + photoGrid() + '</div>' +
          '<div class="block-detail-actions">' + action(icon("camera") + "사진 찍기", "take-photo", "block-detail-secondary") +
          action(icon("image") + "앨범에서 선택", "choose-photo", "block-detail-secondary") + '</div>' +
          '<input type="file" id="worksheet-camera" accept="image/*" capture="environment" hidden><input type="file" id="worksheet-picker" accept="image/*" multiple hidden>' +
          '<p class="block-photo-message" role="status">' + text(draft.error) + '</p></section>' +
          '<section class="block-detail-section"><label class="block-detail-label" for="block-teacher-note">선생님께 한마디 <small>선택</small></label>' +
          '<textarea id="block-teacher-note" maxlength="240" placeholder="풀이 과정에서 어려웠던 점을 남겨 보세요.">' + text(draft.note) + '</textarea></section>' +
          '<div class="block-detail-footer"><small>마감 전까지는 다시 제출할 수 있어요</small>' +
          action("제출하기 · 사진 " + draft.photos.length + "장", "save-assignment", "block-detail-primary", draft.photos.length ? "" : "disabled") + '</div>' : "") +
        '</article>';
    }

    function videoContent() {
      const asset = videos[route.id];
      return '<div class="block-player" aria-label="가상 영상 플레이어">' +
        action("▶", "play", "block-play", 'aria-label="이어 보기"') +
        '<div class="block-media-controls"><input aria-label="재생 위치" type="range" min="0" max="' + asset.duration + '" step="1" data-block-playhead>' +
        '<span data-block-time></span>' + action("1.0×", "speed", "block-media-button", 'aria-label="재생 속도"') +
        action(icon("fullscreen"), "fullscreen", "block-media-button", 'aria-label="전체 화면"') + '</div></div>' +
        summary(asset, ctx.studentGroup() + " · 이도현 선생님 · " + Math.round(asset.duration / 60) + "분") +
        '<div class="block-watch"><progress aria-label="시청률" max="100" value="0"></progress><p data-block-percent></p></div>' +
        '<section class="block-detail-section"><h3>구간</h3><div class="block-detail-rows" data-block-chapters>' + chapters(asset) + '</div></section>' +
        '<section class="block-detail-section"><h3>이 영상 다음 과제</h3>' + action('<span>' +
        icon("camera") + '<strong>' + text(taskFor(asset.assignment).title) + '</strong></span>' + icon("next"), "video-assignment", "block-detail-row block-linked-assignment") + '</section>';
    }

    function chapters(asset) {
      return asset.parts.map(([seconds, label], index) => {
        const end = asset.parts[index + 1]?.[0] ?? asset.duration;
        const complete = media.ranges.some(([first, last]) => first <= seconds && last >= end);
        const current = !complete && media.position >= seconds && media.position < end;
        return action('<time' + (current ? ' class="current"' : "") + '>' + time(seconds) + '</time><span><strong>' + text(label) +
          '</strong><small>' + (complete ? "다 봤어요" : current ? "여기서부터 이어 보기" : "아직 안 봤어요") + '</small></span>' +
          (complete ? icon("check") : current ? badge("이어 보기", "notice") : ""), "seek", "block-detail-row",
          'data-second="' + seconds + '" aria-label="' + text(label + " " + time(seconds)) + '"');
      }).join("");
    }

    function reviewContent() {
      const task = taskFor(route.task);
      const learner = ctx.visibleStudents().find(({ id }) => id === route.id);
      const record = collection(route.task)[route.id];
      const count = Math.max(1, Math.min(maximumPhotos, Number(record.photoCount) || 2));
      const completed = record.status === "reviewed";
      const returned = record.status === "returned";
      const aiFlag = route.id === "seoha";
      const studentNote = record.studentNote ?? (record.status === "submitted" ? record.note : "");
      return '<article>' + summary(task, learner.name + " · " + learner.group) +
        '<div class="block-detail-chips">' + badge(completed ? "확인 완료" : returned ? "재제출 요청됨" : "제출 완료", completed ? "done" : "") + '</div>' +
        '<section class="block-detail-section"><div class="block-detail-line"><h3>제출 사진</h3><small data-block-page>' + (review.page + 1) + ' / ' + count + '</small></div>' +
        '<div class="block-review-image" role="img" aria-label="가상 풀이 사진 ' + (review.page + 1) + '">' + paper(review.page) + '</div>' +
        '<div class="block-review-paging">' + action(icon("back"), "previous-photo", "block-detail-secondary", 'aria-label="이전 사진"' + (review.page === 0 ? " disabled" : "")) +
        action("확대", "zoom-photo", "block-detail-secondary", 'aria-label="사진 확대 또는 초기화"') +
        action(icon("next"), "next-photo", "block-detail-secondary", 'aria-label="다음 사진"' + (review.page === count - 1 ? " disabled" : "")) + '</div></section>' +
        '<section class="block-detail-section"><h3>AI 1차 결과' + badge("가상") + '</h3><div class="block-detail-row"><span><strong>' +
        (aiFlag ? "82점 · 흐린 풀이 확인" : "풀이 과정 확인") + '</strong><small>사진과 계산 과정을 직접 확인해 주세요.</small></span>' +
        badge(aiFlag ? "신뢰도 76%" : "신뢰도 90%", aiFlag ? "notice" : "done") + '</div></section>' +
        (studentNote ? '<section class="block-detail-section"><h3>학생이 남긴 한마디</h3><p>' + text(studentNote) + '</p></section>' : '') +
        '<section class="block-detail-section"><label class="block-detail-label" for="block-review-note">학생에게 남길 메모</label><textarea id="block-review-note" maxlength="120">' +
        text(review.note) + '</textarea><p role="status">' + text(review.message) + '</p>' + action("다음 학생", "next-review", "block-detail-secondary") + '</section>' +
        '<div class="block-detail-footer block-detail-actions">' + action("재제출 요청", "return-review", "block-detail-secondary") +
        action("확인 완료", "complete-review", "block-detail-primary") + '</div></article>';
    }

    function render() {
      if (!route || !enabled()) {
        document.body.removeAttribute("data-block-detail");
        const current = history.state;
        if (initialized && !route && current?.gradientLearningOrigin && originalScreen(ctx.screen()) !== current.gradientLearningOrigin.from) {
          const remaining = { ...current };
          delete remaining.gradientLearningOrigin;
          history.replaceState(remaining, "", location.href);
        }
        return false;
      }
      document.body.dataset.blockDetail = route.screen;
      ctx.content.innerHTML = '<div class="block-detail" data-block-screen="' + route.screen + '"><header class="block-detail-top">' +
        action(icon("back"), "back", "block-detail-back", 'aria-label="뒤로 가기"') + '<h1 tabindex="-1">' + titles[route.screen] + '</h1></header>' +
        (route.screen === "assignment" ? assignmentContent() : route.screen === "video" ? videoContent() : reviewContent()) + '</div>';
      if (route.screen === "video") updatePlayer(true);
      else if (route.screen === "review") bindReviewGesture();
      return true;
    }

    function refreshPhotos() {
      const grid = ctx.content.querySelector(".block-photos");
      if (!grid) return;
      grid.innerHTML = photoGrid();
      ctx.content.querySelector("[data-block-count]").textContent = draft.photos.length + "장";
      const submit = ctx.content.querySelector('[data-block-action="save-assignment"]');
      submit.textContent = "제출하기 · 사진 " + draft.photos.length + "장";
      submit.disabled = !draft.photos.length;
      ctx.content.querySelector(".block-photo-message").textContent = draft.error;
      if (draft.photos.length) window.addEventListener("beforeunload", beforeUnload);
      else window.removeEventListener("beforeunload", beforeUnload);
    }

    async function addPhotos(input) {
      const selection = [...input.files];
      input.value = "";
      const original = draft;
      for (const file of selection) {
        if (original !== draft) return;
        if (draft.photos.length >= maximumPhotos) { draft.error = `사진은 최대 ${maximumPhotos}장까지 추가할 수 있어요.`; break; }
        if (!file.size || file.size > storageLimit || !(photoTypes.test(file.type) ||
          ((!file.type || file.type === "application/octet-stream") && photoExtensions.test(file.name)))) {
          draft.error = "20MB 이하의 사진 파일을 선택해 주세요.";
          continue;
        }
        const url = URL.createObjectURL(file);
        const preview = new Image();
        preview.src = url;
        try { await preview.decode(); }
        catch { URL.revokeObjectURL(url); if (original === draft) draft.error = "미리볼 수 없는 사진이에요. JPG 또는 PNG를 선택해 주세요."; continue; }
        if (original !== draft || draft.photos.length >= maximumPhotos) { URL.revokeObjectURL(url); continue; }
        draft.photos.push({ key: ++nextKey, url });
        draft.error = "";
        refreshPhotos();
      }
      if (original === draft) refreshPhotos();
    }

    function saveAssignment() {
      if (!draft.photos.length || !ctx.canSubmit(taskFor(route.id)) || collection(route.id).jiwoo?.status === "reviewed") return;
      const studentNote = draft.note.slice(0, 240);
      collection(route.id).jiwoo = { status: "submitted", attachment: "풀이 사진", photoCount: draft.photos.length, note: studentNote, studentNote };
      clearPhotos();
      ctx.save();
      ctx.content.querySelector(".block-submission-status")?.scrollIntoView({ block: "nearest" });
    }

    function updateLandscape() {
      const wide = route?.screen === "video" && (manualFullscreen || (landscape.matches && !landscapeDismissed));
      document.body.toggleAttribute("data-block-wide", wide);
      ctx.content.querySelector('[data-block-action="fullscreen"]')?.setAttribute("aria-label", wide ? "전체 화면 닫기" : "전체 화면");
    }

    function updatePlayer(renderChapters = false) {
      const asset = videos[route.id];
      const target = ctx.content.querySelector(".block-player");
      if (!target) return;
      const progress = watchProgress(asset);
      const play = target.querySelector('[data-block-action="play"]');
      play.textContent = media.playing ? "Ⅱ" : "▶";
      play.setAttribute("aria-label", media.playing ? "일시 정지" : "이어 보기");
      target.querySelector("[data-block-playhead]").value = Math.floor(media.position);
      target.querySelector("[data-block-time]").textContent = time(media.position) + " / " + time(asset.duration);
      target.querySelector('[data-block-action="speed"]').textContent = media.speed.toFixed(media.speed === 1.25 ? 2 : 1) + "×";
      ctx.content.querySelector(".block-watch progress").value = progress;
      ctx.content.querySelector("[data-block-percent]").innerHTML = '<strong>' + progress + '%</strong> 시청 · ' +
        (progress >= 90 ? "시청 완료" : "90%를 넘으면 완료돼요");
      if (renderChapters) ctx.content.querySelector("[data-block-chapters]").innerHTML = chapters(asset);
      updateLandscape();
    }

    function play() {
      if (media.playing) { stopPlayback(); updatePlayer(true); return; }
      const asset = videos[route.id];
      if (media.position >= asset.duration) media.position = 0;
      media.playing = true;
      media.lastSave = Date.now();
      media.timer = window.setInterval(() => {
        const next = Math.min(asset.duration, media.position + media.speed);
        markWatched(media.position, next);
        media.position = next;
        if (media.position >= asset.duration) stopPlayback();
        else if (Date.now() - media.lastSave >= 10000) storeMedia();
        const chapter = asset.parts.some(([start]) => media.position >= start && media.position - media.speed < start);
        updatePlayer(chapter);
      }, 1000);
      updatePlayer();
    }

    function fullscreen() {
      if (document.fullscreenElement?.matches(".block-player")) { void document.exitFullscreen?.().catch(() => {}); return; }
      if (document.body.hasAttribute("data-block-wide")) {
        manualFullscreen = false;
        landscapeDismissed = true;
        updateLandscape();
        return;
      }
      const player = ctx.content.querySelector(".block-player");
      const fallback = () => { manualFullscreen = !manualFullscreen; updateLandscape(); };
      if (player.requestFullscreen) void player.requestFullscreen().catch(fallback);
      else fallback();
    }

    function changeReviewPhoto(amount) {
      const count = Math.max(1, Math.min(maximumPhotos, Number(collection(route.task)[route.id].photoCount) || 2));
      const page = Math.max(0, Math.min(count - 1, review.page + amount));
      if (page === review.page) return;
      review.page = page;
      review.zoom = 1;
      const image = ctx.content.querySelector(".block-review-image");
      image.innerHTML = paper(page);
      image.setAttribute("aria-label", "가상 풀이 사진 " + (page + 1));
      ctx.content.querySelector("[data-block-page]").textContent = (page + 1) + " / " + count;
      ctx.content.querySelector('[data-block-action="previous-photo"]').disabled = page === 0;
      ctx.content.querySelector('[data-block-action="next-photo"]').disabled = page === count - 1;
      setZoom(1);
    }

    function setZoom(value) {
      review.zoom = Math.max(1, Math.min(3, value));
      ctx.content.querySelector(".block-review-image").style.setProperty("--block-zoom", review.zoom);
    }

    function bindReviewGesture() {
      const image = ctx.content.querySelector(".block-review-image");
      const pointers = new Map();
      let startDistance;
      let startZoom;
      let gesture;
      const distance = () => {
        const [first, second] = pointers.values();
        return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
      };
      image.addEventListener("pointerdown", event => {
        image.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, event);
        if (pointers.size === 1) gesture = { x: event.clientX, y: event.clientY };
        if (pointers.size === 2) {
          startDistance = distance();
          startZoom = review.zoom;
          gesture = undefined;
        }
      });
      image.addEventListener("pointermove", event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, event);
        if (pointers.size === 2 && startDistance) setZoom(startZoom * distance() / startDistance);
      });
      for (const eventName of ["pointerup", "pointercancel"]) image.addEventListener(eventName, event => {
        if (eventName === "pointerup" && gesture && review.zoom === 1 && Math.abs(event.clientX - gesture.x) > 45 &&
            Math.abs(event.clientX - gesture.x) > Math.abs(event.clientY - gesture.y)) changeReviewPhoto(event.clientX < gesture.x ? 1 : -1);
        pointers.delete(event.pointerId);
        if (!pointers.size) gesture = undefined;
      });
    }

    function nextReview() {
      const students = ctx.visibleStudents();
      const current = students.findIndex(({ id }) => id === route.id);
      const next = [...students.slice(current + 1), ...students.slice(0, current)].find(({ id }) =>
        ["submitted", "returned"].includes(collection(route.task)[id]?.status));
      if (next) open("review", next.id, route.from, route.task);
      else {
        review.message = "검사할 다음 학생이 없어요.";
        ctx.content.querySelector("[role=status]").textContent = review.message;
      }
    }

    function saveReview(status) {
      const record = collection(route.task)[route.id];
      if (record.status === "submitted" && record.studentNote == null) record.studentNote = record.note;
      record.status = status;
      record.note = review.note.slice(0, 120);
      record.feedback = record.note;
      review.message = status === "returned" ? "재제출을 요청했어요." : "확인 완료로 바꿨어요.";
      ctx.save();
    }

    ctx.content.addEventListener("click", event => {
      if (!route) return;
      const control = event.target.closest("[data-block-action]");
      if (!control) return;
      switch (control.dataset.blockAction) {
        case "back": back(); break;
        case "choose-photo": ctx.content.querySelector("#worksheet-picker").click(); break;
        case "take-photo": ctx.content.querySelector("#worksheet-camera").click(); break;
        case "remove-photo": {
          const index = draft.photos.findIndex(({ key }) => key === Number(control.dataset.photoKey));
          if (index >= 0) URL.revokeObjectURL(draft.photos.splice(index, 1)[0].url);
          refreshPhotos();
          ctx.content.querySelector('[data-block-action="choose-photo"]')?.focus({ preventScroll: true });
          break;
        }
        case "edit-submission": draft.editing = true; ctx.render(); break;
        case "save-assignment": saveAssignment(); break;
        case "play": play(); break;
        case "speed": {
          const speeds = [1, 1.25, 1.5, 2];
          media.speed = speeds[(speeds.indexOf(media.speed) + 1) % speeds.length];
          updatePlayer();
          break;
        }
        case "seek": media.position = Number(control.dataset.second); storeMedia(); updatePlayer(true); break;
        case "fullscreen": fullscreen(); break;
        case "video-assignment": open("assignment", videos[route.id].assignment); break;
        case "previous-photo": changeReviewPhoto(-1); break;
        case "next-photo": changeReviewPhoto(1); break;
        case "zoom-photo": setZoom(review.zoom > 1 ? 1 : 2); break;
        case "next-review": nextReview(); break;
        case "return-review": saveReview("returned"); break;
        case "complete-review": saveReview("reviewed"); break;
      }
    });

    ctx.content.addEventListener("change", event => {
      if (route?.screen === "assignment" && event.target.matches('input[type="file"]')) void addPhotos(event.target);
      if (route?.screen === "video" && event.target.hasAttribute("data-block-playhead")) storeMedia();
    });

    ctx.content.addEventListener("input", event => {
      if (event.target.matches("#block-teacher-note")) draft.note = event.target.value;
      else if (event.target.matches("#block-review-note")) review.note = event.target.value;
      else if (route?.screen === "video" && event.target.hasAttribute("data-block-playhead")) {
        media.position = Number(event.target.value);
        updatePlayer(true);
      }
    });

    return { initialize, open, render, back, isOpen: () => Boolean(route) };
  }

  let instance;
  window.DemoBlockDetails = Object.freeze({
    create: context => (instance = create(context)),
    back: () => instance?.back() ?? false,
  });
})();
