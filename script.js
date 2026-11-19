/* ============================================================
   CASA CONTÁBIL — SCRIPT.JS
   JavaScript puro, sem dependências externas.
   Preparado para envio automático via FormSubmit (HTTPS) e
   estrutura escalável para futura integração com CRM/API.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Analytics seguro ---------- */
  function track(nome, params) {
    if (typeof gtag === 'function') {
      gtag('event', nome, params || {});
    }
  }

  /* ---------- Ano dinâmico no rodapé ---------- */
  var anoEl = document.getElementById('ano');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('main-nav');

  function setMenuState(open) {
    if (!navToggle || !mainNav) { return; }
    mainNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      setMenuState(!mainNav.classList.contains('is-open'));
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuState(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        setMenuState(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        setMenuState(false);
      }
    });
  }

  /* ---------- Sombra no cabeçalho ao rolar ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 12 ? '0 4px 16px rgba(24,26,29,.10)' : 'none';
    }, { passive: true });
  }

  /* ---------- Destaque de link ativo na navegação ---------- */
  var navLinks = mainNav ? Array.prototype.slice.call(mainNav.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach(function (sec) { navObserver.observe(sec); });
  }

  /* ---------- Animações de entrada ao rolar ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Rastreamento de cliques externos ---------- */
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('clique_whatsapp', { local: a.textContent.trim().slice(0, 40) || 'botao_flutuante' });
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('clique_email');
    });
  });

  document.querySelectorAll('a[href*="instagram.com"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('clique_instagram');
    });
  });

  /* ---------- Abas: Contato Rápido vs Pré-Cadastro ---------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.contact-form[role="tabpanel"]');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');

      tabButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      tabPanels.forEach(function (panel) {
        panel.classList.toggle('is-hidden', panel.id !== targetId);
      });
    });
  });

  /* ---------- Máscara simples de WhatsApp ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function (telInput) {
    telInput.addEventListener('input', function () {
      var digits = telInput.value.replace(/\D/g, '').slice(0, 11);
      if (digits.length > 6) {
        telInput.value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
      } else if (digits.length > 2) {
        telInput.value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
      } else if (digits.length > 0) {
        telInput.value = '(' + digits;
      }
    });
  });

  /* ---------- Envio real dos formulários (Contato e Pré-Cadastro) ---------- */
  document.querySelectorAll('.contact-form').forEach(function (form) {
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var defaultLabel = submitBtn ? submitBtn.textContent : 'Enviar';

    function setStatus(msg, tipo) {
      if (!statusEl) { return; }
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + (tipo || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('.hp-field');
      if (honeypot && honeypot.value) { return; }

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Verifique os campos obrigatórios e o aceite de privacidade.', 'erro');
        return;
      }

      var formData = new FormData(form);
      formData.append('origem_url', window.location.href);
      formData.append('data_envio_iso', new Date().toISOString());

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }
      setStatus('', '');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (data && data.success === 'false') {
          throw new Error('Rejeitado pelo provedor');
        }
        var tipoForm = formData.get('tipo_formulario') || 'contato';
        form.reset();
        setStatus('Solicitação recebida com sucesso. Nossa equipe retornará em breve.', 'ok');
        track('generate_lead', { metodo: tipoForm });
      })
      .catch(function () {
        setStatus('Não foi possível concluir o envio automático agora. Fale pelo WhatsApp +55 (69) 99384-2735 ou escreva para diogoreissilva11@gmail.com.', 'erro');
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultLabel;
        }
      });
    });
  });

});
