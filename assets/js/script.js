
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const BRL = n => new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL"
  }).format(n);

  $("ano").textContent = new Date().getFullYear();

  // MENU MOBILE
  const menu = $("menu");
  const toggle = $("menuToggle");

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // SERVIÇOS AVULSOS
  // Nome, preço de referência, unidade
  const avulsos = [
    ["Abertura MEI (gratuita no portal oficial)", 0, "por processo"],
    ["Abertura ME/EPP - Simples Nacional", 800, "por processo"],
    ["Abertura - Lucro Presumido", 950, "por processo"],
    ["Abertura - Lucro Real", 1200, "por processo"],
    ["Alteração MEI (assessoria)", 400, "por processo"],
    ["Alteração ME/EPP", 600, "por processo"],
    ["Baixa MEI (assessoria)", 600, "por processo"],
    ["Baixa ME/EPP", 800, "por processo"],
    ["DASN-SIMEI", 250, "por declaração"],
    ["DIRPF individual", 300, "por declaração"],
    ["DITR", 350, "por declaração"],
    ["Emissão NFS-e", 50, "por serviço"],
    ["Emissão NF-e / NFA-e", 100, "por serviço"],
    ["Consulta fiscal / CND", 200, "por serviço"],
    ["Consultoria contábil", 250, "por hora"],
    ["Consultoria tributária", 625, "por hora"],
    ["Planejamento tributário", 760, "por hora"],
    ["Rescisão trabalhista", 100, "por rescisão"]
  ];

  const avulso = $("avulso");
  avulsos.forEach((item, i) => {
    avulso.add(new Option(item[0], String(i)));
  });

  // FAIXAS DE FATURAMENTO
  const faixa = $("faixa");

  function syncFaixas() {
    const regime = $("regime").value;
    const anterior = faixa.value;
    faixa.replaceChildren();

    const faixas = [...new Set(
      window.PRECOS_MENSAIS
        .filter(item => item.regime === regime)
        .map(item => item.faixa)
    )];

    faixas.forEach(valor => {
      faixa.add(new Option(valor, valor));
    });

    if ([...faixa.options].some(o => o.value === anterior)) {
      faixa.value = anterior;
    }
  }

  // CÁLCULO DE HONORÁRIOS
  let resumo = "";
  let precoDisponivel = false;

  function calcular() {
    const modalidadeAvulsa = $("modalidade").value === "avulso";

    ["regimeBox", "faixaBox", "setorBox", "funcBox"]
      .forEach(id => $(id).hidden = modalidadeAvulsa);

    $("avulsoBox").hidden = !modalidadeAvulsa;

    let valor = null;
    let detalhe = "";

    if (modalidadeAvulsa) {
      const item = avulsos[Number(avulso.value)];

      if (item) {
        valor = item[1];
        detalhe = `${item[0]} · ${item[2]}`;
      }
    } else {
      const regime = $("regime").value;
      const faixaAtual = faixa.value;
      const setor = $("setor").value;
      const quantidade = Number($("vinculos").value);

      if (!Number.isInteger(quantidade) ||
          quantidade < 0 || quantidade > 10000) {
        $("preco").textContent = "Informe uma quantidade válida";
        $("detalhePreco").textContent =
          "O número de vínculos deve estar entre 0 e 10.000.";
        $("usarSimulacao").disabled = true;
        resumo = "Quantidade de vínculos inválida";
        precoDisponivel = false;
        return;
      }

      const item = window.PRECOS_MENSAIS.find(x =>
        x.regime === regime &&
        x.faixa === faixaAtual &&
        x.setor === setor
      );

      if (item) {
        let departamentoPessoal = 0;

        if (quantidade > 0) {
          const unitario =
            quantidade <= 2 ? 165.50 :
            quantidade <= 5 ? 145.60 :
            quantidade <= 10 ? 129.50 :
            quantidade <= 20 ? 118.20 :
            quantidade <= 40 ? 107.50 : 87.30;

          departamentoPessoal =
            Math.round(quantidade * unitario * 100) / 100;
        }

        valor = item.valor + departamentoPessoal;

        detalhe =
          `${regime} · ${faixaAtual} · ${setor} · ` +
          `${quantidade} vínculo(s) · ` +
          `Base ${BRL(item.valor)} + ` +
          `DP ${BRL(departamentoPessoal)} / mês`;
      }
    }

    precoDisponivel = valor !== null;

    $("preco").textContent =
      valor === null
        ? "Sob consulta"
        : BRL(valor) + (modalidadeAvulsa ? "" : " / mês");

    $("detalhePreco").textContent =
      detalhe || "Essa combinação exige orçamento individual.";

    $("usarSimulacao").disabled = !precoDisponivel;

    resumo = valor === null
      ? "Orçamento sob consulta"
      : `${BRL(valor)}${modalidadeAvulsa ? "" : " mensais"} — ${detalhe}`;
  }

  $("regime").addEventListener("change", () => {
    syncFaixas();
    calcular();
  });

  ["faixa", "setor", "vinculos", "modalidade", "avulso"]
    .forEach(id => $(id).addEventListener("change", calcular));

  syncFaixas();
  calcular();

  $("usarSimulacao").addEventListener("click", () => {
    const avulsoSelecionado =
      avulsos[Number(avulso.value)];

    $("servicoForm").value =
      $("modalidade").value === "mensal"
        ? "Contabilidade mensal"
        : avulsoSelecionado[0].includes("Abertura")
          ? "Abertura de empresa"
          : "Consultoria tributária";

    $("atividadeForm").value = $("setor").value;
    $("contratacao").scrollIntoView({ behavior: "smooth" });
  });

  // CHECKLIST POR ATIVIDADE
  const comuns = [
    "Documento de identificação do responsável",
    "Dados de contato e endereço",
    "Descrição das atividades e serviços desejados"
  ];

  const tipos = {
    "Serviço": [
      "Atividade/CNAE e local da prestação",
      "Inscrição municipal, se existente"
    ],
    "Comércio": [
      "Inscrição estadual e dados de mercadorias",
      "Notas fiscais de entrada e saída, se existentes"
    ],
    "Indústria": [
      "Descrição do processo produtivo",
      "Informações de estoque, insumos e licenças aplicáveis"
    ],
    "Multissetorial": [
      "Detalhamento de cada atividade exercida",
      "Notas fiscais e inscrições pertinentes"
    ],
    "MEI": [
      "CCMEI e situação cadastral, se existente",
      "Relatório de receitas e DAS, quando aplicável"
    ],
    "Produtor rural": [
      "CAFIR/CIB e dados do imóvel rural, quando aplicável",
      "Informações de receitas e despesas rurais"
    ]
  };

  const servicos = {
    "Abertura de empresa": [
      "Endereço pretendido e dados dos sócios",
      "Capital social e atividades previstas",
      "Informações para viabilidade e licenças aplicáveis"
    ],
    "Contabilidade mensal": [
      "Cartão CNPJ e contrato social/CCMEI",
      "Regime tributário e acessos a serem autorizados de forma segura",
      "Documentos fiscais e informações de folha, se houver"
    ],
    "Regularização ou alteração": [
      "Cartão CNPJ e ato constitutivo atual",
      "Descrição da alteração ou pendência",
      "Notificações e demonstrativos de débitos, se houver"
    ],
    "Departamento pessoal": [
      "Quantidade de empregados e tipo de vínculo",
      "Dados trabalhistas necessários em canal seguro",
      "Convenção coletiva aplicável, quando houver"
    ],
    "Imposto de Renda / ITR": [
      "Ano-exercício e situação declaratória",
      "Comprovantes de rendimentos e despesas pertinentes",
      "Documentação do imóvel rural, se aplicável"
    ],
    "Consultoria tributária": [
      "Regime tributário e atividade",
      "Faturamento estimado e documentos fiscais pertinentes",
      "Descrição do problema ou objetivo"
    ]
  };

  let listaAtual = [];

  function checklist() {
    listaAtual = [
      ...comuns,
      ...(tipos[$("tipoEmpresa").value] || []),
      ...(servicos[$("tipoServico").value] || [])
    ];

    const host = $("listaChecklist");
    host.replaceChildren();

    listaAtual.forEach((texto, i) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.id = "ck" + i;

      label.append(checkbox, document.createTextNode(texto));
      host.append(label);
    });
  }

  ["tipoEmpresa", "tipoServico"].forEach(id =>
    $(id).addEventListener("change", checklist)
  );

  checklist();

  $("copiarChecklist").addEventListener("click", async () => {
    const texto = listaAtual.map(x => "☐ " + x).join("\n");

    try {
      await navigator.clipboard.writeText(texto);
      $("checkStatus").textContent = "Checklist copiado.";
    } catch {
      $("checkStatus").textContent =
        "Não foi possível copiar automaticamente.";
    }
  });

  // PRÉ-CADASTRO E ENVIO
  const form = $("form-proposta");
  const status = $("formStatus");
  const botao = form.querySelector('button[type="submit"]');

  function whatsapp() {
    const dados = new FormData(form);

    const mensagem =
      "Olá, Casa Contábil! Solicitação pelo site.\n" +
      "Nome: " + (dados.get("nome") || "") + "\n" +
      "Serviço: " + (dados.get("servico") || "") + "\n" +
      "Atividade: " + (dados.get("atividade") || "") + "\n" +
      "Estimativa: " + resumo;

    return "https://wa.me/5569993842735?text=" +
      encodeURIComponent(mensagem);
  }

  $("waProposta").addEventListener("click", () => {
    $("waProposta").href = whatsapp();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (form.elements["_honey"].value.trim()) return;
    if (!form.reportValidity()) return;

    const telefone = String(
      form.elements["whatsapp"].value
    ).replace(/\D/g, "");

    if (telefone.length < 10 || telefone.length > 13) {
      status.textContent = "Informe um WhatsApp válido com DDD.";
      return;
    }

    const cnpj = String(
      form.elements["cnpj"].value
    ).replace(/\D/g, "");

    if (cnpj && cnpj.length !== 14) {
      status.textContent =
        "CNPJ deve conter 14 dígitos, ou deixe em branco.";
      return;
    }

    $("resumoOrcamento").value = resumo;
    $("checklistEmail").value = listaAtual.join(" | ");

    const linkWhatsApp = whatsapp();

    botao.disabled = true;
    botao.textContent = "Enviando...";
    status.textContent = "";

    try {
      const resposta = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!resposta.ok) {
        throw new Error("HTTP " + resposta.status);
      }

      const resultado = await resposta.json();

      if (
        resultado.success !== true &&
        resultado.success !== "true"
      ) {
        throw new Error("Serviço não confirmou o envio");
      }

      $("waResultado").href = linkWhatsApp;
      $("resultado").hidden = false;

      $("resultado").scrollIntoView({
        behavior: "smooth"
      });

      status.textContent =
        "Solicitação aceita pelo serviço de envio. " +
        "Confira o recebimento no e-mail.";

      form.reset();

    } catch (erro) {
      status.textContent =
        "Não foi possível confirmar o envio. " +
        "Use WhatsApp ou e-mail para continuar.";

      console.warn(erro);

    } finally {
      botao.disabled = false;
      botao.textContent = "Enviar solicitação por e-mail";
    }
  });
});
