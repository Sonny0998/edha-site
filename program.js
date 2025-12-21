// program.js

// 1) Configuration API (local vs production)
function getApiBase() {
  // Si tu héberges le backend ailleurs en production, mets ton URL ici :
  // ex: https://edha-api.onrender.com/api
  const PROD_API = window.__EDHA_API__ || ""; // optionnel (voir section domaine)
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  if (isLocal) return "http://localhost:5000/api";
  if (PROD_API) return PROD_API.replace(/\/$/, "");
  // fallback: même domaine (si tu serves frontend+backend ensemble)
  return "/api";
}

const API_BASE = getApiBase();

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryLabel(cat) {
  const map = {
    social: "Social",
    sante: "Santé",
    education: "Éducation",
    technologie: "Technologie",
    autre: "Autre",
  };
  return map[cat] || "Programme";
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function main() {
  const slug = qs("slug");
  if (!slug) {
    $("programLoading").classList.add("hidden");
    $("programError").classList.remove("hidden");
    $("programErrorMsg").textContent = "Paramètre manquant : ?slug=...";
    return;
  }

  try {
    // 1) Charger programme par slug
    const progRes = await fetchJson(`${API_BASE}/programs/slug/${encodeURIComponent(slug)}`);
    const p = progRes.data;

    // UI
    $("programCategory").textContent = categoryLabel(p.category);
    $("programName").textContent = p.name || "Programme";
    $("programDescription").textContent = p.description || "";

    // Bullets
    const bullets = Array.isArray(p.bullets) ? p.bullets : [];
    $("programBullets").innerHTML = bullets.length
      ? bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")
      : "<li>—</li>";

    // Details
    $("programAudience").textContent = p.details?.targetAudience || "—";
    $("programLocation").textContent = p.details?.location || "—";
    $("programDuration").textContent = p.details?.duration || "—";

    // Objectives
    const objectives = Array.isArray(p.details?.objectives) ? p.details.objectives : [];
    $("programObjectives").innerHTML = objectives.length
      ? objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join("")
      : "<li>—</li>";

    // 2) Charger articles publiés du programme
    const artRes = await fetchJson(`${API_BASE}/programs/${p._id}/articles`);
    const items = Array.isArray(artRes.data) ? artRes.data : [];

    const container = $("programArticles");
    if (!items.length) {
      $("noArticles").classList.remove("hidden");
    } else {
      container.innerHTML = items
        .map((a) => {
          const cover = a.coverImage ? `<img src="${escapeHtml(a.coverImage)}" alt="">` : "";
          const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "";
          return `
            <article class="article-card card">
              ${cover}
              <h3>${escapeHtml(a.title || "Article")}</h3>
              <p class="muted">${escapeHtml(a.excerpt || "")}</p>
              <p class="muted">${escapeHtml(date)}</p>
              <a class="program-link" href="article.html?slug=${encodeURIComponent(a.slug)}">Lire</a>
            </article>
          `;
        })
        .join("");
    }

    // Show content
    $("programLoading").classList.add("hidden");
    $("programContent").classList.remove("hidden");
  } catch (err) {
    $("programLoading").classList.add("hidden");
    $("programError").classList.remove("hidden");
    $("programErrorMsg").textContent = err.message || "Erreur inconnue.";
  }
}

main();
