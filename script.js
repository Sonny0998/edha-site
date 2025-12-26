/* =========================
FILE: script.js
========================= */

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

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (!links.classList.contains("nav-links--open")) return;
        links.classList.remove("nav-links--open");
        toggle.setAttribute("aria-expanded", "false");
      });
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

// ====== TRADUCTION PRO ======
function setupTranslatePro() {
  const root = document.getElementById("translatePro");
  const btn = document.getElementById("translateBtn");
  const panel = document.getElementById("translatePanel");
  const closeBtn = document.getElementById("translateClose");
  const navLangBtn = document.querySelector(".lang-switch");

  if (!root || !btn || !panel) return;

  function openPanel() {
    panel.hidden = false;
    root.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    // focus pour accessibilité
    setTimeout(() => closeBtn?.focus(), 0);
  }

  function closePanel() {
    root.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    // on laisse une petite transition avant hidden
    setTimeout(() => {
      panel.hidden = true;
    }, 140);
  }

  function togglePanel() {
    if (root.classList.contains("is-open")) closePanel();
    else openPanel();
  }

  btn.addEventListener("click", togglePanel);
  closeBtn?.addEventListener("click", closePanel);

  // bouton navbar "🌐 Langues" ouvre le panel aussi
  navLangBtn?.addEventListener("click", openPanel);

  // fermer en cliquant dehors
  document.addEventListener("click", (e) => {
    if (!root.classList.contains("is-open")) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (root.contains(target)) return;
    closePanel();
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!root.classList.contains("is-open")) return;
    closePanel();
  });
}

// Network: "Voir plus / Réduire"
function setupNetworkExpand() {
  const cards = document.querySelectorAll("[data-network-card]");
  if (!cards.length) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setOpen(card, open) {
    const btn = card.querySelector("[data-network-toggle]");
    const moreId = btn?.getAttribute("aria-controls");
    const more = moreId ? document.getElementById(moreId) : null;

    if (!btn || !more) return;

    card.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");

    const text = btn.querySelector(".network-toggle-text");
    const icon = btn.querySelector(".network-toggle-icon");
    if (text) text.textContent = open ? "Réduire" : "Voir plus";
    if (icon) icon.textContent = open ? "−" : "＋";

    if (reduce) {
      more.hidden = !open;
      more.style.maxHeight = open ? "none" : "0px";
      more.style.opacity = open ? "1" : "0";
      more.style.transform = open ? "translateY(0)" : "translateY(-4px)";
      return;
    }

    if (open) {
      more.hidden = false;
      more.style.maxHeight = "0px";
      more.offsetHeight;
      more.style.maxHeight = more.scrollHeight + "px";
    } else {
      more.style.maxHeight = more.scrollHeight + "px";
      more.offsetHeight;
      more.style.maxHeight = "0px";
    }
  }

  cards.forEach((card) => {
    const btn = card.querySelector("[data-network-toggle]");
    const moreId = btn?.getAttribute("aria-controls");
    const more = moreId ? document.getElementById(moreId) : null;
    if (!btn || !more) return;

    more.hidden = true;
    more.style.maxHeight = "0px";

    const text = btn.querySelector(".network-toggle-text");
    const icon = btn.querySelector(".network-toggle-icon");
    if (text) text.textContent = "Voir plus";
    if (icon) icon.textContent = "＋";

    btn.addEventListener("click", () => {
      const open = !card.classList.contains("is-open");
      setOpen(card, open);
    });

    more.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "max-height") return;
      const isOpen = card.classList.contains("is-open");
      if (!isOpen) {
        more.hidden = true;
      } else {
        more.style.maxHeight = more.scrollHeight + "px";
      }
    });
  });

  window.addEventListener("resize", () => {
    if (reduce) return;
    cards.forEach((card) => {
      if (!card.classList.contains("is-open")) return;
      const btn = card.querySelector("[data-network-toggle]");
      const moreId = btn?.getAttribute("aria-controls");
      const more = moreId ? document.getElementById(moreId) : null;
      if (!more) return;
      more.style.maxHeight = more.scrollHeight + "px";
    });
  });
}

// Tabs EDHA Academy
function setupAcademyTabs() {
  const tabs = document.querySelectorAll(".academy-tab");
  const panels = document.querySelectorAll(".academy-panel");
  if (!tabs.length || !panels.length) return;

  function setActive(targetId) {
    const next = document.getElementById(targetId);
    if (!next) return;

    panels.forEach((p) => p.classList.toggle("active", p.id === targetId));
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === targetId));

    next.style.animation = "none";
    next.offsetHeight;
    next.style.animation = "";
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;
      setActive(targetId);
    });
  });
}

// ====== FORMS (Formspree) ======
function setMsg(el, type, text) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("is-success", "is-error", "is-loading");
  if (type) el.classList.add(type);
}

function setSubmitting(form, submitting) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn) btn.disabled = submitting;

  const inputs = form.querySelectorAll("input, textarea, select, button");
  inputs.forEach((i) => {
    if (i === btn) return;
    i.disabled = submitting;
  });

  form.classList.toggle("is-submitting", submitting);
}

async function postFormspree(form, msgEl) {
  const action = form.getAttribute("action") || "";
  if (!action || action.includes("XXXXXXX") || action.includes("YYYYYYY")) {
    setMsg(
      msgEl,
      "is-error",
      "⚠️ Formulaire non configuré : remplace l’URL Formspree dans l’attribut action."
    );
    return;
  }

  const gotcha = form.querySelector('input[name="_gotcha"]');
  if (gotcha && gotcha.value.trim() !== "") {
    setMsg(msgEl, "is-success", "✅ Merci ! Votre message a été envoyé.");
    form.reset();
    return;
  }

  const page = form.querySelector('input[name="page"]');
  const ts = form.querySelector('input[name="timestamp"]');
  if (page) page.value = window.location.href;
  if (ts) ts.value = new Date().toISOString();

  const label = form.dataset.formLabel || "Formulaire";
  const formData = new FormData(form);

  formData.set("source", "edha-site");
  formData.set("label", label);

  if (!formData.get("_subject")) {
    formData.set("_subject", `EDHA – Nouvelle demande (${label})`);
  }

  setSubmitting(form, true);
  setMsg(msgEl, "is-loading", "⏳ Envoi en cours…");

  try {
    const res = await fetch(action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    if (res.ok) {
      setMsg(
        msgEl,
        "is-success",
        "✅ Merci ! Votre demande a été envoyée avec succès. Nous vous contacterons bientôt."
      );
      form.reset();
      return;
    }

    let data = null;
    try { data = await res.json(); } catch {}

    if (data && Array.isArray(data.errors) && data.errors.length) {
      const details = data.errors.map((e) => e.message).join(" • ");
      setMsg(msgEl, "is-error", `❌ Erreur : ${details}`);
    } else {
      setMsg(msgEl, "is-error", "❌ Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  } catch (err) {
    setMsg(msgEl, "is-error", "❌ Impossible d’envoyer (connexion). Réessaie dans quelques instants.");
  } finally {
    setSubmitting(form, false);
  }
}

function setupRealForms() {
  const volunteerForm = document.getElementById("volunteerForm");
  const partnerForm = document.getElementById("partnerForm");

  if (volunteerForm) {
    const msg = document.getElementById("volunteerMsg");
    volunteerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      postFormspree(volunteerForm, msg);
    });
  }

  if (partnerForm) {
    const msg = document.getElementById("partnerMsg");
    partnerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      postFormspree(partnerForm, msg);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  setupReveal();

  setupTranslatePro();     // ✅ NUEVO
  setupNetworkExpand();
  setupAcademyTabs();
  setupRealForms();
});
