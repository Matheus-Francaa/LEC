import { Injectable } from '@angular/core';
import { LecData, StatusLEC, Answer, FieldComment, RulesResult } from './models';
import { MockAuthService } from './mock-auth.service';

@Injectable({
  providedIn: 'root'
})
export class MockLecService {
  private lecs: LecData[] = [
    {
      header: {
        id: 'lec-001',
        nomeSolucao: 'Portal de Atendimento Cidadão',
        responsavelId: 'u1',
        especialistaId: 'u2',
        status: StatusLEC.RASCUNHO,
        versao: 1,
        criadoEm: new Date('2026-02-01T10:00:00Z'),
        atualizadoEm: new Date('2026-02-01T12:00:00Z')
      },
      classification: {
        grupo: 'Transacional',
        tipo: 'Portal Web',
        subtipo: 'Autenticado'
      },
      respostas: {
        'esc_1': { perguntaId: 'esc_1', valor: 'Portal web para cidadãos solicitarem certidões.', origem: 'USUARIO', atualizadoEm: new Date(), atualizadoPor: 'Carlos Dev' },
        'ctx_1': { perguntaId: 'ctx_1', valor: 'Sim', origem: 'USUARIO', atualizadoEm: new Date(), atualizadoPor: 'Carlos Dev' }
      },
      comentarios: [],
      resultadoRules: {
        pontuacaoPertinencia: 45,
        indicadorRAT: true,
        indicadorRIPD: false,
        indicadorAIA: false,
        indicadorGRSI: true,
        detalhes: ['Pertinência calculada com base na abrangência e volume.', 'RAT ativado por tratar dados pessoais.']
      }
    },
    {
      header: {
        id: 'lec-002',
        nomeSolucao: 'Sistema de Análise de Riscos IA',
        responsavelId: 'u1',
        especialistaId: 'u2',
        status: StatusLEC.EM_REVISAO,
        versao: 1,
        criadoEm: new Date('2026-01-15T08:00:00Z'),
        atualizadoEm: new Date('2026-01-20T14:30:00Z')
      },
      classification: {
        grupo: 'Inteligência Artificial',
        tipo: 'Machine Learning',
        subtipo: 'Classificador de Risco'
      },
      respostas: {
        'esc_1': { perguntaId: 'esc_1', valor: 'Modelo de IA para triagem de processos.', origem: 'USUARIO', atualizadoEm: new Date(), atualizadoPor: 'Carlos Dev' },
        'ctx_1': { perguntaId: 'ctx_1', valor: 'Sim', origem: 'USUARIO', atualizadoEm: new Date(), atualizadoPor: 'Carlos Dev' },
        'ctx_2': { perguntaId: 'ctx_2', valor: 'Sim', origem: 'USUARIO', atualizadoEm: new Date(), atualizadoPor: 'Carlos Dev' }
      },
      comentarios: [
        {
          id: 'c-1',
          perguntaId: 'ctx_2',
          autorId: 'u2',
          autorNome: 'Ana Compliance',
          texto: 'Favor detalhar se há salvaguardas para este grupo vulnerável.',
          resolvido: false,
          versaoLec: 1,
          criadoEm: new Date()
        }
      ],
      resultadoRules: {
        pontuacaoPertinencia: 85,
        indicadorRAT: true,
        indicadorRIPD: true,
        indicadorAIA: true,
        indicadorGRSI: true,
        detalhes: ['Alto volume e uso de IA com dados sensíveis.', 'RIPD obrigatório por tratar grupos vulneráveis.']
      }
    }
  ];

  constructor(private authService: MockAuthService) {}

  getLecs(): LecData[] {
    return this.lecs;
  }

  getLecById(id: string): LecData | undefined {
    return this.lecs.find(l => l.header.id === id);
  }

  createLec(nomeSolucao: string, especialistaId: string): LecData {
    const user = this.authService.getCurrentUser();
    const newLec: LecData = {
      header: {
        id: 'lec-' + Math.random().toString(36).substr(2, 6),
        nomeSolucao,
        responsavelId: user ? user.id : 'u1',
        especialistaId,
        status: StatusLEC.RASCUNHO,
        versao: 1,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      },
      classification: {
        grupo: 'Transacional',
        tipo: 'Sistema Web'
      },
      respostas: {},
      comentarios: [],
      resultadoRules: {
        pontuacaoPertinencia: 10,
        indicadorRAT: false,
        indicadorRIPD: false,
        indicadorAIA: false,
        indicadorGRSI: false,
        detalhes: ['Pontuação inicial padrão.']
      }
    };
    this.lecs.push(newLec);
    return newLec;
  }

  saveRespostas(id: string, respostas: Record<string, Answer>, classification?: any): void {
    const lec = this.getLecById(id);
    if (lec) {
      lec.respostas = { ...lec.respostas, ...respostas };
      if (classification) {
        lec.classification = classification;
      }

      lec.header.atualizadoEm = new Date();
      // Recalcular regras simples
      this.recalculateRules(lec);
    }
  }

  updateNomeSolucao(id: string, nomeSolucao: string): void {
    const lec = this.getLecById(id);
    if (lec && nomeSolucao.trim()) {
      lec.header.nomeSolucao = nomeSolucao.trim();
      lec.header.atualizadoEm = new Date();
    }
  }

  enviarParaRevisao(id: string): boolean {
    const lec = this.getLecById(id);
    if (lec) {
      lec.header.status = StatusLEC.EM_REVISAO;
      lec.header.atualizadoEm = new Date();
      return true;
    }
    return false;
  }

  devolverLec(id: string, parecer: string): boolean {
    const lec = this.getLecById(id);
    if (lec) {
      lec.header.status = StatusLEC.DEVOLVIDO;
      lec.parecerDevolucao = parecer;
      lec.header.versao += 1;
      lec.header.atualizadoEm = new Date();
      return true;
    }
    return false;
  }

  aprovarLec(id: string, planoExecucao: string): boolean {
    const lec = this.getLecById(id);
    if (lec) {
      lec.header.status = StatusLEC.APROVADO;
      lec.planoExecucao = planoExecucao;
      lec.header.atualizadoEm = new Date();
      return true;
    }
    return false;
  }

  adicionarComentario(id: string, perguntaId: string, texto: string): void {
    const lec = this.getLecById(id);
    const user = this.authService.getCurrentUser();
    if (lec && user) {
      const comm: FieldComment = {
        id: 'c-' + Math.random().toString(36).substr(2, 6),
        perguntaId,
        autorId: user.id,
        autorNome: user.nome,
        texto,
        resolvido: false,
        versaoLec: lec.header.versao,
        criadoEm: new Date()
      };
      lec.comentarios.push(comm);
    }
  }

  private recalculateRules(lec: LecData): void {
    let score = 20;
    let rat = false;
    let ripd = false;
    let aia = false;
    let grsi = false;

    Object.values(lec.respostas).forEach(r => {
      if (r.valor === 'Sim') {
        score += 15;
      }
    });

    if (lec.classification?.grupo === 'Inteligência Artificial') {
      score += 25;
      aia = true;
      grsi = true;
    }

    if (lec.respostas['ctx_1']?.valor === 'Sim') {
      rat = true;
    }
    if (lec.respostas['ctx_2']?.valor === 'Sim') {
      ripd = true;
      grsi = true;
    }

    if (score > 100) score = 100;

    lec.resultadoRules = {
      pontuacaoPertinencia: score,
      indicadorRAT: rat,
      indicadorRIPD: ripd,
      indicadorAIA: aia,
      indicadorGRSI: grsi,
      detalhes: [
        `Pontuação de Pertinência calculada: ${score}`,
        rat ? 'RAT (Relatório de Avaliação de Tratamento) ativado.' : 'RAT não requerido.',
        ripd ? 'RIPD (Relatório de Impacto à Proteção de Dados) obrigatório.' : 'RIPD não requerido.',
        aia ? 'AIA (Avaliação de Impacto de Algoritmo) ativado.' : 'AIA não requerido.'
      ]
    };
  }
}
