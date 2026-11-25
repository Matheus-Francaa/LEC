CREATE TABLE lec (
    id_lec uuid PRIMARY KEY,
    nome_solucao varchar(150) NOT NULL,
    grupo_classificacao varchar(100),
    tipo_solucao varchar(150),
    subtipo_solucao varchar(150),
    especialista_responsavel varchar(150),
    status varchar(20) NOT NULL CHECK (status IN ('RASCUNHO', 'EM_REVISAO', 'APROVADO', 'DEVOLVIDO')),
    versao integer NOT NULL,
    criado_em timestamptz NOT NULL,
    atualizado_em timestamptz NOT NULL,
    parecer_devolucao text,
    plano_execucao text
);

CREATE INDEX idx_lec_status_atualizado ON lec (status, atualizado_em DESC);

CREATE TABLE lec_answer (
    id uuid PRIMARY KEY,
    lec_id uuid NOT NULL REFERENCES lec (id_lec) ON DELETE CASCADE,
    question_id varchar(40) NOT NULL,
    answer_value text NOT NULL,
    updated_at timestamptz NOT NULL,
    CONSTRAINT uk_lec_answer_question UNIQUE (lec_id, question_id)
);

CREATE TABLE lec_comment (
    id uuid PRIMARY KEY,
    lec_id uuid NOT NULL REFERENCES lec (id_lec) ON DELETE CASCADE,
    question_id varchar(40) NOT NULL,
    texto text NOT NULL,
    resolvido boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL
);

CREATE INDEX idx_lec_comment_lec ON lec_comment (lec_id, created_at);

CREATE TABLE lec_question (
    id varchar(40) PRIMARY KEY,
    secao varchar(20) NOT NULL,
    codigo varchar(20) NOT NULL UNIQUE,
    enunciado text NOT NULL,
    tipo_resposta varchar(20) NOT NULL CHECK (tipo_resposta IN ('TEXTO', 'SELECAO', 'OPCOES')),
    obrigatoria boolean NOT NULL
);

CREATE TABLE lec_question_option (
    question_id varchar(40) NOT NULL REFERENCES lec_question (id) ON DELETE CASCADE,
    option_order integer NOT NULL,
    option_value varchar(100) NOT NULL,
    PRIMARY KEY (question_id, option_order)
);

CREATE TABLE lec_classification_group (
    nome varchar(100) PRIMARY KEY,
    sort_order integer NOT NULL UNIQUE
);
