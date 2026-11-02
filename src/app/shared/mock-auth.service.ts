import { Injectable } from '@angular/core';
import { User, Role } from './models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: 'u1',
      nome: 'Carlos Dev',
      email: 'carlos.dev@empresa.gov.br',
      perfil: Role.RESPONSAVEL
    },
    {
      id: 'u2',
      nome: 'Ana Compliance',
      email: 'ana.compliance@empresa.gov.br',
      perfil: Role.ESPECIALISTA
    },
    {
      id: 'u3',
      nome: 'Admin Geral',
      email: 'admin@empresa.gov.br',
      perfil: Role.ADMIN
    }
  ];

  constructor() {
    // Inicia logado como Responsável para facilitar testes
    this.login('u1');
  }

  getUsers(): User[] {
    return this.mockUsers;
  }

  login(userId: string): User | null {
    const user = this.mockUsers.find(u => u.id === userId) || null;
    this.currentUserSubject.next(user);
    return user;
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
