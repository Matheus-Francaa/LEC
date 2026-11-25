export enum StatusLEC {
  RASCUNHO = 'RASCUNHO',
  EM_REVISAO = 'EM_REVISAO',
  DEVOLVIDO = 'DEVOLVIDO',
  APROVADO = 'APROVADO'
}

export interface LecHeader {
  id: string;
  nomeSolucao: string;
  especialistaResponsavel: string;
  status: StatusLEC;
  versao: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Classification {
  grupo: string; // Ex: Transacional, Analytics, IA
  tipo: string;
  subtipo?: string;
}

export interface Question {
  id: string;
  secao: 'ESCOPO' | 'CONTEXTO' | 'PPD' | 'SEGURANCA' | 'RESULTADO';
  codigo: string;
  enunciado: string;
  tipoResposta: 'TEXTO' | 'SELECAO' | 'OPCOES';
  obrigatoria: boolean;
  opcoes?: string[];
}

export interface Answer {
  perguntaId: string;
  valor: string; // Ex: "Sim", "Não", "Não se aplica", "Não é possível responder" ou texto livre
  origem: 'USUARIO' | 'IA_ACEITA' | 'IA_EDITADA';
  atualizadoEm: Date;
}

export interface RulesResult {
  pontuacaoPertinencia: number;
  indicadorRAT: boolean;
  indicadorRIPD: boolean;
  indicadorAIA: boolean;
  indicadorGRSI: boolean;
  detalhes: string[];
}

export interface FieldComment {
  id: string;
  perguntaId: string;
  texto: string;
  resolvido: boolean;
  criadoEm: Date;
}

export interface LecData {
  header: LecHeader;
  classification?: Classification;
  respostas: Record<string, Answer>; // perguntaId -> Answer
  resultadoRules?: RulesResult;
  comentarios: FieldComment[];
  parecerDevolucao?: string;
  planoExecucao?: string;
}
