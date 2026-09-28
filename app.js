const sources = Array.isArray(window.HYDRA_SOURCES) ? window.HYDRA_SOURCES : [];
const list = document.getElementById("sourceList");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
let activeCategory = "all";

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

function categoryOf(source) {
  return String(source.category || "recommended").toLowerCase();
}

function render() {
  const q = search.value.trim().toLowerCase();

  const filtered = sources.filter(source => {
    const matchesCategory = activeCategory === "all" || categoryOf(source) === activeCategory;
    const haystack = [
      source.name,
      source.url,
      source.description,
      source.category
    ].map(v => String(v || "").toLowerCase());

    return matchesCategory && (!q || haystack.some(v => v.includes(q)));
  });

  list.innerHTML = "";
  empty.hidden = filtered.length !== 0;

  filtered.forEach((source, index) => {
    const row = document.createElement("article");
    row.className = "source";
    row.innerHTML = `
      <input class="check" type="checkbox" data-source-url="${escapeHtml(source.url || "")}" aria-label="Select ${escapeHtml(source.name || "source")}">
      <div class="source-main">
        <div class="source-heading">
          <p class="source-name">${escapeHtml(source.name || "Unnamed source")}</p>
          <span class="source-badge">${escapeHtml(source.category || "Recommended")}</span>
        </div>
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

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category").forEach(b => b.classList.toggle("active", b === button));
    render();
  });
});

document.getElementById("selectAll").addEventListener("click", () => {
  list.querySelectorAll(".check").forEach(c => c.checked = true);
});

document.getElementById("installSelected").addEventListener("click", () => {
  const selected = [...list.querySelectorAll(".check:checked")]
    .map(c => c.dataset.sourceUrl)
    .filter(Boolean);

  if (!selected.length) {
    alert("Select at least one authorized source.");
    return;
  }

  selected.forEach((url, i) => {
    setTimeout(() => openInHydra(url), i * 900);
  });
});

document.getElementById("customInstall").addEventListener("click", () => {
  openInHydra(document.getElementById("customUrl").value.trim());
});

render();