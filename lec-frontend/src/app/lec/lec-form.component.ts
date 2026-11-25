import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { LecApiService, LecSaveRequest } from '../shared/lec-api.service';
import { getApiErrorMessage, getApiValidationErrors } from '../shared/api-errors';
import { Answer, LecData, Question, StatusLEC } from '../shared/models';

@Component({
  selector: 'app-lec-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container py-4" *ngIf="loading" role="status">Carregando LEC...</div>
    <div class="container py-4" *ngIf="!loading && !lec">
      <div class="alert alert-danger" role="alert">{{ errorMessage || 'LEC não encontrado.' }}</div>
      <a routerLink="/lec">Voltar para a lista</a>
    </div>

    <div class="form-page" *ngIf="lec">
      <div class="form-layout">
        <div class="form-main">
          <div class="alert alert-danger" role="alert" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="alert alert-success" role="status" *ngIf="successMessage">{{ successMessage }}</div>

          <section class="form-summary">
            <div class="summary-title">
              <label for="lec-name">NOME DO LEC <b>*</b></label>
              <input id="lec-name" class="lec-title-input" [(ngModel)]="lec.header.nomeSolucao" required maxlength="150" (ngModelChange)="clearFieldError('nomeSolucao')">
              <small class="text-danger" *ngIf="fieldErrors['nomeSolucao']">{{ fieldErrors['nomeSolucao'] }}</small>
              <div class="progress-label"><strong>{{ progress }}% CONCLUÍDO</strong><span>Etapa {{ etapaAtual }} de {{ tabOrder.length }}</span></div>
              <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progress" aria-valuemin="0" aria-valuemax="100">
                <div [style.width.%]="progress"></div>
              </div>
            </div>
            <span class="draft-pill">{{ statusLabel(lec.header.status) }}</span>
          </section>

          <div class="form-tabs">
            <button *ngFor="let tab of tabOrder" [class.active]="secaoAtiva === tab" (click)="secaoAtiva = tab">{{ tabLabel(tab) }}</button>
          </div>

          <div class="form-card classification-card" *ngIf="secaoAtiva === 'CLASSIFICACAO'">
            <div class="field-grid">
              <div>
                <label for="classification-group">GRUPO DA SOLUÇÃO <b>*</b></label>
                <select id="classification-group" class="form-select" [class.is-invalid]="fieldErrors['classification.grupo']" [(ngModel)]="classification.grupo" (ngModelChange)="clearFieldError('classification.grupo')" required>
                  <option value="">Selecione</option>
                  <option *ngFor="let group of classificationGroups" [value]="group">{{ group }}</option>
                </select>
                <small class="text-danger" *ngIf="fieldErrors['classification.grupo']">{{ fieldErrors['classification.grupo'] }}</small>
              </div>
              <div>
                <label for="classification-type">TIPO DE SOLUÇÃO <b>*</b></label>
                <input id="classification-type" type="text" class="form-control" [class.is-invalid]="fieldErrors['classification.tipo']" [(ngModel)]="classification.tipo" (ngModelChange)="clearFieldError('classification.tipo')" maxlength="150" placeholder="Ex: Portal Web, API, Pipeline de Dados" required>
                <small class="text-danger" *ngIf="fieldErrors['classification.tipo']">{{ fieldErrors['classification.tipo'] }}</small>
              </div>
              <div>
                <label for="classification-subtype">SUBTIPO DA SOLUÇÃO</label>
                <input id="classification-subtype" type="text" class="form-control" [(ngModel)]="classification.subtipo" maxlength="150">
              </div>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="lec.header.status === 'DEVOLVIDO' && lec.parecerDevolucao">
            <strong>LEC devolvido:</strong> {{ lec.parecerDevolucao }}
          </div>

          <div class="form-card" *ngIf="secaoAtiva !== 'CLASSIFICACAO'">
            <p *ngIf="loadingQuestions" role="status">Carregando perguntas...</p>
            <div *ngFor="let q of getQuestionsBySecao(secaoAtiva)" class="question-block">
              <label class="question-label" [attr.for]="'question-' + q.id">{{ q.enunciado }} <b *ngIf="q.obrigatoria">*</b></label>

              <textarea *ngIf="q.tipoResposta === 'TEXTO'" [id]="'question-' + q.id" class="question-textarea"
                [class.is-invalid]="fieldErrors['respostas.' + q.id]" [ngModel]="getRespostaValor(q.id)"
                (ngModelChange)="setResposta(q.id, $event)" [placeholder]="'Digite sua resposta...'"
                [required]="q.obrigatoria" [attr.maxlength]="q.id === 'etica_2' ? 4000 : 10000"></textarea>

              <div class="option-grid" *ngIf="q.tipoResposta === 'OPCOES'">
                <label class="option-card" *ngFor="let opt of q.opcoes" [class.selected]="getRespostaValor(q.id) === opt">
                  <input type="radio" [name]="q.id" [value]="opt" [checked]="getRespostaValor(q.id) === opt" (change)="setResposta(q.id, opt)">
                  <span class="option-icon">{{ optionIcon(opt) }}</span>
                  <strong>{{ opt }}</strong>
                </label>
              </div>
              <small class="text-danger" *ngIf="fieldErrors['respostas.' + q.id]">{{ fieldErrors['respostas.' + q.id] }}</small>

              <div class="mt-2" *ngIf="getComentariosCampo(q.id).length > 0">
                <div class="alert alert-warning py-2 mb-1" *ngFor="let comment of getComentariosCampo(q.id)">
                  <small>{{ comment.texto }}</small>
                </div>
              </div>
            </div>

            <ng-container *ngIf="secaoAtiva === 'RESULTADO'">
              <h4>Resultado calculado</h4>
              <p class="text-muted">Indicadores calculados pelo backend a partir das respostas persistidas.</p>
              <div class="row mt-4">
                <div class="col-md-6">
                  <div class="card bg-light p-3 mb-3">
                    <h5>Pontuação de Pertinência</h5>
                    <div class="display-4 fw-bold text-primary">
                      {{ lec.resultadoRules?.pontuacaoPertinencia ?? '—' }} <small class="fs-6 text-muted">/ 100</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light p-3 mb-3">
                    <h5>Indicadores</h5>
                    <ul class="list-group">
                      <li class="list-group-item d-flex justify-content-between">RAT <span>{{ lec.resultadoRules?.indicadorRAT ? 'Ativado' : 'Não requerido' }}</span></li>
                      <li class="list-group-item d-flex justify-content-between">RIPD <span>{{ lec.resultadoRules?.indicadorRIPD ? 'Obrigatório' : 'Não requerido' }}</span></li>
                      <li class="list-group-item d-flex justify-content-between">AIA <span>{{ lec.resultadoRules?.indicadorAIA ? 'Ativado' : 'Não requerido' }}</span></li>
                      <li class="list-group-item d-flex justify-content-between">GRSI <span>{{ lec.resultadoRules?.indicadorGRSI ? 'Ativado' : 'Não requerido' }}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="mt-3" *ngIf="lec.resultadoRules?.detalhes?.length">
                <h5>Detalhes do cálculo</h5>
                <ul><li *ngFor="let detail of lec.resultadoRules?.detalhes">{{ detail }}</li></ul>
              </div>
            </ng-container>
          </div>

          <div class="form-actions">
            <button class="secondary-action" type="button" routerLink="/lec">× &nbsp; CANCELAR</button>
            <button class="save-action" type="button" (click)="salvar()" [disabled]="saving">{{ saving ? 'SALVANDO...' : '▣ &nbsp; SALVAR RASCUNHO' }}</button>
            <button class="next-action" type="button" [disabled]="etapaAtual === tabOrder.length" (click)="avancarAba()">PRÓXIMA ABA &nbsp; ›</button>
            <button class="stage-action" type="button" *ngIf="lec.header.status === 'RASCUNHO' || lec.header.status === 'DEVOLVIDO'" (click)="enviarRevisao()" [disabled]="saving">{{ saving ? 'ENVIANDO...' : 'PRÓXIMA ETAPA &nbsp; ›' }}</button>
          </div>
        </div>

        <aside class="assistant-card">
          <div class="assistant-heading"><span>♧</span><div><strong>ASSISTENTE IA-AUGMENTED</strong><small>Integração externa necessária</small></div></div>
          <label for="assistant-description">DESCREVA O PROJETO EM LINGUAGEM SIMPLES</label>
          <textarea id="assistant-description" disabled placeholder="Assistente indisponível até configurar um provedor de IA."></textarea>
          <button class="assistant-button" type="button" disabled>GERAR SUGESTÕES</button>
          <small class="text-muted">Nenhum provedor de IA está configurado neste projeto.</small>
        </aside>
      </div>
    </div>
  `
})
export class LecFormComponent implements OnInit {
  lec?: LecData;
  secaoAtiva = 'CLASSIFICACAO';
  questions: Question[] = [];
  classificationGroups: string[] = [];
  classification = { grupo: '', tipo: '', subtipo: '' };
  respostasLocais: Record<string, Answer> = {};
  fieldErrors: Record<string, string> = {};
  errorMessage = '';
  successMessage = '';
  loading = true;
  loadingQuestions = true;
  saving = false;
  readonly tabOrder = ['CLASSIFICACAO', 'ESCOPO', 'CONTEXTO', 'SEGURANCA', 'PPD', 'RESULTADO'];

  constructor(
    private route: ActivatedRoute,
    private lecService: LecApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'Identificador do LEC inválido.';
      return;
    }

    this.lecService.getQuestions().subscribe({
      next: questions => {
        this.questions = questions;
        this.loadingQuestions = false;
      },
      error: error => {
        this.errorMessage = getApiErrorMessage(error);
        this.loadingQuestions = false;
      }
    });
    this.lecService.getClassificationGroups().subscribe({
      next: groups => this.classificationGroups = groups,
      error: error => this.errorMessage = getApiErrorMessage(error)
    });
    this.lecService.getLec(id).subscribe({
      next: lec => {
        this.lec = lec;
        this.classification = { grupo: lec.classification?.grupo || '', tipo: lec.classification?.tipo || '', subtipo: lec.classification?.subtipo || '' };
        this.respostasLocais = { ...lec.respostas };
        this.loading = false;
      },
      error: error => {
        this.errorMessage = getApiErrorMessage(error);
        this.loading = false;
      }
    });
  }

  getQuestionsBySecao(secao: string): Question[] {
    return this.questions.filter(question => question.secao === secao);
  }

  get progress(): number {
    const completed = [
      this.lec?.header.nomeSolucao,
      this.classification.grupo,
      this.classification.tipo,
      ...this.questions.filter(question => question.obrigatoria).map(question => this.getRespostaValor(question.id))
    ].filter(value => Boolean(value?.trim())).length;
    const total = this.questions.filter(question => question.obrigatoria).length + 3;
    return total ? Math.round((completed / total) * 100) : 0;
  }

  get etapaAtual(): number {
    return this.tabOrder.indexOf(this.secaoAtiva) + 1;
  }

  tabLabel(tab: string): string {
    return tab === 'CLASSIFICACAO' ? 'CLASSIFICAÇÃO' : tab === 'RESULTADO' ? 'ÉTICA' : tab;
  }

  statusLabel(status: StatusLEC): string {
    return status === StatusLEC.EM_REVISAO ? 'EM REVISÃO' : status;
  }

  avancarAba(): void {
    if (this.etapaAtual < this.tabOrder.length) this.secaoAtiva = this.tabOrder[this.etapaAtual];
  }

  getRespostaValor(perguntaId: string): string {
    return this.respostasLocais[perguntaId]?.valor || '';
  }

  setResposta(perguntaId: string, valor: string): void {
    this.respostasLocais[perguntaId] = {
      perguntaId,
      valor,
      origem: 'USUARIO',
      atualizadoEm: new Date()
    };
    this.clearFieldError(`respostas.${perguntaId}`);
  }

  getComentariosCampo(perguntaId: string) {
    return this.lec?.comentarios.filter(comment => comment.perguntaId === perguntaId && !comment.resolvido) || [];
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

  clearFieldError(field: string): void {
    delete this.fieldErrors[field];
    this.errorMessage = '';
  }

  salvar(): void {
    if (!this.lec || this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.lecService.updateLec(this.lec.header.id, this.buildRequest()).subscribe({
      next: lec => {
        this.lec = lec;
        this.saving = false;
        this.successMessage = 'Alterações salvas com sucesso.';
      },
      error: error => this.handleSaveError(error)
    });
  }

  enviarRevisao(): void {
    if (!this.lec || this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
    this.lecService.updateLec(this.lec.header.id, this.buildRequest()).pipe(
      switchMap(() => this.lecService.submitLec(this.lec!.header.id))
    ).subscribe({
      next: () => {
        this.saving = false;
        void this.router.navigate(['/lec']);
      },
      error: error => this.handleSaveError(error)
    });
  }

  private buildRequest(): LecSaveRequest {
    const answers: Record<string, string> = {};
    for (const [id, answer] of Object.entries(this.respostasLocais)) answers[id] = answer.valor;
    return {
      nomeSolucao: this.lec?.header.nomeSolucao || '',
      especialistaResponsavel: this.lec?.header.especialistaResponsavel || '',
      classification: { ...this.classification },
      respostas: answers
    };
  }

  private handleSaveError(error: unknown): void {
    this.saving = false;
    this.errorMessage = getApiErrorMessage(error);
    this.fieldErrors = getApiValidationErrors(error);
  }
}
