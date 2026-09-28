const fs = require("fs");

const LIBRARY = "https://library.hydra.wiki/sources/";

function strip(html) {
  return html.replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\\s+/g, " ").trim();
}

function category(status) {
  const s = status.toLowerCase();
  if (s === "trusted") return "recommended";
  if (s === "safe for use") return "present";
  if (s === "software") return "necessary";
  return "advanced";
}

async function get(url) {
  const r = await fetch(url, {headers: {"user-agent": "hydra-source-installer-sync/1.0"}});
  if (!r.ok) throw new Error(url + " -> HTTP " + r.status);
  return r.text();
}

async function main() {
  const index = await get(LIBRARY);
  const idRegex = new RegExp("/sources/(\\\\d+)/?", "g");
  const ids = [...new Set([...index.matchAll(idRegex)].map(m => m[1]))];
  if (!ids.length) throw new Error("No source IDs found on Hydra Library.");

  const out = [];
  for (const id of ids) {
    try {
      const html = await get(LIBRARY + id + "/");
      const h1 = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i);
      const text = strip(html);
      const sm = text.match(/\\b(Trusted|Safe For Use|Abandoned|Use At Your Own Risk|NSFW|Software|Classics)\\b/i);
      const name = h1 ? strip(h1[1]) : "Hydra Library source #" + id;
      const status = sm ? sm[1] : "Unknown";
      out.push({id, name, status, category: category(status),
        description: "Catalog entry synchronized from Hydra Library.",
        libraryUrl: LIBRARY + id + "/"});
    } catch (e) { console.warn("Skipping " + id + ": " + e.message); }
  }

  if (!out.length) throw new Error("Hydra Library sync returned no usable sources.");
  fs.writeFileSync("sources.js", "window.HYDRA_SOURCES = " + JSON.stringify(out, null, 2) + ";\\n");
  console.log("Synced " + out.length + " Hydra Library sources.");
}
main().catch(e => { console.error(e); process.exit(1); });
