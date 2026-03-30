/* ════════════════════════════════════════════════════════════
   EDHA — JavaScript partagé
   Fichier : script.js
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';


  /* ══ 1. NAVIGATION ═════════════════════════════════════════ */

  var hdr = document.getElementById('hdr');
  var nm  = document.getElementById('nm');
  var hbg = document.getElementById('hbg');

  // Ajoute la classe "scrolled" au header lors du défilement
  if (hdr) {
    window.addEventListener('scroll', function () {
      hdr.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Ouvre / ferme le menu mobile
  if (hbg) {
    hbg.addEventListener('click', function () {
      var open = nm.classList.toggle('open');
      hbg.textContent = open ? '✕' : '☰';
      hbg.setAttribute('aria-expanded', String(open));
    });
  }

  // Ferme le menu mobile au clic sur un lien
  if (nm) {
    nm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nm.classList.remove('open');
        if (hbg) { hbg.textContent = '☰'; hbg.setAttribute('aria-expanded', 'false'); }
      });
    });
  }


  /* ══ 2. SÉLECTEUR DE LANGUE PROFESSIONNEL ══════════════════ */
  /*
   * Contrôle le menu déroulant de langue EDHA.
   * Utilise Google Translate en arrière-plan de façon invisible.
   * L'utilisateur voit uniquement le menu EDHA, pas l'interface Google.
   */

  var lsSwitcher = document.getElementById('langSwitcher');
  var lsTrigger  = document.getElementById('lsTrigger');
  var lsMenu     = document.getElementById('lsMenu');
  var lsCurrent  = document.getElementById('lsCurrent');

  if (lsTrigger && lsMenu) {

    // Ouvre / ferme le menu
    lsTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = lsSwitcher.classList.toggle('open');
      lsMenu.hidden = !isOpen;
      lsTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    // Sélection d'une langue
    lsMenu.querySelectorAll('.ls-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang  = btn.dataset.lang;
        var label = btn.dataset.label;

        // Met à jour l'affichage du bouton
        if (lsCurrent) lsCurrent.textContent = label;

        // Active visuellement l'option choisie
        lsMenu.querySelectorAll('.ls-option').forEach(function (o) {
          o.classList.remove('ls-active');
        });
        btn.classList.add('ls-active');

        // Déclenche la traduction via Google Translate
        var sel = document.querySelector('.goog-te-combo');
        if (sel) {
          sel.value = lang;
          sel.dispatchEvent(new Event('change'));
        }

        // Ferme le menu
        lsSwitcher.classList.remove('open');
        lsMenu.hidden = true;
        lsTrigger.setAttribute('aria-expanded', 'false');
      });
    });

    // Ferme si clic en dehors
    document.addEventListener('click', function (e) {
      if (lsSwitcher && !lsSwitcher.contains(e.target)) {
        lsSwitcher.classList.remove('open');
        lsMenu.hidden = true;
        lsTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Ferme avec la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        lsSwitcher.classList.remove('open');
        lsMenu.hidden = true;
        lsTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ══ 3. RÉVÉLATION AU SCROLL ════════════════════════════════ */

  var rvEls = document.querySelectorAll('.rv');
  if (rvEls.length) {
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ok');
          rvObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    rvEls.forEach(function (el) { rvObs.observe(el); });
  }


  /* ══ 4. COMPTEURS ANIMÉS ════════════════════════════════════ */

  function animateCounter(el) {
    var target   = parseInt(el.dataset.t, 10);
    var suffix   = el.dataset.s || '';
    var duration = 2000;
    var start    = performance.now();

    function update(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 4); // ease-out quart
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  var cntObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.dataset.t) {
        animateCounter(e.target);
        cntObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-t]').forEach(function (el) {
    cntObs.observe(el);
  });


  /* ══ 5. SLIDER PHOTOS ═══════════════════════════════════════ */
  /*
   * Classe "slide-item" utilisée pour les slides
   * afin d'éviter tout conflit avec les règles CSS commençant par ".sl"
   */

  var track = document.getElementById('slTrack');
  if (track) {

    var slides   = track.querySelectorAll('.slide-item');
    var dots     = document.querySelectorAll('.sd');
    var prog     = document.getElementById('slProg');
    var current  = 0;
    var timer    = null;
    var INTERVAL = 5500; // millisecondes entre chaque slide

    // Navigue vers le slide numéro i
    function goTo(i) {
      if (!slides.length) return;
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('sa');

      current = (i + slides.length) % slides.length;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('sa');

      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      resetProgress();
    }

    // Réinitialise et lance la barre de progression
    function resetProgress() {
      if (!prog) return;
      prog.style.transition = 'none';
      prog.style.width = '0%';
      void prog.offsetWidth; // force le reflow pour relancer l'animation
      prog.style.transition = 'width ' + INTERVAL + 'ms linear';
      prog.style.width = '100%';
    }

    function startAuto()  { timer = setInterval(function () { goTo(current + 1); }, INTERVAL); resetProgress(); }
    function stopAuto()   { clearInterval(timer); if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; } }

    // Boutons précédent / suivant
    var prevBtn = document.getElementById('slPrev');
    var nextBtn = document.getElementById('slNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); goTo(current + 1); startAuto(); });

    // Pastilles de navigation
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { stopAuto(); goTo(i); startAuto(); });
    });

    // Support tactile (swipe)
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend',   function (e) {
      var dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) goTo(dx > 0 ? current + 1 : current - 1);
      startAuto();
    }, { passive: true });

    // Pause au survol
    var slWrap = track.parentElement;
    if (slWrap) { slWrap.addEventListener('mouseenter', stopAuto); slWrap.addEventListener('mouseleave', startAuto); }

    startAuto();
  }


  /* ══ 6. ACCORDÉON RÉSEAU ════════════════════════════════════ */

  document.querySelectorAll('[data-nc]').forEach(function (card) {
    var btn    = card.querySelector('[data-nt]');
    var moreId = btn && btn.getAttribute('aria-controls');
    var more   = moreId ? document.getElementById(moreId) : null;
    if (!btn || !more) return;

    // État initial : fermé
    more.style.overflow   = 'hidden';
    more.style.maxHeight  = '0';
    more.style.transition = 'max-height .32s ease';
    more.hidden = true;

    btn.addEventListener('click', function () {
      var open = !card.classList.contains('open');
      card.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.nt-txt').textContent = open ? 'Réduire' : 'Voir plus';

      if (open) {
        more.hidden = false;
        more.style.maxHeight = '0';
        more.offsetHeight;
        more.style.maxHeight = more.scrollHeight + 'px';
      } else {
        more.style.maxHeight = more.scrollHeight + 'px';
        more.offsetHeight;
        more.style.maxHeight = '0';
      }
    });

    more.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'max-height') return;
      if (!card.classList.contains('open')) more.hidden = true;
      else more.style.maxHeight = more.scrollHeight + 'px';
    });
  });


  /* ══ 7. SOUMISSION DE FORMULAIRE (Formspree) ════════════════ */

  async function submitForm(form, msgEl) {

    // Protection anti-spam honeypot
    var honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value.trim()) {
      msgEl.textContent = '✅ Merci !';
      msgEl.className   = 'fmsg ok';
      form.reset();
      return;
    }

    // Renseigne les champs cachés
    var pgField = form.querySelector('[name="page"]');
    var tsField = form.querySelector('[name="timestamp"]');
    if (pgField) pgField.value = location.href;
    if (tsField) tsField.value = new Date().toISOString();

    var formData  = new FormData(form);
    formData.set('source', 'edha-site');

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled    = true;
    msgEl.textContent = '⏳ Envoi en cours…';
    msgEl.className   = 'fmsg ld';

    try {
      var res = await fetch(form.action, {
        method:  'POST',
        headers: { Accept: 'application/json' },
        body:    formData
      });

      if (res.ok) {
        msgEl.textContent = '✅ Message envoyé — Merci !';
        msgEl.className   = 'fmsg ok';
        form.reset();
      } else {
        msgEl.textContent = '❌ Erreur — Veuillez réessayer';
        msgEl.className   = 'fmsg er';
      }
    } catch (err) {
      msgEl.textContent = '❌ Connexion impossible';
      msgEl.className   = 'fmsg er';
    } finally {
      submitBtn.disabled = false;
    }
  }

  // Attache le gestionnaire à tous les formulaires avec data-formid
  document.querySelectorAll('form[data-formid]').forEach(function (form) {
    var msgEl = document.getElementById(form.dataset.formid);
    if (msgEl) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitForm(form, msgEl);
      });
    }
  });


})(); // fin de l'IIFE
