import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../shared/mock-auth.service';
import { User, Role } from '../shared/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-center mb-4">Projeto LEC — Login Institucional</h2>
              <p class="text-muted text-center mb-4">LevelUp | Residência em Software & IA (SSO OIDC / Keycloak Mock)</p>

              <div class="mb-3">
                <label class="form-label">Selecione o Usuário / Perfil:</label>
                <select class="form-select" [(ngModel)]="selectedUserId">
                  <option *ngFor="let u of users" [value]="u.id">
                    {{ u.nome }} ({{ u.email }} — <strong>{{ u.perfil }}</strong>)
                  </option>
                </select>
              </div>

              <div class="d-grid gap-2 mt-4">
                <button class="btn btn-primary btn-lg" (click)="onLogin()">Entrar no Sistema</button>
              </div>

              <div class="mt-4 text-center">
                <small class="text-muted">Perfis disponíveis: Responsável pelo Preenchimento, Especialista e Administrador.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  users: User[] = [];
  selectedUserId: string = '';

  constructor(private authService: MockAuthService, private router: Router) {
    this.users = this.authService.getUsers();
    if (this.users.length > 0) {
      this.selectedUserId = this.users[0].id;
    }
  }

  onLogin(): void {
    const user = this.authService.login(this.selectedUserId);
    if (user) {
      this.router.navigate(['/lec']);
    }
  }
}
