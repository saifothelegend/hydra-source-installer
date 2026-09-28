const sources = Array.isArray(window.HYDRA_SOURCES) ? window.HYDRA_SOURCES : [];
const list = document.getElementById("sourceList");
const empty = document.getElementById("empty");
const search = document.getElementById("search");

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

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = sources.filter(s =>
    String(s.name || "").toLowerCase().includes(q) ||
    String(s.url || "").toLowerCase().includes(q) ||
    String(s.description || "").toLowerCase().includes(q)
  );

  list.innerHTML = "";
  empty.hidden = filtered.length !== 0;

  filtered.forEach((source, index) => {
    const row = document.createElement("article");
    row.className = "source";
    row.innerHTML = `
      <input class="check" type="checkbox" data-index="${index}" aria-label="Select ${escapeHtml(source.name || "source")}">
      <div class="source-main">
        <p class="source-name">${escapeHtml(source.name || "Unnamed source")}</p>
        <p class="source-url" title="${escapeHtml(source.url || "")}">${escapeHtml(source.description || source.url || "")}</p>
      </div>
      <button class="button secondary install" data-url="${escapeHtml(source.url || "")}">Open in Hydra</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll(".install").forEach(btn => {
    btn.addEventListener("click", () => openInHydra(btn.dataset.url));
  });
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
    alert("Select at least one authorized source.");
    return;
  }

  selected.forEach((source, i) => {
    setTimeout(() => openInHydra(source.url), i * 900);
  });
});

document.getElementById("customInstall").addEventListener("click", () => {
  openInHydra(document.getElementById("customUrl").value.trim());
});

render();