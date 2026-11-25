INSERT INTO lec_classification_group (nome, sort_order) VALUES
    ('Transacional', 1),
    ('Analytics', 2),
    ('Inteligência Artificial', 3),
    ('Infraestrutura', 4);

INSERT INTO lec_question (id, secao, codigo, enunciado, tipo_resposta, obrigatoria) VALUES
    ('esc_1', 'ESCOPO', 'ESC-01', 'Descrição detalhada do projeto e objetivo da solução digital.', 'TEXTO', true),
    ('esc_2', 'ESCOPO', 'ESC-02', 'Público-alvo e estimativa de volume de usuários afetados.', 'TEXTO', true),
    ('ctx_1', 'CONTEXTO', 'CTX-01', 'A solução realiza tratamento ou armazenamento de dados pessoais ou sensíveis?', 'OPCOES', true),
    ('ctx_2', 'CONTEXTO', 'CTX-02', 'Envolve dados de grupos vulneráveis (ex: crianças, idosos, dados de saúde)?', 'OPCOES', true),
    ('ctx_3', 'CONTEXTO', 'CTX-03', 'Possui integrações com sistemas externos ou APIs de terceiros?', 'OPCOES', true),
    ('ppd_1', 'PPD', 'PPD-01', 'Existe previsão de compartilhamento internacional de dados?', 'OPCOES', true),
    ('ppd_2', 'PPD', 'PPD-02', 'A retenção dos dados ultrapassa o período estritamente necessário para a finalidade?', 'OPCOES', true),
    ('seg_1', 'SEGURANCA', 'SEG-01', 'Requer autenticação corporativa/institucional obrigatória?', 'OPCOES', true),
    ('seg_2', 'SEGURANCA', 'SEG-02', 'Serão realizadas análises estáticas (SAST) e dinâmicas (DAST) de segurança?', 'OPCOES', true),
    ('etica_1', 'RESULTADO', 'ETI-01', 'A solução utiliza Inteligência Artificial?', 'OPCOES', true),
    ('etica_2', 'RESULTADO', 'ETI-02', 'Riscos de viés e medidas de mitigação.', 'TEXTO', false);

INSERT INTO lec_question_option (question_id, option_order, option_value)
SELECT question_id, option_order, option_value
FROM (VALUES
    ('ctx_1', 0, 'Sim'), ('ctx_1', 1, 'Não'), ('ctx_1', 2, 'Não se aplica'), ('ctx_1', 3, 'Não é possível responder'),
    ('ctx_2', 0, 'Sim'), ('ctx_2', 1, 'Não'), ('ctx_2', 2, 'Não se aplica'), ('ctx_2', 3, 'Não é possível responder'),
    ('ctx_3', 0, 'Sim'), ('ctx_3', 1, 'Não'), ('ctx_3', 2, 'Não se aplica'), ('ctx_3', 3, 'Não é possível responder'),
    ('ppd_1', 0, 'Sim'), ('ppd_1', 1, 'Não'), ('ppd_1', 2, 'Não se aplica'), ('ppd_1', 3, 'Não é possível responder'),
    ('ppd_2', 0, 'Sim'), ('ppd_2', 1, 'Não'), ('ppd_2', 2, 'Não se aplica'), ('ppd_2', 3, 'Não é possível responder'),
    ('seg_1', 0, 'Sim'), ('seg_1', 1, 'Não'), ('seg_1', 2, 'Não se aplica'), ('seg_1', 3, 'Não é possível responder'),
    ('seg_2', 0, 'Sim'), ('seg_2', 1, 'Não'), ('seg_2', 2, 'Não se aplica'), ('seg_2', 3, 'Não é possível responder'),
    ('etica_1', 0, 'Sim'), ('etica_1', 1, 'Não'), ('etica_1', 2, 'Não se aplica'), ('etica_1', 3, 'Não é possível responder')
) AS options(question_id, option_order, option_value);
