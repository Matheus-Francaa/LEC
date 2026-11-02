import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockLecService } from '../shared/mock-lec.service';
import { MockAuthService } from '../shared/mock-auth.service';
import { LecData, Role, User, StatusLEC } from '../shared/models';
import { QUESTIONS_MOCK } from '../shared/questions-mock';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5" *ngIf="lec">
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <button class="btn btn-outline-secondary btn-sm mb-2" routerLink="/lec">← Voltar para Lista</button>
          <h2>Análise Crítica & Revisão — {{ lec.header.nomeSolucao }}</h2>
          <p class="text-muted mb-0">Status Atual: <span class="badge bg-primary">{{ lec.header.status }}</span> | Versão v{{ lec.header.versao }}</p>
        </div>
        <div>
          <span class="badge bg-dark fs-6">Perfil: {{ currentUser?.perfil }}</span>
        </div>
      </div>

      <!-- Indicadores Resumidos (Épico 4.1) -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center p-3 shadow-sm">
            <h6>RAT</h6>
            <span class="badge fs-5" [ngClass]="lec.resultadoRules?.indicadorRAT ? 'bg-success' : 'bg-secondary'">
              {{ lec.resultadoRules?.indicadorRAT ? 'Ativado' : 'Não Requerido' }}
            </span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center p-3 shadow-sm">
            <h6>RIPD</h6>
            <span class="badge fs-5" [ngClass]="lec.resultadoRules?.indicadorRIPD ? 'bg-danger' : 'bg-secondary'">
              {{ lec.resultadoRules?.indicadorRIPD ? 'Obrigatório' : 'Não Requerido' }}
            </span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center p-3 shadow-sm">
            <h6>AIA</h6>
            <span class="badge fs-5" [ngClass]="lec.resultadoRules?.indicadorAIA ? 'bg-warning text-dark' : 'bg-secondary'">
              {{ lec.resultadoRules?.indicadorAIA ? 'Ativado' : 'Não Requerido' }}
            </span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center p-3 shadow-sm">
            <h6>GRSI</h6>
            <span class="badge fs-5" [ngClass]="lec.resultadoRules?.indicadorGRSI ? 'bg-info text-dark' : 'bg-secondary'">
              {{ lec.resultadoRules?.indicadorGRSI ? 'Ativado' : 'Não Requerido' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumo das Respostas e Inclusão de Comentários por Campo (Épico 4.5) -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-dark text-white">
          <h5 class="mb-0">Respostas do LEC & Comentários do Especialista</h5>
        </div>
        <div class="card-body">
          <div *ngFor="let q of questions" class="mb-3 pb-3 border-bottom">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ q.codigo }}</strong>: {{ q.enunciado }}
              </div>
              <div class="text-end">
                <span class="badge bg-light text-dark border">
                  {{ lec.respostas[q.id].valor || '[Não respondido]' }}
                </span>
              </div>
            </div>

            <!-- Comentários existentes -->
            <div class="mt-2 ms-3" *ngFor="let c of getComentarios(q.id)">
              <div class="alert alert-secondary py-1 px-2 mb-1 d-flex justify-content-between align-items-center">
                <small><strong>{{ c.autorNome }}:</strong> {{ c.texto }}</small>
                <span class="badge bg-secondary" *ngIf="c.resolvido">Resolvido</span>
              </div>
            </div>

            <!-- Campo para adicionar comentário (Apenas Especialista / Admin) -->
            <div class="mt-2 ms-3 input-group input-group-sm" *ngIf="isEspecialista">
              <input type="text" class="form-control" [(ngModel)]="novoComentario[q.id]" placeholder="Adicionar comentário ou apontar inconsistência...">
              <button class="btn btn-outline-primary" type="button" (click)="adicionarComentario(q.id)">Comentar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações do Especialista: Devolver ou Aprovar (Épico 4.3, 4.6, 4.7) -->
      <div class="card shadow-sm p-4 bg-light" *ngIf="isEspecialista">
        <h4>Parecer do Especialista</h4>
        <p class="text-muted">Você pode devolver o LEC para correções ou aprová-lo registrando o Plano de Execução.</p>

        <div class="mb-3">
          <label class="form-label">Parecer de Devolução (obrigatório para devolver):</label>
          <textarea class="form-control" rows="2" [(ngModel)]="parecerText" placeholder="Explique os pontos que precisam ser corrigidos..."></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Plano de Execução (obrigatório para aprovar):</label>
          <textarea class="form-control" rows="3" [(ngModel)]="planoText" placeholder="Descreva o plano de execução e condicionantes aprovadas..."></textarea>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-danger" (click)="devolver()">Devolver com Parecer</button>
          <button class="btn btn-success" (click)="aprovar()">Aprovar LEC & Registrar Plano</button>
        </div>
      </div>

    </div>
  `
})
export class ReviewComponent implements OnInit {
  lec?: LecData;
  currentUser: User | null = null;
  questions = QUESTIONS_MOCK;
  novoComentario: Record<string, string> = {};
  parecerText: string = '';
  planoText: string = '';

  constructor(
    private route: ActivatedRoute,
    private lecService: MockLecService,
    private authService: MockAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lec = this.lecService.getLecById(id);
    }
  }

  get isEspecialista(): boolean {
    return this.currentUser?.perfil === Role.ESPECIALISTA || this.currentUser?.perfil === Role.ADMIN;
  }

  getComentarios(perguntaId: string): any[] {
    if (!this.lec || !this.lec.comentarios) return [];
    return this.lec.comentarios.filter(c => c.perguntaId === perguntaId);
  }

  adicionarComentario(perguntaId: string): void {
    const texto = this.novoComentario[perguntaId];
    if (!texto || !texto.trim() || !this.lec) return;
    this.lecService.adicionarComentario(this.lec.header.id, perguntaId, texto);
    this.novoComentario[perguntaId] = '';
    alert('Comentário adicionado com sucesso!');
  }

  devolver(): void {
    if (!this.parecerText.trim() || !this.lec) {
      alert('Informe o parecer de devolução.');
      return;
    }
    this.lecService.devolverLec(this.lec.header.id, this.parecerText);
    alert('LEC devolvido ao responsável com sucesso!');
    this.router.navigate(['/lec']);
  }

  aprovar(): void {
    if (!this.planoText.trim() || !this.lec) {
      alert('Informe o plano de execução para aprovação.');
      return;
    }
    this.lecService.aprovarLec(this.lec.header.id, this.planoText);
    alert('LEC aprovado com sucesso!');
    this.router.navigate(['/lec']);
  }
}
