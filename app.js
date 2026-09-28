const sources = Array.isArray(window.HYDRA_SOURCES) ? window.HYDRA_SOURCES : [];
const list = document.getElementById("sourceList");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
let activeCategory = "all";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function categoryOf(source) {
  return String(source.category || "advanced").toLowerCase();
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = sources.filter(source => {
    const matchesCategory = activeCategory === "all" || categoryOf(source) === activeCategory;
    const haystack = [source.name, source.status, source.description].map(v => String(v || "").toLowerCase());
    return matchesCategory && (!q || haystack.some(v => v.includes(q)));
  });

  list.innerHTML = "";
  empty.hidden = filtered.length !== 0;

  if (!sources.length) {
    empty.querySelector("strong").textContent = "Hydra Library sync returned no sources.";
    empty.querySelector("span").textContent = "Try rebuilding the site or open the Hydra Library directly.";
  } else if (!filtered.length) {
    empty.querySelector("strong").textContent = "No sources match your search or category.";
    empty.querySelector("span").textContent = "Try another search or category.";
  }

  filtered.forEach(source => {
    const row = document.createElement("article");
    row.className = "source";
    row.innerHTML =
      '<input class="check" type="checkbox" data-library-url="' + escapeHtml(source.libraryUrl || "") + '" aria-label="Select ' + escapeHtml(source.name || "source") + '">' +
      '<div class="source-main"><div class="source-heading"><p class="source-name">' + escapeHtml(source.name || "Unnamed source") + '</p>' +
      '<span class="source-badge">' + escapeHtml(source.status || "Unknown") + '</span></div>' +
      '<p class="source-url" title="' + escapeHtml(source.libraryUrl || "") + '">' + escapeHtml(source.description || "") + '</p></div>' +
      '<a class="button secondary install" href="' + escapeHtml(source.libraryUrl || "#") + '" target="_blank" rel="noopener">View in Library</a>';
    list.appendChild(row);
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
  const selected = [...list.querySelectorAll(".check:checked")].map(c => c.dataset.libraryUrl).filter(Boolean);
  if (!selected.length) { alert("Select at least one source."); return; }
  selected.forEach((url, i) => setTimeout(() => window.open(url, "_blank", "noopener"), i * 250));
});

render();
