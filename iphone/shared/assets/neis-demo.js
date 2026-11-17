"use strict";

// Synthetic results for the offline role demos. All searches run in memory.
const DemoNeis = (() => {
  const source = "나이스 교육정보 개방 포털 (가상 데이터)";
  const ttl = 24 * 60 * 60 * 1000;
  const cache = new Map();
  const regions = [
    ["seoul", "서울특별시"], ["busan", "부산광역시"], ["daegu", "대구광역시"], ["incheon", "인천광역시"],
    ["gwangju", "광주광역시"], ["daejeon", "대전광역시"], ["ulsan", "울산광역시"], ["sejong", "세종특별자치시"],
    ["gyeonggi", "경기도"], ["gangwon", "강원특별자치도"], ["chungbuk", "충청북도"], ["chungnam", "충청남도"],
    ["jeonbuk", "전북특별자치도"], ["jeonnam", "전라남도"], ["gyeongbuk", "경상북도"], ["gyeongnam", "경상남도"],
    ["jeju", "제주특별자치도"],
  ];
  const catalog = {
    academy: [
      { id: "onsaemi", region: "seoul", name: "온새미 가상수학학원", address: "서울특별시 가상구 온새미로 17",
        status: "등록", postalCode: "00017", phone: "000-000-0017", course: "보습", field: "입시·검정 및 보습" },
      { id: "onsaemi-closed", region: "seoul", name: "온새미 가상과학학원", address: "서울특별시 가상구 온새미로 23",
        status: "휴원", postalCode: "00023", phone: "000-000-0023", course: "보습", field: "입시·검정 및 보습" },
      { id: "moon-academy", region: "gyeonggi", name: "달그루 가상학원", address: "경기도 가상시 달그루로 28",
        status: "등록", postalCode: "00028", phone: "000-000-0028", course: "보습", field: "입시·검정 및 보습" },
    ],
    school: [
      { id: "naru", region: "seoul", name: "별담나루 가상중학교", address: "서울특별시 가상구 별담로 12" },
      { id: "moon", region: "gyeonggi", name: "푸른달빛 가상중학교", address: "경기도 가상시 푸른달빛로 5" },
    ],
  };
  const academicSchedule = {
    naru: [
      { id: "neis-naru-closure", title: "학교 재량휴업일", type: "school", date: "2026-11-18" },
      { id: "neis-naru-exam", title: "학교 기말고사", type: "exam", date: "2026-11-20" },
    ],
    moon: [
      { id: "neis-moon-exam", title: "학교 기말고사", type: "exam", date: "2026-11-19" },
      { id: "neis-moon-event", title: "학교 독서 행사", type: "school", date: "2026-11-24" },
    ],
  };
  const normalize = (value) => value.normalize("NFKC").trim().replace(/\s+/g, "").toLocaleLowerCase("ko");

  function cachedRows(key, read, now) {
    const found = cache.get(key);
    if (found?.until > now) return { rows: found.rows, cached: true };
    const rows = read();
    cache.delete(key);
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, { rows, until: now + ttl });
    return { rows, cached: false };
  }

  function lookup(kind, region, search, now = Date.now()) {
    const query = normalize(search);
    if (!region || query.length < 2) return { status: "idle", rows: [], cached: false };
    if (query === "연결오류") return { status: "unavailable", rows: [], cached: false };
    const result = cachedRows(`${kind}:${region}:${query}`, () =>
      catalog[kind].filter((row) => row.region === region && normalize(row.name).includes(query)), now);
    return { ...result, status: result.rows.length ? "found" : "empty" };
  }

  function schedule(school, now = Date.now()) {
    return cachedRows(`schedule:${school}`, () => academicSchedule[school] ?? [], now).rows;
  }

  function searchFields(kind) {
    return `<section class="neis-lookup" data-neis-lookup="${kind}" aria-labelledby="neis-search-title">
      <h3 id="neis-search-title">${kind === "academy" ? "나이스에서 학원 찾기" : "나이스에서 학교 찾기"}</h3>
      <label>시·도<select name="neisRegion"><option value="">시·도 선택</option>
        ${regions.map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select></label>
      <label>검색할 ${kind === "academy" ? "학원" : "학교"} 이름<input name="neisQuery" autocomplete="off" maxlength="80" placeholder="${kind === "academy" ? "예: 온새미" : "예: 별담나루"}"></label>
      <p class="note">${kind === "academy" ? "교육청 등록 정보 기준 · " : ""}출처: ${source}</p>
      <p class="note" data-neis-status role="status">시·도를 고르고 이름을 두 글자 이상 입력해 주세요.</p>
      <ul class="item-list neis-results" aria-label="${kind === "academy" ? "학원 후보" : "학교 후보"}" data-neis-results hidden></ul>
    </section>`;
  }

  function bindLookup(container, kind, onSelect) {
    const lookupPanel = container.querySelector("[data-neis-lookup]");
    const region = lookupPanel.querySelector('[name="neisRegion"]');
    const query = lookupPanel.querySelector('[name="neisQuery"]');
    const status = lookupPanel.querySelector("[data-neis-status]");
    const results = lookupPanel.querySelector("[data-neis-results]");
    let timer;
    let matches = [];
    const hideResults = () => {
      matches = [];
      delete lookupPanel.dataset.neisCached;
      results.replaceChildren();
      results.hidden = true;
    };
    function search() {
      clearTimeout(timer);
      hideResults();
      if (query.value.trim().length < 2 || !region.value) {
        status.textContent = "시·도를 고르고 이름을 두 글자 이상 입력해 주세요.";
        return;
      }
      status.textContent = "가상 등록 정보를 찾는 중…";
      timer = setTimeout(() => {
        const match = lookup(kind, region.value, query.value);
        matches = match.rows;
        lookupPanel.dataset.neisCached = String(match.cached);
        status.textContent = {
          found: `가상 검색 결과 ${matches.length}건 · 하나를 선택해 주세요.`,
          empty: "검색 결과가 없어요. 아래에 직접 입력할 수 있어요.",
          unavailable: "등록 정보를 불러오지 못했어요. 아래에 직접 입력할 수 있어요.",
        }[match.status] || "";
        if (!matches.length) return;
        results.innerHTML = matches.map(({ id, name, address, status: state }) =>
          `<li><button class="neis-candidate" type="button" data-neis-choice="${id}">
            <span class="neis-candidate-details"><strong>${name}</strong><small>${address}</small>
              ${state ? `<span class="neis-status-chip${state === "휴원" ? " neis-status-closed" : ""}">${state}</span>` : ""}</span>
            <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button></li>`).join("");
        results.hidden = false;
      }, 400);
    }
    [region, query].forEach((field) => field.addEventListener(field === region ? "change" : "input", search));
    results.addEventListener("click", (event) => {
      const option = event.target.closest("[data-neis-choice]");
      const row = matches.find(({ id }) => id === option?.dataset.neisChoice);
      if (!row) return;
      results.hidden = true;
      status.textContent = "가상 등록 정보를 채웠어요. 내용을 확인하고 필요한 항목을 고쳐 주세요.";
      onSelect(row);
    });
    container.addEventListener("close", () => clearTimeout(timer), { once: true });
  }

  return Object.freeze({ source, lookup, schedule, searchFields, bindLookup, reset: () => cache.clear() });
})();
