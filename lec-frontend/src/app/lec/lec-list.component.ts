import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LecApiService } from '../shared/lec-api.service';
import { getApiErrorMessage } from '../shared/api-errors';
import { LecData, StatusLEC } from '../shared/models';

@Component({
  selector: 'app-lec-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="dashboard">
      <div class="alert alert-danger" role="alert" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="alert alert-success" role="status" *ngIf="successMessage">{{ successMessage }}</div>

      <section class="metrics-grid" aria-label="Resumo dos LECs">
        <article class="metric-card"><span>TOTAL</span><strong>{{ lecs.length }}</strong></article>
        <article class="metric-card metric-review"><span>EM REVISÃO</span><strong>{{ countByStatus(StatusLEC.EM_REVISAO) }}</strong></article>
        <article class="metric-card metric-draft"><span>RASCUNHOS</span><strong>{{ countByStatus(StatusLEC.RASCUNHO) }}</strong></article>
        <article class="metric-card metric-approved"><span>APROVADOS</span><strong>{{ countByStatus(StatusLEC.APROVADO) }}</strong></article>
      </section>

      <section class="lec-panel">
        <div class="panel-heading">
          <h1>MEUS LECS</h1>
          <div class="d-flex flex-wrap gap-2">
            <label class="visually-hidden" for="status-filter">Filtrar por status</label>
            <select id="status-filter" class="form-select" [(ngModel)]="filtroStatus">
              <option value="">Todos os status</option>
              <option *ngFor="let status of statuses" [value]="status">{{ statusLabel(status) }}</option>
            </select>
            <button class="outline-button" type="button" (click)="exportarExcel()" [disabled]="loading || lecs.length === 0">▣ &nbsp; EXPORTAR CSV</button>
          </div>
        </div>
        <p *ngIf="loading" role="status">Carregando LECs...</p>
        <div class="table-wrap" *ngIf="!loading">
          <table class="lec-table">
            <thead>
              <tr><th>NOME</th><th>ESPECIALISTA</th><th>STATUS</th><th>ÚLTIMA ATUALIZAÇÃO</th><th>AÇÕES</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let lec of filteredLecs">
                <td class="lec-name">{{ lec.header.nomeSolucao }}</td>
                <td>{{ lec.header.especialistaResponsavel || 'Não atribuído' }}</td>
                <td>
                  <span class="status-pill" [ngClass]="{
                    'status-draft': lec.header.status === 'RASCUNHO',
                    'status-review': lec.header.status === 'EM_REVISAO',
                    'status-returned': lec.header.status === 'DEVOLVIDO',
                    'status-approved': lec.header.status === 'APROVADO'
                  }">{{ statusLabel(lec.header.status) }}</span>
                </td>
                <td>{{ lec.header.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions-cell">
                  <button class="table-action" [routerLink]="['/lec/edit', lec.header.id]" [attr.aria-label]="'Editar ' + lec.header.nomeSolucao">✎</button>
                  <button class="table-action" [routerLink]="['/review', lec.header.id]" [attr.aria-label]="'Revisar ' + lec.header.nomeSolucao">⌕</button>
                  <button class="table-action text-danger" type="button" (click)="excluirLec(lec)" [disabled]="deletingId === lec.header.id" [attr.aria-label]="'Excluir ' + lec.header.nomeSolucao">×</button>
                </td>
              </tr>
              <tr *ngIf="filteredLecs.length === 0">
                <td colspan="5" class="empty-state">{{ lecs.length ? 'Nenhum LEC corresponde ao filtro.' : 'Nenhum LEC cadastrado.' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" *ngIf="openModal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <div class="modal-dialog">
          <form class="modal-content" (ngSubmit)="criarLec()">
            <div class="modal-header">
              <h2 class="modal-title fs-5" id="create-title">Criar Novo LEC</h2>
              <button type="button" class="btn-close" aria-label="Fechar" (click)="openModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label" for="new-lec-name">Nome da Solução Digital *</label>
                <input id="new-lec-name" type="text" class="form-control" name="nomeSolucao" [(ngModel)]="novoNomeSolucao" required maxlength="150" placeholder="Ex: Sistema de Gestão de Frota">
              </div>
              <div class="mb-3">
                <label class="form-label" for="new-lec-specialist">Especialista Responsável</label>
                <input id="new-lec-specialist" type="text" class="form-control" name="especialista" [(ngModel)]="novoEspecialista" maxlength="150">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="openModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Criando...' : 'Criar LEC' }}</button>
            </div>
          </form>
        </div>
      </div>
      <button class="gradient-button floating-new-button" type="button" (click)="openModal = true">＋ &nbsp; NOVO LEC</button>
    </main>
  `
})
export class LecListComponent implements OnInit {
  readonly StatusLEC = StatusLEC;
  lecs: LecData[] = [];
  readonly statuses = Object.values(StatusLEC);
  filtroStatus = '';
  openModal = false;
  novoNomeSolucao = '';
  novoEspecialista = '';
  loading = false;
  saving = false;
  deletingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private lecService: LecApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarLecs();
    this.route.queryParamMap.subscribe(params => {
      if (params.get('novo') === 'true') {
        this.openModal = true;
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { novo: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  get filteredLecs(): LecData[] {
    return this.filtroStatus
      ? this.lecs.filter(lec => lec.header.status === this.filtroStatus)
      : this.lecs;
  }

  countByStatus(status: StatusLEC): number {
    return this.lecs.filter(lec => lec.header.status === status).length;
  }

  statusLabel(status: StatusLEC): string {
    return status === StatusLEC.EM_REVISAO ? 'EM REVISÃO' : status;
  }

  exportarExcel(): void {
    const header = 'Nome,Especialista,Status,Última atualização';
    const rows = this.lecs.map(lec => [
      lec.header.nomeSolucao,
      lec.header.especialistaResponsavel,
      lec.header.status,
      lec.header.atualizadoEm.toLocaleString('pt-BR')
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lecs.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  criarLec(): void {
    if (this.saving || !this.novoNomeSolucao.trim()) return;
    this.saving = true;
    this.errorMessage = '';
    this.lecService.createLec(this.novoNomeSolucao.trim(), this.novoEspecialista.trim()).subscribe({
      next: lec => {
        this.saving = false;
        this.openModal = false;
        this.novoNomeSolucao = '';
        this.novoEspecialista = '';
        void this.router.navigate(['/lec/edit', lec.header.id]);
      },
      error: error => {
        this.saving = false;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  excluirLec(lec: LecData): void {
    if (this.deletingId || !window.confirm(`Excluir o LEC "${lec.header.nomeSolucao}"?`)) return;
    this.deletingId = lec.header.id;
    this.errorMessage = '';
    this.lecService.deleteLec(lec.header.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.lecs = this.lecs.filter(item => item.header.id !== lec.header.id);
        this.successMessage = 'LEC excluído.';
      },
      error: error => {
        this.deletingId = null;
        this.errorMessage = getApiErrorMessage(error);
      }
    });
  }

  private carregarLecs(): void {
    this.loading = true;
    this.errorMessage = '';
    this.lecService.getLecs().subscribe({
      next: lecs => {
        this.lecs = lecs;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = getApiErrorMessage(error);
        this.loading = false;
      }
    });
  }
}
