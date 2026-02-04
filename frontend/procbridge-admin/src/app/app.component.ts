import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { UserInfo } from './core/models/auth.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout" *ngIf="!isLoginPage">
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
          <div class="user-info" *ngIf="currentUser" [title]="currentUser.email">
            <div class="user-avatar">
              {{ getUserInitials(currentUser.fullName) }}
            </div>
          </div>
          <button class="nav-item logout-btn" title="Logout" (click)="onLogout()">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </nav>
      
      <!-- Main Content -->      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Login page (full screen) -->
    <router-outlet *ngIf="isLoginPage"></router-outlet>
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
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-info {
      display: flex;
      justify-content: center;
      margin-bottom: 0.25rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .user-avatar:hover {
      transform: scale(1.05);
    }

    .logout-btn {
      color: var(--accent-red) !important;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      overflow: auto;
      background: var(--black-pure);
    }

    /* Tooltip on hover (optional enhancement) */
    .nav-item:hover::after,
    .user-avatar:hover::after {
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
export class AppComponent implements OnInit {
  title = 'ProcBridge Admin';
  currentUser: UserInfo | null = null;
  isLoginPage = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check if current route is login
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/login';
    });
  }

  getUserInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
