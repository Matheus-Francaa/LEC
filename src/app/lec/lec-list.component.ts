import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MockLecService } from '../shared/mock-lec.service';
import { MockAuthService } from '../shared/mock-auth.service';
import { LecData, StatusLEC, User, Role } from '../shared/models';

@Component({
  selector: 'app-lec-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="dashboard">
      <section class="metrics-grid" aria-label="Resumo dos LECs">
        <article class="metric-card">
          <span>TOTAL</span><strong>{{ lecs.length }}</strong>
        </article>
        <article class="metric-card metric-review">
          <span>EM REVISÃO</span><strong>{{ countByStatus('EM_REVISAO') }}</strong>
        </article>
        <article class="metric-card metric-draft">
          <span>RASCUNHOS</span><strong>{{ countByStatus('RASCUNHO') }}</strong>
        </article>
        <article class="metric-card metric-approved">
          <span>APROVADOS</span><strong>{{ countByStatus('APROVADO') }}</strong>
        </article>
      </section>

      <section class="lec-panel">
        <div class="panel-heading">
          <h1>MEUS LECS</h1>
          <button class="outline-button" type="button" (click)="exportarExcel()">▣ &nbsp; EXPORTAR EXCEL</button>
        </div>
        <div class="table-wrap">
          <table class="lec-table">
            <thead>
              <tr>
                <th>NOME</th>
                <th>ESPECIALISTA</th>
                <th>STATUS</th>
                <th>ÚLTIMA ATUALIZAÇÃO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lec of filteredLecs">
                <td class="lec-name">{{ lec.header.nomeSolucao }}</td>
                <td>{{ especialistaNome(lec.header.especialistaId) }}</td>
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
                  <button class="table-action" [routerLink]="['/review', lec.header.id]" [attr.aria-label]="'Visualizar ' + lec.header.nomeSolucao">⌕</button>
                </td>
              </tr>
              <tr *ngIf="filteredLecs.length === 0">
                <td colspan="5" class="empty-state">Nenhum LEC encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" *ngIf="openModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Criar Novo LEC</h5>
              <button type="button" class="btn-close" (click)="openModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Nome da Solução Digital:</label>
                <input type="text" class="form-control" [(ngModel)]="novoNomeSolucao" placeholder="Ex: Sistema de Gestão de Frota">
              </div>
              <div class="mb-3">
                <label class="form-label">Especialista Responsável:</label>
                <select class="form-select" [(ngModel)]="novoEspecialistaId">
                  <option *ngFor="let esp of especialistas" [value]="esp.id">{{ esp.nome }} ({{ esp.email }})</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="openModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="criarLec()">Criar LEC</button>
            </div>
          </div>
        </div>
      </div>
      <button class="gradient-button floating-new-button" type="button" *ngIf="isResponsavel" (click)="openModal = true">＋ &nbsp; NOVO LEC</button>
    </main>
  `
})
export class LecListComponent {
  lecs: LecData[] = [];
  currentUser: User | null = null;
  filtroStatus: string = '';
  openModal: boolean = false;
  novoNomeSolucao: string = '';
  novoEspecialistaId: string = 'u2';
  especialistas: User[] = [];

  constructor(
    private lecService: MockLecService,
    private authService: MockAuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.lecs = this.lecService.getLecs();
    this.especialistas = this.authService.getUsers().filter(u => u.perfil === Role.ESPECIALISTA || u.perfil === Role.ADMIN);
  }

  get isResponsavel(): boolean {
    return this.currentUser?.perfil === Role.RESPONSAVEL || this.currentUser?.perfil === Role.ADMIN;
  }

  get filteredLecs(): LecData[] {
    if (!this.filtroStatus) return this.lecs;
    return this.lecs.filter(l => l.header.status === this.filtroStatus);
  }

  countByStatus(status: string): number {
    return this.lecs.filter(lec => lec.header.status === status).length;
  }

  especialistaNome(id: string): string {
    return this.especialistas.find(user => user.id === id)?.nome || 'Não atribuído';
  }

  statusLabel(status: StatusLEC): string {
    return status === StatusLEC.EM_REVISAO ? 'EM REVISÃO' : status;
  }

  exportarExcel(): void {
    const header = 'Nome,Especialista,Status,Última atualização';
    const rows = this.lecs.map(lec => [
      lec.header.nomeSolucao,
      this.especialistaNome(lec.header.especialistaId),
      lec.header.status,
      lec.header.atualizadoEm.toLocaleString('pt-BR')
    ].map(value => `"${value.replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lecs.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  criarLec(): void {
    if (!this.novoNomeSolucao.trim()) return;
    const novo = this.lecService.createLec(this.novoNomeSolucao, this.novoEspecialistaId);
    this.openModal = false;
    this.novoNomeSolucao = '';
    this.router.navigate(['/lec/edit', novo.header.id]);
  }
}
