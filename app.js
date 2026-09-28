const API_URL = "https://api.hydralibrary.com";
const list = document.getElementById("sourceList");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const sources = [];

function hydraUrl(sourceUrl) {
  return "hydralauncher://install-source?url=" + encodeURIComponent(sourceUrl);
}

function openInHydra(url) {
  if (!/^https?:\/\//i.test(url)) {
    alert("Please enter a valid http(s) source URL.");
    return;
  }
  window.location.href = hydraUrl(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function normalizeSource(item) {
  return {
    name: item.name || item.title || "Unnamed source",
    url: item.url || item.source_url || item.sourceUrl || item.json_url || "",
    description: item.description || "",
    status: item.status || ""
  };
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = sources.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.url.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.status.toLowerCase().includes(q)
  );

  list.innerHTML = "";
  empty.hidden = filtered.length !== 0;

  filtered.forEach((source, index) => {
    const row = document.createElement("article");
    row.className = "source";
    row.innerHTML = `
      <input class="check" type="checkbox" data-index="${index}" aria-label="Select ${escapeHtml(source.name)}">
      <div class="source-main">
        <p class="source-name">${escapeHtml(source.name)}</p>
        <p class="source-url" title="${escapeHtml(source.url)}">${escapeHtml(source.status ? source.status + " • " : "")}${escapeHtml(source.description || source.url)}</p>
      </div>
      <button class="button secondary install" data-url="${escapeHtml(source.url)}">Open in Hydra</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll(".install").forEach(btn => {
    btn.addEventListener("click", () => openInHydra(btn.dataset.url));
  });
}

async function loadSources() {
  empty.hidden = true;
  list.innerHTML = '<p class="empty">Loading sources from Hydra Library...</p>';

  try {
    const response = await fetch(API_URL + "/sources");
    if (!response.ok) throw new Error("Hydra Library returned " + response.status);
    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.sources || data.data || data.results || []);
    sources.push(...items.map(normalizeSource).filter(s => s.url));
    render();
  } catch (error) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.textContent = "Could not load sources from Hydra Library. Use the Custom Source box below.";
    console.error(error);
  }
}

search.addEventListener("input", render);

document.getElementById("selectAll").addEventListener("click", () => {
  list.querySelectorAll(".check").forEach(c => c.checked = true);
});

document.getElementById("installSelected").addEventListener("click", () => {
  const selected = [...list.querySelectorAll(".check:checked")]
    .map(c => sources[Number(c.dataset.index)])
    .filter(Boolean);

  if (!selected.length) {
    alert("Select at least one source.");
    return;
  }

  selected.forEach((source, i) => {
    setTimeout(() => openInHydra(source.url), i * 900);
  });
});

document.getElementById("customInstall").addEventListener("click", () => {
  openInHydra(document.getElementById("customUrl").value.trim());
});

loadSources();