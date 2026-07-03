/* ============================================================
   Interactivity: language toggle, theme, nav, typing, reveal.
   Preferences persist in localStorage. Language also syncs to
   the ?lang= query param (like the reference site).
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  /* Safe storage: private-browsing and sandboxed frames can throw on access. */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById("themeBtn");
  var storedTheme = store.get("theme");
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
  });

  /* ---------- Language (EN / DE) ---------- */
  var langBtn = document.getElementById("langBtn");
  var langLabel = document.getElementById("langLabel");
  var langAlt = document.getElementById("langAlt");

  function getInitialLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "de") return q;
    var saved = store.get("lang");
    if (saved === "en" || saved === "de") return saved;
    return (navigator.language || "en").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  }

  function applyLang(lang) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val != null) el.innerHTML = val;
    });
    root.setAttribute("lang", lang);
    langLabel.textContent = lang.toUpperCase();
    langAlt.textContent = lang === "en" ? "DE" : "EN";
    store.set("lang", lang);

    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    } catch (e) { /* sandboxed/opaque origin: skip URL sync */ }

    // restart the typing animation in the chosen language
    startTyping(lang);
  }

  var currentLang = getInitialLang();

  langBtn.addEventListener("click", function () {
    currentLang = currentLang === "en" ? "de" : "en";
    applyLang(currentLang);
  });

  /* ---------- Typing animation ---------- */
  var typedEl = document.getElementById("typed");
  var roles = {
    en: ["Neuroscientist", "Data Scientist", "PhD Candidate", "Computational Biologist", "Generalist"],
    de: ["Neurowissenschaftlerin", "Data Scientist", "Doktorandin", "Computational Biologist", "Generalistin"]
  };
  var typeTimer = null;

  function startTyping(lang) {
    if (typeTimer) clearTimeout(typeTimer);
    var list = roles[lang];
    var i = 0, ch = 0, deleting = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typedEl.textContent = list[0];
      return;
    }

    function tick() {
      var word = list[i];
      if (!deleting) {
        ch++;
        typedEl.textContent = word.slice(0, ch);
        if (ch === word.length) {
          deleting = true;
          typeTimer = setTimeout(tick, 1600);
          return;
        }
      } else {
        ch--;
        typedEl.textContent = word.slice(0, ch);
        if (ch === 0) {
          deleting = false;
          i = (i + 1) % list.length;
        }
      }
      typeTimer = setTimeout(tick, deleting ? 45 : 90);
    }
    tick();
  }

  applyLang(currentLang); // also kicks off typing

  /* ---------- Nav: scroll state + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  });

  burger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { navLinks.classList.remove("open"); });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
