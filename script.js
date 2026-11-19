document.addEventListener("DOMContentLoaded", () => {
  // Ano automático
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu mobile
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");

  function fecharMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const aberto = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(aberto));
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", fecharMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") fecharMenu();
    });
  }

  // Abas de contato e pré-cadastro
  const abas = [
    document.getElementById("tab-contato"),
    document.getElementById("tab-cadastro")
  ].filter(Boolean);

  function selecionarAba(indice) {
    abas.forEach((aba, i) => {
      const ativa = i === indice;
      const painel = document.getElementById(
        aba.getAttribute("aria-controls")
      );

      aba.classList.toggle("active", ativa);
      aba.setAttribute("aria-selected", String(ativa));
      aba.tabIndex = ativa ? 0 : -1;

      if (painel) painel.hidden = !ativa;
    });
  }

  abas.forEach((aba, indice) => {
    aba.addEventListener("click", () => selecionarAba(indice));

    aba.addEventListener("keydown", event => {
      const teclas = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!teclas.includes(event.key)) return;

      event.preventDefault();

      let proxima = indice;

      if (event.key === "Home") proxima = 0;
      if (event.key === "End") proxima = abas.length - 1;
      if (event.key === "ArrowRight")
        proxima = (indice + 1) % abas.length;
      if (event.key === "ArrowLeft")
        proxima = (indice - 1 + abas.length) % abas.length;

      selecionarAba(proxima);
      abas[proxima].focus();
    });
  });

  // Envio dos formulários
  document.querySelectorAll(".lead-form").forEach(form => {
    const botao = form.querySelector('button[type="submit"]');
    const status = form.querySelector(".form-status");
    const textoOriginal = botao.textContent;

    function mostrarStatus(mensagem, tipo = "") {
      status.textContent = mensagem;
      status.className = "form-status " + tipo;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      // Campo invisível de prevenção contra bots
      const honeypot = form.querySelector('[name="_honey"]');
      if (honeypot && honeypot.value.trim()) {
        mostrarStatus("Não foi possível enviar a solicitação.", "erro");
        return;
      }

      // Verificação básica de telefone
      const telefone = form.querySelector('[name="whatsapp"]');

      if (telefone) {
        const digitos = telefone.value.replace(/\D/g, "");

        if (digitos.length < 10 || digitos.length > 13) {
          mostrarStatus(
            "Informe um WhatsApp válido com DDD.",
            "erro"
          );
          telefone.focus();
          return;
        }
      }

      botao.disabled = true;
      botao.textContent = "Enviando...";
      mostrarStatus("");

      try {
        const dados = new FormData(form);
        dados.append("pagina_origem", window.location.href);

        const resposta = await fetch(form.action, {
          method: "POST",
          body: dados,
          headers: {
            "Accept": "application/json"
          }
        });

        if (!resposta.ok) {
          throw new Error("Erro HTTP: " + resposta.status);
        }

        const resultado = await resposta.json();

        if (
          !resultado ||
          (resultado.success !== true &&
           resultado.success !== "true")
        ) {
          throw new Error("Envio não confirmado pelo serviço.");
        }

        form.reset();

        mostrarStatus(
          "Solicitação aceita pelo serviço de envio. " +
          "Aguarde nosso retorno.",
          "ok"
        );

      } catch (erro) {
        console.error("Erro no formulário:", erro);

        mostrarStatus(
          "Não foi possível confirmar o envio. " +
          "Entre em contato pelo WhatsApp (69) 99384-2735 " +
          "ou pelo e-mail diogoreissilva11@gmail.com.",
          "erro"
        );

      } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
    });
  });
});
