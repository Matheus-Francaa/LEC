import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockLecService } from '../shared/mock-lec.service';
import { QUESTIONS_MOCK } from '../shared/questions-mock';
import { LecData, Question, Answer, StatusLEC } from '../shared/models';

@Component({
  selector: 'app-lec-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="form-page" *ngIf="lec">
      <div class="form-layout">
        <div class="form-main">
          <section class="form-summary">
            <div class="summary-title">
              <label for="lec-name">NOME DO LEC <b>*</b></label>
              <input id="lec-name" class="lec-title-input" [(ngModel)]="lec.header.nomeSolucao">
              <div class="progress-label"><strong>{{ progress }}% CONCLUÍDO</strong><span>Etapa {{ etapaAtual }} de {{ tabOrder.length }}</span></div>
              <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progress" aria-valuemin="0" aria-valuemax="100">
                <div [style.width.%]="progress"></div>
              </div>
            </div>
            <span class="draft-pill">{{ lec.header.status === 'EM_REVISAO' ? 'EM REVISÃO' : lec.header.status }}</span>
          </section>

          <div class="form-tabs">
            <button [class.active]="secaoAtiva === 'CLASSIFICACAO'" (click)="secaoAtiva = 'CLASSIFICACAO'">CLASSIFICAÇÃO</button>
            <button [class.active]="secaoAtiva === 'ESCOPO'" (click)="secaoAtiva = 'ESCOPO'">ESCOPO</button>
            <button [class.active]="secaoAtiva === 'CONTEXTO'" (click)="secaoAtiva = 'CONTEXTO'">CONTEXTO</button>
            <button [class.active]="secaoAtiva === 'SEGURANCA'" (click)="secaoAtiva = 'SEGURANCA'">SEGURANÇA</button>
            <button [class.active]="secaoAtiva === 'PPD'" (click)="secaoAtiva = 'PPD'">PPD</button>
            <button [class.active]="secaoAtiva === 'RESULTADO'" (click)="secaoAtiva = 'RESULTADO'">ÉTICA</button>
          </div>

          <div class="form-card classification-card" *ngIf="secaoAtiva === 'CLASSIFICACAO'">
            <div class="field-grid">
              <div>
                <label>GRUPO DA SOLUÇÃO <b>*</b></label>
          <select class="form-select" [(ngModel)]="classification.grupo">
            <option value="Transacional">Transacional</option>
            <option value="Analytics">Analytics</option>
            <option value="Inteligência Artificial">Inteligência Artificial (IA)</option>
            <option value="Infraestrutura">Infraestrutura</option>
          </select>
              </div>
              <div>
                <label>TIPO DE SOLUÇÃO <b>*</b></label>
          <input type="text" class="form-control" [(ngModel)]="classification.tipo" placeholder="Ex: Portal Web, API, Pipeline de Dados">
              </div>
            </div>
          </div>
          <div class="alert alert-danger" *ngIf="lec.header.status === 'DEVOLVIDO' && lec.parecerDevolucao">
            <strong>LEC Devolvido pelo Especialista:</strong> {{ lec.parecerDevolucao }}
          </div>

      <!-- Conteúdo das Abas de Perguntas (ESCOPO, CONTEXTO, PPD, SEGURANÇA) -->
          <div class="form-card" *ngIf="secaoAtiva !== 'CLASSIFICACAO' && secaoAtiva !== 'RESULTADO'">
        <div *ngFor="let q of getQuestionsBySecao(secaoAtiva)" class="question-block">
          <label class="question-label">{{ questionTitle(q) }} <b>*</b></label>
          <p class="question-help" *ngIf="questionHelp(q)">{{ questionHelp(q) }}</p>

          <textarea *ngIf="q.tipoResposta === 'TEXTO'" class="question-textarea"
            [ngModel]="getRespostaValor(q.id)" (ngModelChange)="setResposta(q.id, $event)"
            [placeholder]="questionPlaceholder(q)"></textarea>

          <div class="option-grid" *ngIf="q.tipoResposta === 'OPCOES'">
            <label class="option-card" *ngFor="let opt of q.opcoes" [class.selected]="getRespostaValor(q.id) === opt">
              <input type="radio" [name]="q.id" [value]="opt"
                [checked]="getRespostaValor(q.id) === opt"
                (change)="setResposta(q.id, opt)">
              <span class="option-icon">{{ optionIcon(opt) }}</span>
              <strong>{{ opt }}</strong>
            </label>
          </div>

          <div class="mt-2" *ngIf="getComentariosCampo(q.id).length > 0">
            <div class="alert alert-warning py-2 mb-1" *ngFor="let comm of getComentariosCampo(q.id)">
              <small><strong>{{ comm.autorNome }}:</strong> {{ comm.texto }}</small>
            </div>
          </div>
        </div>

      </div>

      <!-- Conteúdo da Aba: MOTOR DE REGRAS & PONTUAÇÃO -->
          <div class="form-card" *ngIf="secaoAtiva === 'RESULTADO'">
        <div class="question-block ethics-question">
          <label class="question-title">A solução utiliza Inteligência Artificial? <b>*</b></label>
          <div class="option-grid">
            <label class="option-card" *ngFor="let opt of ['Sim', 'Não', 'Não se aplica', 'Não é possível responder']" [class.selected]="getRespostaValor('etica_1') === opt">
              <input type="radio" name="etica_1" [value]="opt" [checked]="getRespostaValor('etica_1') === opt" (change)="setResposta('etica_1', opt)">
              <span class="option-icon">{{ optionIcon(opt) }}</span>
              <strong>{{ opt }}</strong>
            </label>
          </div>
          <div class="ethics-extra">
            <label>RISCOS DE VIÉS E MEDIDAS DE MITIGAÇÃO</label>
            <textarea class="question-textarea" [ngModel]="getRespostaValor('etica_2')" (ngModelChange)="setResposta('etica_2', $event)" placeholder="Descreva possíveis vieses e como serão tratados..."></textarea>
          </div>
        </div>
        <h4>Épico 3 — Motor de Regras e Cálculo Automático</h4>
        <p class="text-muted">Resultado determinístico calculado a partir das respostas do LEC.</p>

        <div class="row mt-4">
          <div class="col-md-6">
            <div class="card bg-light p-3 mb-3">
              <h5>Pontuação de Pertinência</h5>
              <div class="display-4 fw-bold text-primary">
                {{ lec.resultadoRules?.pontuacaoPertinencia || 0 }} <small class="fs-6 text-muted">/ 100</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card bg-light p-3 mb-3">
              <h5>Indicadores Condicionais</h5>
              <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  RAT (Relatório de Avaliação de Tratamento)
                  <span class="badge" [ngClass]="lec.resultadoRules?.indicadorRAT ? 'bg-success' : 'bg-secondary'">
                    {{ lec.resultadoRules?.indicadorRAT ? 'Ativado' : 'Não Requerido' }}
                  </span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  RIPD (Relatório de Impacto à Proteção de Dados)
                  <span class="badge" [ngClass]="lec.resultadoRules?.indicadorRIPD ? 'bg-danger' : 'bg-secondary'">
                    {{ lec.resultadoRules?.indicadorRIPD ? 'Obrigatório' : 'Não Requerido' }}
                  </span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  AIA (Avaliação de Impacto de Algoritmo)
                  <span class="badge" [ngClass]="lec.resultadoRules?.indicadorAIA ? 'bg-warning text-dark' : 'bg-secondary'">
                    {{ lec.resultadoRules?.indicadorAIA ? 'Ativado' : 'Não Requerido' }}
                  </span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  GRSI (Gestão de Risco de Segurança da Informação)
                  <span class="badge" [ngClass]="lec.resultadoRules?.indicadorGRSI ? 'bg-info text-dark' : 'bg-secondary'">
                    {{ lec.resultadoRules?.indicadorGRSI ? 'Ativado' : 'Não Requerido' }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <h5>Detalhes do Cálculo</h5>
          <ul>
            <li *ngFor="let det of lec.resultadoRules?.detalhes">{{ det }}</li>
          </ul>
        </div>
          </div>
          <div class="form-actions">
            <button class="secondary-action" routerLink="/lec">× &nbsp; CANCELAR</button>
            <button class="save-action" (click)="salvar()">▣ &nbsp; SALVAR RASCUNHO</button>
            <button class="next-action" [disabled]="etapaAtual === tabOrder.length" (click)="avancarAba()">PRÓXIMA ABA &nbsp; ›</button>
            <button class="stage-action" *ngIf="lec.header.status === 'RASCUNHO' || lec.header.status === 'DEVOLVIDO'" (click)="enviarRevisao()">PRÓXIMA ETAPA &nbsp; ›</button>
          </div>
        </div>
        <aside class="assistant-card">
          <div class="assistant-heading"><span>♧</span><div><strong>ASSISTENTE IA-AUGMENTED</strong><small>Sugestões baseadas em normas</small></div></div>
          <label for="assistant-description">DESCREVA O PROJETO EM LINGUAGEM SIMPLES</label>
          <textarea id="assistant-description" placeholder="Ex: Sistema de login usando biometria e dados de saúde..."></textarea>
          <button class="assistant-button" type="button">♧ &nbsp; GERAR SUGESTÕES</button>
        </aside>
      </div>
    </div>
  `
})
export class LecFormComponent implements OnInit {
  lec?: LecData;
  secaoAtiva: string = 'CLASSIFICACAO';
  questions: Question[] = QUESTIONS_MOCK;
  classification: any = { grupo: 'Transacional', tipo: '', subtipo: '' };
  respostasLocais: Record<string, Answer> = {};
  readonly tabOrder = ['CLASSIFICACAO', 'ESCOPO', 'CONTEXTO', 'SEGURANCA', 'PPD', 'RESULTADO'];

  constructor(
    private route: ActivatedRoute,
    private lecService: MockLecService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.lecService.getLecById(id);
      if (found) {
        this.lec = found;
        if (found.classification) {
          this.classification = { ...found.classification };
        }
        if (found.respostas) {
          this.respostasLocais = { ...found.respostas };
        }
      }
    }
  }

  getQuestionsBySecao(secao: string): Question[] {
    return this.questions.filter(q => q.secao === secao);
  }

  get progress(): number {
    const completedFields = [
      this.lec?.header.nomeSolucao,
      this.classification.grupo,
      this.classification.tipo,
      ...this.questions.map(question => this.getRespostaValor(question.id))
    ].filter(value => Boolean(value?.trim())).length;
    const totalFields = this.questions.length + 2;
    return Math.round((completedFields / totalFields) * 100);
  }

  get etapaAtual(): number {
    return this.tabOrder.indexOf(this.secaoAtiva) + 1;
  }

  questionTitle(question: Question): string {
    const titles: Record<string, string> = {
      esc_1: 'ONP — OBJETIVOS DE NEGÓCIO E PROBLEMA',
      esc_2: 'NFP — NECESSIDADES E FUNCIONALIDADES PRELIMINARES',
      ctx_1: 'QUAL O CONTEXTO ORGANIZACIONAL DA SOLUÇÃO?'
    };
    return titles[question.id] || question.enunciado;
  }

  questionHelp(question: Question): string {
    return question.id === 'ctx_1'
      ? 'Usuários, áreas envolvidas, volume de uso e integrações com terceiros.'
      : '';
  }

  questionPlaceholder(question: Question): string {
    const placeholders: Record<string, string> = {
      esc_1: 'Automatizar o atendimento de dúvidas frequentes sobre benefícios...',
      esc_2: 'Descreva as funcionalidades preliminares da solução...',
      ctx_1: 'Ex: Usado por 9 mil empregados, integra com API de terceiros...'
    };
    return placeholders[question.id] || 'Digite sua resposta...';
  }

  optionIcon(option: string): string {
    const icons: Record<string, string> = {
      Sim: '☑',
      Não: '✕',
      'Não se aplica': '⊖',
      'Não é possível responder': '□'
    };
    return icons[option] || '○';
  }

  avancarAba(): void {
    if (this.etapaAtual < this.tabOrder.length) {
      this.secaoAtiva = this.tabOrder[this.etapaAtual];
    }
  }

  getRespostaValor(perguntaId: string): string {
    return this.respostasLocais[perguntaId]?.valor || '';
  }

  setResposta(perguntaId: string, valor: string): void {
    this.respostasLocais[perguntaId] = {
      perguntaId,
      valor,
      origem: 'USUARIO',
      atualizadoEm: new Date(),
      atualizadoPor: 'Carlos Dev'
    };
  }

  getComentariosCampo(perguntaId: string): any[] {
    if (!this.lec || !this.lec.comentarios) return [];
    return this.lec.comentarios.filter(c => c.perguntaId === perguntaId && !c.resolvido);
  }

  salvar(): void {
    if (this.lec) {
      this.lecService.updateNomeSolucao(this.lec.header.id, this.lec.header.nomeSolucao);
      this.lecService.saveRespostas(this.lec.header.id, this.respostasLocais, this.classification);
      alert('Alterações salvas com sucesso!');
    }
  }

  enviarRevisao(): void {
    if (this.lec) {
      this.lecService.updateNomeSolucao(this.lec.header.id, this.lec.header.nomeSolucao);
      this.lecService.saveRespostas(this.lec.header.id, this.respostasLocais, this.classification);
      this.lecService.enviarParaRevisao(this.lec.header.id);
      alert('LEC enviado para revisão do especialista com sucesso!');
      this.router.navigate(['/lec']);
    }
  }
}
