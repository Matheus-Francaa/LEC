import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <header class="app-header">
      <span class="icon-button menu-button" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
      <a class="brand" routerLink="/lec">
        <span>RESIDÊNCIA EM SOFTWARE &amp; IA</span>
        <strong>BOLETIM LEC</strong>
      </a>
      <div class="header-actions">
        <span class="icon-button notification-button" aria-hidden="true">
          <span class="notification-dot"></span>
          <span class="bell">♧</span>
        </span>
        <a class="gradient-button header-new-button" routerLink="/lec" [queryParams]="{ novo: true }">＋ <span>NOVO LEC</span></a>
      </div>
    </header>
    <div class="accent-line"></div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'lec-frontend';
}
