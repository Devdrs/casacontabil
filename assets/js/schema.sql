
-- MODELO FUTURO
-- Exige backend autenticado e controle de acesso.
-- Não utilizado diretamente pelo GitHub Pages.

CREATE TABLE clientes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(25) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE empresas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  razao_social VARCHAR(150),
  cnpj CHAR(14),
  atividade VARCHAR(50),
  cidade_uf VARCHAR(100)
);

CREATE TABLE solicitacoes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  empresa_id BIGINT REFERENCES empresas(id),
  servico VARCHAR(120) NOT NULL,
  resumo_orcamento TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'solicitado',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT status_valido CHECK (
    status IN (
      'solicitado',
      'em_analise',
      'proposta_enviada',
      'contrato_pendente',
      'contratado',
      'cancelado'
    )
  )
);

CREATE TABLE checklist_itens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  solicitacao_id BIGINT NOT NULL REFERENCES solicitacoes(id),
  descricao TEXT NOT NULL,
  entregue BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE pagamentos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  solicitacao_id BIGINT NOT NULL REFERENCES solicitacoes(id),
  provedor VARCHAR(30) NOT NULL DEFAULT 'mercadopago',
  referencia_externa TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  valor_centavos BIGINT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pagamento_status CHECK (
    status IN (
      'pendente',
      'confirmado',
      'recusado',
      'estornado'
    )
  )
);

-- Não expor tabelas ou credenciais no frontend.
-- Confirmar pagamentos apenas por webhook autenticado
-- ou conciliação manual.

