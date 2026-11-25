import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LecApiService } from '../shared/lec-api.service';
import { getApiErrorMessage } from '../shared/api-errors';
import { LecData, Question, StatusLEC } from '../shared/models';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5" *ngIf="loading" role="status">Carregando revisão...</div>
    <div class="container mt-4 mb-5" *ngIf="!loading && !lec">
      <div class="alert alert-danger" role="alert">{{ errorMessage || 'LEC não encontrado.' }}</div>
      <a routerLink="/lec">Voltar para a lista</a>
    </div>
    <div class="container mt-4 mb-5" *ngIf="lec">
      <div class="alert alert-danger" role="alert" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="alert alert-success" role="status" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <button class="btn btn-outline-secondary btn-sm mb-2" routerLink="/lec">← Voltar para Lista</button>
          <h1>Análise Crítica &amp; Revisão — {{ lec.header.nomeSolucao }}</h1>
          <p class="text-muted mb-0">Status: <span class="badge bg-primary">{{ statusLabel(lec.header.status) }}</span> | Versão v{{ lec.header.versao }}</p>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3" *ngFor="let indicator of indicators">
          <div class="card text-center p-3 shadow-sm">
            <h2 class="h6">{{ indicator.label }}</h2>
            <span class="badge fs-6" [ngClass]="indicator.value ? 'bg-success' : 'bg-secondary'">{{ indicator.value ? indicator.active : 'Não requerido' }}</span>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header bg-dark text-white"><h2 class="h5 mb-0">Respostas do LEC e comentários</h2></div>
        <div class="card-body">
          <p *ngIf="loadingQuestions" role="status">Carregando perguntas...</p>
          <div *ngFor="let question of questions" class="mb-3 pb-3 border-bottom">
            <div class="d-flex justify-content-between gap-3">
              <div><strong>{{ question.codigo }}</strong>: {{ question.enunciado }}</div>
              <div class="text-end"><span class="badge bg-light text-dark border">{{ respostaValor(question.id) }}</span></div>
            </div>
            <div class="mt-2 ms-3" *ngFor="let comment of getComentarios(question.id)">
              <div class="alert alert-secondary py-1 px-2 mb-1 d-flex justify-content-between align-items-center gap-2">
                <small>{{ comment.texto }} <span class="text-muted">{{ comment.criadoEm | date:'dd/MM/yyyy HH:mm' }}</span></small>
                <button class="btn btn-sm btn-outline-danger" type="button" (click)="excluirComentario(comment.id)" [disabled]="deletingCommentId === comment.id">Excluir</button>
              </div>
            </div>
            <div class="mt-2 ms-3 input-group input-group-sm" *ngIf="lec.header.status === 'EM_REVISAO'">
              <input type="text" class="form-control" [(ngModel)]="novoComentario[question.id]" [attr.aria-label]="'Comentário para ' + question.codigo" placeholder="Adicionar comentário ou apontar inconsistência...">
              <button class="btn btn-outline-primary" type="button" (click)="adicionarComentario(question.id)" [disabled]="savingCommentId === question.id">Comentar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm p-4 bg-light" *ngIf="lec.header.status === 'EM_REVISAO'">
        <h2 class="h4">Decisão da revisão</h2>
        <p class="text-muted">Registre um parecer para devolver ou um plano de execução para aprovar.</p>
        <div class="mb-3">
          <label class="form-label" for="return-opinion">Parecer de devolução (obrigatório para devolver)</label>
          <textarea id="return-opinion" class="form-control" rows="2" [(ngModel)]="parecerText" maxlength="4000" required></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label" for="execution-plan">Plano de execução (obrigatório para aprovar)</label>
          <textarea id="execution-plan" class="form-control" rows="3" [(ngModel)]="planoText" maxlength="4000" required></textarea>
        </div>
        <div class="d-flex gap-3">
          <button class="btn btn-danger" type="button" (click)="devolver()" [disabled]="savingDecision">{{ savingDecision ? 'Salvando...' : 'Devolver com Parecer' }}</button>
          <button class="btn btn-success" type="button" (click)="aprovar()" [disabled]="savingDecision">{{ savingDecision ? 'Salvando...' : 'Aprovar LEC e Registrar Plano' }}</button>
        </div>
      </div>
    </div>
  `
})
export class ReviewComponent implements OnInit {
  lec?: LecData;
  questions: Question[] = [];
  novoComentario: Record<string, string> = {};
  parecerText = '';
  planoText = '';
  loading = true;
  loadingQuestions = true;
  savingDecision = false;
  savingCommentId: string | null = null;
  deletingCommentId: string | null = null;
  errorMessage = '';
  successMessage = '';

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
    this.carregarLec(id);
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
  }

  get indicators() {
    const rules = this.lec?.resultadoRules;
    return [
      { label: 'RAT', value: rules?.indicadorRAT, active: 'Ativado' },
      { label: 'RIPD', value: rules?.indicadorRIPD, active: 'Obrigatório' },
      { label: 'AIA', value: rules?.indicadorAIA, active: 'Ativado' },
      { label: 'GRSI', value: rules?.indicadorGRSI, active: 'Ativado' }
    ];
  }

  statusLabel(status: StatusLEC): string {
    return status === StatusLEC.EM_REVISAO ? 'EM REVISÃO' : status;
  }

  respostaValor(perguntaId: string): string {
    return this.lec?.respostas[perguntaId]?.valor || '[Não respondido]';
  }

  getComentarios(perguntaId: string) {
    return this.lec?.comentarios.filter(comment => comment.perguntaId === perguntaId) || [];
  }

  adicionarComentario(perguntaId: string): void {
    const text = this.novoComentario[perguntaId]?.trim();
    if (!text || !this.lec || this.savingCommentId) return;
    this.savingCommentId = perguntaId;
    this.errorMessage = '';
    this.lecService.addComment(this.lec.header.id, perguntaId, text).subscribe({
      next: comment => {
        this.lec?.comentarios.push(comment);
        this.novoComentario[perguntaId] = '';
        this.savingCommentId = null;
        this.successMessage = 'Comentário salvo.';
      },
      error: error => {
        this.savingCommentId = null;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  excluirComentario(commentId: string): void {
    if (!this.lec || this.deletingCommentId || !window.confirm('Excluir este comentário?')) return;
    this.deletingCommentId = commentId;
    this.errorMessage = '';
    this.lecService.deleteComment(this.lec.header.id, commentId).subscribe({
      next: () => {
        if (this.lec) this.lec.comentarios = this.lec.comentarios.filter(comment => comment.id !== commentId);
        this.deletingCommentId = null;
        this.successMessage = 'Comentário excluído.';
      },
      error: error => {
        this.deletingCommentId = null;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  devolver(): void {
    if (!this.lec || this.savingDecision) return;
    if (!this.parecerText.trim()) {
      this.errorMessage = 'Informe o parecer de devolução.';
      return;
    }
    this.savingDecision = true;
    this.errorMessage = '';
    this.lecService.returnLec(this.lec.header.id, this.parecerText.trim()).subscribe({
      next: () => {
        this.savingDecision = false;
        void this.router.navigate(['/lec']);
      },
      error: error => {
        this.savingDecision = false;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  aprovar(): void {
    if (!this.lec || this.savingDecision) return;
    if (!this.planoText.trim()) {
      this.errorMessage = 'Informe o plano de execução para aprovação.';
      return;
    }
    this.savingDecision = true;
    this.errorMessage = '';
    this.lecService.approveLec(this.lec.header.id, this.planoText.trim()).subscribe({
      next: () => {
        this.savingDecision = false;
        void this.router.navigate(['/lec']);
      },
      error: error => {
        this.savingDecision = false;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  private carregarLec(id: string): void {
    this.lecService.getLec(id).subscribe({
      next: lec => {
        this.lec = lec;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = getApiErrorMessage(error);
        this.loading = false;
      }
    });
  }
}
