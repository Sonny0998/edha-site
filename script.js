
// ====== CONFIG ======
// ✅ Utilise l'API définie dans index.html : window.__EDHA_API__
// ✅ Fallback local si tu testes sur localhost/127.0.0.1
const API_BASE = (
  (typeof window !== "undefined" && window.__EDHA_API__) ||
  ((location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:5000"
    : "")
).replace(/\/$/, "");

if (!API_BASE) {
  console.warn(
    "⚠️ API_BASE vide. Définis window.__EDHA_API__ dans index.html (ex: https://ton-backend.onrender.com)"
  );
}

const PROGRAMS_ENDPOINT = `${API_BASE}/api/programs`;


// ====== HELPERS ======
function escapeHTML(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Fetch avec timeout pour éviter de rester bloqué si le backend ne répond pas
 */
async function fetchJSON(url, { timeoutMs = 8000, ...options } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      ...options,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg =
        (isJson && body && (body.error || body.message)) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return body;
  } finally {
    clearTimeout(t);
  }
}

// ====== RENDER ======
function createProgramCard(program) {
  const name = escapeHTML(program.name);
  const desc = escapeHTML(program.description || "");
  const bullets = Array.isArray(program.bullets) ? program.bullets : [];
  const slug = program.slug ? encodeURIComponent(program.slug) : "";

  const bulletsHtml = bullets
    .map((b) => `<li>${escapeHTML(b)}</li>`)
    .join("");

  const detailsLink = slug
    ? `<a class="detail-link" href="program.html?slug=${slug}">→ Page détaillée du programme</a>`
    : "";

  return `
    <article class="programme-card">
      <h3>${name}</h3>
      <p class="programme-sub">${desc}</p>

      ${bullets.length ? `<ul>${bulletsHtml}</ul>` : ""}

      ${detailsLink}
    </article>
  `;
}

async function loadPrograms() {
  const grid = document.getElementById("programmesGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="color:#6b7b93;">Chargement des programmes...</p>`;

  try {
    const json = await fetchJSON(PROGRAMS_ENDPOINT, { timeoutMs: 8000 });

    // ✅ Backend renvoie: { success:true, count, data:[...] }
    const programs = Array.isArray(json.data) ? json.data : [];

    if (programs.length === 0) {
      grid.innerHTML = `<p style="color:#6b7b93;">Aucun programme disponible.</p>`;
      return;
    }

    // ✅ Assurer un ordre stable si jamais la DB renvoie dans un autre ordre
    programs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    grid.innerHTML = programs.map(createProgramCard).join("");
  } catch (err) {
    console.error("Erreur loadPrograms:", err);

    const isAbort = String(err?.name).toLowerCase().includes("abort");
    const message = isAbort
      ? "Le serveur met trop de temps à répondre."
      : escapeHTML(err?.message || "Erreur inconnue");

    grid.innerHTML = `
      <p style="color:#b91c1c; line-height:1.5;">
        Erreur de chargement des programmes : <strong>${message}</strong><br/>
        Vérifie que le backend tourne sur <strong>${escapeHTML(API_BASE)}</strong> et que CORS autorise ton site.
      </p>
    `;
  }
}

// ====== NAV + UI ======
function setupNavbar() {
  const header = document.querySelector("header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("nav-links--open");
      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("nav-links--open") ? "true" : "false"
      );
    });
  }

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("header-scrolled", window.scrollY > 10);
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => obs.observe(el));
}

/**
 * ✅ Tabs EDHA Academy (tes boutons existent mais n’étaient pas connectés)
 */
function setupAcademyTabs() {
  const tabs = document.querySelectorAll(".academy-tab");
  const panels = document.querySelectorAll(".academy-panel");

  if (!tabs.length || !panels.length) return;

  function setActive(targetId) {
    panels.forEach((p) => p.classList.toggle("active", p.id === targetId));
    tabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.target === targetId)
    );
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;
      setActive(targetId);
    });
  });
}

// ====== FORMS (Volunteer + Partner) ======
async function postJSON(url, data, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const msg =
        (isJson && body && (body.error || body.message)) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return body;
  } finally {
    clearTimeout(t);
  }
}

function setupVolunteerForm() {
  const form = document.getElementById("volunteerForm");
  const msg = document.getElementById("volunteerMsg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "Envoi en cours…";

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await postJSON(`${API_BASE}/api/volunteers`, data);
      form.reset();
      if (msg) msg.textContent = "✅ Merci ! Votre demande bénévole a été envoyée.";
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ Erreur : ${err.message || "Impossible d’envoyer."}`;
    }
  });
}

function setupPartnerForm() {
  const form = document.getElementById("partnerForm");
  const msg = document.getElementById("partnerMsg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "Envoi en cours…";

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await postJSON(`${API_BASE}/api/partners`, data);
      form.reset();
      if (msg) msg.textContent = "✅ Merci ! Votre demande partenaire a été envoyée.";
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ Erreur : ${err.message || "Impossible d’envoyer."}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  setupReveal();
  setupAcademyTabs();
  loadPrograms();

  setupVolunteerForm();
  setupPartnerForm();
});
