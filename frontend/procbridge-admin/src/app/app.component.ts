import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Icon-only Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo">PB</div>
        </div>
        
        <div class="nav-items">
          <a routerLink="/dashboard" 
             routerLinkActive="active"
             class="nav-item"
             title="Dashboard">
            <i class="pi pi-home"></i>
          </a>
          
          <a routerLink="/playground" 
             routerLinkActive="active"
             class="nav-item"
             title="Playground">
            <i class="pi pi-play"></i>
          </a>
          
          <a routerLink="/catalog" 
             routerLinkActive="active"
             class="nav-item"
             title="Catalog">
            <i class="pi pi-book"></i>
          </a>
          
          <a routerLink="/logs" 
             routerLinkActive="active"
             class="nav-item"
             title="Logs">
            <i class="pi pi-chart-line"></i>
          </a>
        </div>
        
        <div class="sidebar-footer">
          <button class="nav-item" title="Settings">
            <i class="pi pi-cog"></i>
          </button>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background: var(--black-pure);
    }

    /* Sidebar */
    .sidebar {
      width: 60px;
      background: var(--black-sidebar);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0;
      flex-shrink: 0;
    }

    .sidebar-header {
      margin-bottom: 2rem;
    }

    .logo {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.5px;
    }

    .nav-items {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      padding: 0 0.5rem;
    }

    .nav-item {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
      border: none;
      background: transparent;
      position: relative;
    }

    .nav-item:hover {
      background: var(--black-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--accent-blue);
      color: white;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: var(--accent-blue);
      border-radius: 0 2px 2px 0;
    }

    .nav-item i {
      font-size: 18px;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 0 0.5rem;
      width: 100%;
    }

    .sidebar-footer .nav-item {
      margin-bottom: 0;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      overflow: auto;
      background: var(--black-pure);
    }

    /* Tooltip on hover (optional enhancement) */
    .nav-item:hover::after {
      content: attr(title);
      position: absolute;
      left: 100%;
      margin-left: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    }
  `]
})
export class AppComponent {
  title = 'ProcBridge Admin';
}
