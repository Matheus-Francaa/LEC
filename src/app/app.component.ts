import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <header class="app-header">
      <button class="icon-button menu-button" type="button" aria-label="Abrir menu">
        <span></span><span></span><span></span>
      </button>
      <a class="brand" routerLink="/lec">
        <span>RESIDÊNCIA EM SOFTWARE &amp; IA</span>
        <strong>BOLETIM LEC</strong>
      </a>
      <div class="header-actions">
        <button class="icon-button notification-button" type="button" aria-label="Notificações">
          <span class="notification-dot"></span>
          <span class="bell">♧</span>
        </button>
        <a class="gradient-button header-new-button" routerLink="/lec">＋ <span>NOVO LEC</span></a>
      </div>
    </header>
    <div class="accent-line"></div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'lec-frontend';
}
