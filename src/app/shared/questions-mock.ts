import { Question } from './models';

export const QUESTIONS_MOCK: Question[] = [
  // ESCOPO
  {
    id: 'esc_1',
    secao: 'ESCOPO',
    codigo: 'ESC-01',
    enunciado: 'Descrição detalhada do projeto e objetivo da solução digital.',
    tipoResposta: 'TEXTO'
  },
  {
    id: 'esc_2',
    secao: 'ESCOPO',
    codigo: 'ESC-02',
    enunciado: 'Público-alvo e estimativa de volume de usuários afetados.',
    tipoResposta: 'TEXTO'
  },

  // CONTEXTO
  {
    id: 'ctx_1',
    secao: 'CONTEXTO',
    codigo: 'CTX-01',
    enunciado: 'A solução realiza tratamento ou armazenamento de dados pessoais ou sensíveis?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },
  {
    id: 'ctx_2',
    secao: 'CONTEXTO',
    codigo: 'CTX-02',
    enunciado: 'Envolve dados de grupos vulneráveis (ex: crianças, idosos, dados de saúde)?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },
  {
    id: 'ctx_3',
    secao: 'CONTEXTO',
    codigo: 'CTX-03',
    enunciado: 'Possui integrações com sistemas externos ou APIs de terceiros?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },

  // PPD (Privacidade e Proteção de Dados)
  {
    id: 'ppd_1',
    secao: 'PPD',
    codigo: 'PPD-01',
    enunciado: 'Existe previsão de compartilhamento internacional de dados?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },
  {
    id: 'ppd_2',
    secao: 'PPD',
    codigo: 'PPD-02',
    enunciado: 'A retenção dos dados ultrapassa o período estritamente necessário para a finalidade?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },

  // SEGURANCA
  {
    id: 'seg_1',
    secao: 'SEGURANCA',
    codigo: 'SEG-01',
    enunciado: 'Requer autenticação corporativa/institucional obrigatória?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  },
  {
    id: 'seg_2',
    secao: 'SEGURANCA',
    codigo: 'SEG-02',
    enunciado: 'Serão realizadas análises estáticas (SAST) e dinâmicas (DAST) de segurança?',
    tipoResposta: 'OPCOES',
    opcoes: ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']
  }
];
