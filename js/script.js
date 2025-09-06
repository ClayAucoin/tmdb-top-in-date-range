
let tmdbResponse = "";

const $ = (id) => document.getElementById(id);
let topNumber = $("topNumber").value;

console.log("show: " + topNumber);

function buildUrl(path, params) {
    const url = new URL(`https://api.themoviedb.org/3/${path}`);
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    return url.toString();
}

async function topMovies(start, end, key) {
    setQuantity();

    const url = buildUrl("discover/movie", {
        api_key: key,
        "primary_release_date.gte": start,
        "primary_release_date.lte": end,
        include_adult: "false",
        sort_by: "popularity.desc",        // or "vote_average.desc"
        "vote_count.gte": "100",           // avoid low-vote outliers
        page: "1"
    });
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const data = await r.json();
    return (data.results || []).slice(0, topNumber).map(m => ({
        id: m.id,
        title: m.title,
        year: m.release_date?.slice(0, 4) || "",
        rating: m.vote_average ?? null,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : null
    }));
}

async function topTV(start, end, key) {
    setQuantity();

    const url = buildUrl("discover/tv", {
        api_key: key,
        "first_air_date.gte": start,       // premieres in range
        "first_air_date.lte": end,
        include_adult: "false",
        sort_by: "popularity.desc",
        "vote_count.gte": "100",
        page: "1"
    });
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const data = await r.json();
    return (data.results || []).slice(0, topNumber).map(s => ({
        id: s.id,
        title: s.name,
        year: s.first_air_date?.slice(0, 4) || "",
        rating: s.vote_average ?? null,
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w185${s.poster_path}` : null
    }));
}

function renderList(el, items, type) {
    el.innerHTML = items.map(x => `
    <li class="list-group-item d-flex align-items-center gap-2">
      ${x.poster ? `<img src="${x.poster}" alt="" width="40" height="60">` : ``}
      <div class="flex-fill">
        <div><strong>${x.title}</strong> ${x.year ? `(${x.year})` : ""}</div>
        <div class="text-muted">Rating: ${x.rating ?? "—"}</div>
      </div>
      <a target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary"
         href="https://www.themoviedb.org/${type}/${x.id}">TMDb</a>
    </li>`).join("");
}

$("go").addEventListener("click", async () => {
    setQuantity()

    const key = HF_TOKEN;
    const start = $("start").value;
    const end = $("end").value;
    const moviesEl = $("movies");
    const tvEl = $("tv");
    moviesEl.innerHTML = tvEl.innerHTML = `<li class="list-group-item">Loading…</li>`;

    try {
        const [m, t] = await Promise.all([topMovies(start, end, key), topTV(start, end, key)]);
        renderList(moviesEl, m, "movie");
        renderList(tvEl, t, "tv");
    } catch (e) {
        moviesEl.innerHTML = tvEl.innerHTML = `<li class="list-group-item text-danger">Error: ${e.message}</li>`;
    }
});

$("topNumber").addEventListener("change", () => {
    setQuantity()
})

function setQuantity() {
    topNumber = $("topNumber").value;
    $("howMany").textContent = topNumber;
    $("topMoviesNum").textContent = topNumber;
    $("topTVNum").textContent = topNumber;
}