/* Casa Contábil — menu, atalhos de serviço e proposta (JavaScript puro). */
const CONFIG = {
  whatsapp: "5569993842735",
  // Cole aqui o link de pagamento (Pix, Mercado Pago, Stripe...) quando existir.
  // Vazio = o botão "Contratar agora" não aparece.
  pagamentoUrl: ""
};

document.addEventListener("DOMContentLoaded", () => {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* Menu mobile */
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
    const fechar = () => { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", String(menu.classList.toggle("open"))));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", fechar));
    document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });
  }

  const form = document.getElementById("form-proposta");
  if (!form) return;
  const f = n => form.elements[n];
  const botao = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form-status");
  const resultado = document.getElementById("resultado");
  const waProposta = document.getElementById("waProposta");
  const waResultado = document.getElementById("waResultado");
  const pagar = document.getElementById("pagar");
  const original = botao.textContent;

  /* Cartões de serviço preenchem a proposta */
  document.querySelectorAll(".pick").forEach(c => c.addEventListener("click", () => {
    if (c.dataset.servico) f("servico").value = c.dataset.servico;
    if (c.dataset.tipo) f("tipo_cliente").value = c.dataset.tipo;
  }));

  /* Resumo para o WhatsApp */
  const resumo = () => {
    const linhas = [["Nome", "nome"], ["Tipo de cliente", "tipo_cliente"], ["Serviço", "servico"], ["Regime", "regime"],
      ["Funcionários", "funcionarios"], ["Notas por mês", "notas"], ["Prazo", "urgencia"], ["Observações", "mensagem"]]
      .filter(([, n]) => f(n).value.trim()).map(([r, n]) => r + ": " + f(n).value.trim());
    return "Olá! Vim pelo site da Casa Contábil e gostaria de receber uma proposta.\n" + linhas.join("\n");
  };
  const link = () => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(resumo());
  [waProposta, waResultado].forEach(a => a.addEventListener("click", () => { a.href = link(); }));

  const msg = (texto, tipo = "") => {
    status.textContent = texto;
    status.className = "form-status " + tipo;
    status.setAttribute("role", tipo === "erro" ? "alert" : "status");
  };

  /* Envio via FormSubmit: só confirma quando o serviço confirma */
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (f("_honey").value.trim()) return;                 // robô: ignora em silêncio
    if (!form.reportValidity()) return;

    const digitos = f("whatsapp").value.replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 13) {
      msg("Informe um WhatsApp válido com DDD.", "erro"); f("whatsapp").focus(); return;
    }

    botao.disabled = true; botao.textContent = "Enviando..."; msg("");
    try {
      const dados = new FormData(form);
      dados.append("origem_pagina", location.href);
      const r = await fetch(form.action, { method: "POST", body: dados, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (!j || (j.success !== true && j.success !== "true")) throw new Error("Envio não confirmado");

      waResultado.href = link();                           // monta o resumo antes de limpar
      if (CONFIG.pagamentoUrl) { pagar.href = CONFIG.pagamentoUrl; pagar.hidden = false; }
      form.reset();
      resultado.hidden = false;
      resultado.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.warn("Erro no formulário:", err.message);
      msg("Não foi possível confirmar o envio. Use o botão \"Enviar pelo WhatsApp\" ou escreva para diogoreissilva11@gmail.com.", "erro");
    } finally {
      botao.disabled = false; botao.textContent = original;
    }
  });
});
