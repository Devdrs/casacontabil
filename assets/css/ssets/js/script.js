
document.addEventListener("DOMContentLoaded", () => {

  // Ano no rodapé
  const year = document.getElementById("ano");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Menu mobile
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  // Abas dos formulários
  const tabs = Array.from(
    document.querySelectorAll('[role="tab"]')
  );

  function selectTab(selectedTab) {
    tabs.forEach(tab => {
      const active = tab === selectedTab;

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;

      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (panel) {
        panel.hidden = !active;
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      selectTab(tab);
    });

    tab.addEventListener("keydown", event => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];

      if (!keys.includes(event.key)) return;

      event.preventDefault();

      let next;

      if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = tabs.length - 1;
      } else {
        const direction = event.key === "ArrowRight" ? 1 : -1;
        next = (index + direction + tabs.length) % tabs.length;
      }

      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });

  // Envio ao FormSubmit
  document.querySelectorAll(".lead-form").forEach(form => {

    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector(".form-status");
    const originalText = button.textContent;

    function setStatus(message, kind = "") {
      status.textContent = message;
      status.className = "form-status " + kind;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const honeypot = form.querySelector('[name="_honey"]');

      if (honeypot && honeypot.value.trim()) {
        setStatus("Não foi possível enviar esta solicitação.", "erro");
        return;
      }

      if (!form.reportValidity()) return;

      const phone = form.querySelector('[name="whatsapp"]');

      if (phone) {
        const digits = phone.value.replace(/\D/g, "");

        if (digits.length < 10 || digits.length > 13) {
          setStatus("Informe um WhatsApp válido com DDD.", "erro");
          phone.focus();
          return;
        }
      }

      button.disabled = true;
      button.textContent = "Enviando...";
      setStatus("");

      try {
        const data = new FormData(form);

        data.append("origem_pagina", window.location.href);

        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Falha HTTP: " + response.status);
        }

        const result = await response.json();

        if (
          !result ||
          (result.success !== "true" && result.success !== true)
        ) {
          throw new Error("Envio não confirmado pelo serviço.");
        }

        form.reset();

        setStatus(
          "Solicitação aceita pelo serviço de envio. " +
          "Aguarde nosso retorno.",
          "ok"
        );

      } catch (error) {
        console.warn("Erro no formulário:", error);

        setStatus(
          "Não foi possível confirmar o envio. " +
          "Fale pelo WhatsApp (69) 99384-2735 ou envie " +
          "um e-mail para diogoreissilva11@gmail.com.",
          "erro"
        );

      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
});

