ssets/js/script.js`

```javascript
/* ============================================================
   CASA CONTÁBIL — SCRIPT.JS
   Validação, envio AJAX via FormSubmit, menu acessível e
   estrutura desacoplada para futura integração com CRM/API.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Rastreamento Google Analytics 4 ---------- */
  function track(evento, params) {
    if (typeof gtag === 'function') {
      gtag('event', evento, params || {});
    }
  }

  /* ---------- 2. Ano dinâmico no rodapé ---------- */
  var anoEl = document.getElementById('ano');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- 3. Menu mobile acessível ---------- */
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

  /* ---------- 4. Sombra do cabeçalho e link ativo ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 12 ? '0 4px 18px rgba(0, 0, 0, .28)' : 'none';
    }, { passive: true });
  }

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

  /* ---------- 5. Animações de entrada (fade-in) ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 6. Eventos de conversão em links externos ---------- */
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

  /* ---------- 7. Camada de normalização de leads (pronta para CRM/Webhook) ---------- */
  function buildLeadPayload(form) {
    var data = new FormData(form);
    var payload = {
      _subject: form.getAttribute('data-subject') || 'Novo contato — Casa Contábil',
      _template: 'table',
      origem_formulario: form.getAttribute('data-form-type') || 'geral',
      data_envio: new Date().toISOString(),
      pagina_origem: window.location.href
    };

    data.forEach(function (value, key) {
      if (key !== '_honey') {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      }
    });

    return payload;
  }

  /* ---------- 8. Envio assíncrono dos formulários (Contato e Pré-Cadastro) ---------- */
  var forms = document.querySelectorAll('.js-async-form');

  forms.forEach(function (form) {
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var defaultBtnText = submitBtn ? submitBtn.textContent : 'Enviar';

    function setStatus(msg, tipo) {
      if (!statusEl) { return; }
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + (tipo || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Proteção Honeypot anti-spam */
      var honeypot = form.querySelector('.hp-field');
      if (honeypot && honeypot.value) { return; }

      /* Validação nativa HTML5 */
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Por favor, preencha todos os campos obrigatórios.', 'erro');
        return;
      }

      /* Validação mínima de telefone/WhatsApp (mínimo 10 dígitos) */
      var telInput = form.querySelector('input[type="tel"]');
      if (telInput && telInput.value.replace(/\D/g, '').length < 10) {
        telInput.focus();
        setStatus('Informe um número de WhatsApp válido com DDD.', 'erro');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }
      setStatus('', '');

      var payload = buildLeadPayload(form);

      fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (result) {
        if (result && (result.success === 'true' || result.success === true)) {
          form.reset();
          setStatus('Solicitação enviada com sucesso. Nossa equipe retornará em breve.', 'ok');
          track('generate_lead', { metodo: payload.origem_formulario });
        } else {
          throw new Error('Ativação pendente no FormSubmit');
        }
      })
      .catch(function () {
        setStatus('Não foi possível concluir o envio automático agora. Envie diretamente para diogoreissilva11@gmail.com ou fale pelo WhatsApp.', 'erro');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultBtnText;
        }
      });
    });
  });

});
