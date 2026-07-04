/* ============================================================
   CASA CONTÁBIL — SCRIPT.JS
   JavaScript puro, sem dependências externas.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Ano dinâmico no rodapé ---------- */
  var anoEl = document.getElementById('ano');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- Menu mobile (hambúrguer) ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fecha o menu ao clicar em qualquer link (melhora UX mobile)
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Header com sombra ao rolar ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 12) {
        header.style.boxShadow = '0 4px 18px rgba(10,37,64,.25)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  /* ---------- Animações de entrada ao rolar (fade-in) ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: navegadores sem suporte a IntersectionObserver mostram tudo direto
    fadeEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

});