import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, RecentExecution } from '../../core/models/procbridge.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of ProcBridge executions</p>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="pi pi-bolt"></i>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Executions</div>
            <div class="kpi-value">{{stats.totalExecutions | number}}</div>
            <div class="kpi-meta">All time</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon success">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Success Rate</div>
            <div class="kpi-value">{{stats.successRate | number:'1.0-2'}}%</div>
            <div class="kpi-meta">Target: 99.95%</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Avg Duration</div>
            <div class="kpi-value">{{stats.avgDurationMs | number:'1.0-1'}}ms</div>
            <div class="kpi-meta">Average response time</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">
            <i class="pi pi-database"></i>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Active SPs</div>
            <div class="kpi-value">{{stats.activeSPs}}</div>
            <div class="kpi-meta">Currently enabled</div>
          </div>
        </div>
      </div>

      <!-- Chart Placeholder -->
      <div class="chart-section">
        <div class="chart-card">
          <h3>Executions Over 24 Hours</h3>
          <div class="chart-placeholder">
            <i class="pi pi-chart-line"></i>
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      <!-- Recent Executions -->
      <div class="recent-section">
        <h3>Recent Executions</h3>
        <div class="execution-list" *ngIf="recentExecutions.length > 0">
          <div class="execution-item" *ngFor="let exec of recentExecutions">
            <code>{{exec.procCode}}</code>
            <span [class]="'badge badge-' + exec.status.toLowerCase()">{{exec.status}}</span>
            <span class="duration">{{exec.durationMs | number:'1.0-1'}}ms</span>
            <span class="time">{{exec.executedAt | date:'HH:mm:ss'}}</span>
          </div>
        </div>
        <div class="empty-state" *ngIf="recentExecutions.length === 0">
          <i class="pi pi-inbox"></i>
          <p>No executions yet</p>
          <span>Execute a procedure in Playground to see results here</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 14px;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      transition: border-color 0.15s ease;
    }

    .kpi-card:hover {
      border-color: var(--accent-blue);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
    }

    .kpi-icon i {
      font-size: 20px;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .kpi-meta {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    /* Chart Section */
    .chart-section {
      margin-bottom: 2rem;
    }

    .chart-card {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      gap: 1rem;
    }

    .chart-placeholder i {
      font-size: 48px;
    }

    /* Recent Executions */
    .recent-section {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .execution-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .execution-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }

    .execution-item:hover {
      background: var(--black-hover);
      border-color: var(--accent-blue);
    }

    .execution-item code {
      flex: 1;
      font-weight: 500;
    }

    .execution-item .duration {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .execution-item .time {
      color: var(--text-tertiary);
      font-size: 12px;
      min-width: 60px;
      text-align: right;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--text-tertiary);
      gap: 0.5rem;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }

    .empty-state span {
      font-size: 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalExecutions: 0,
    successRate: 0,
    avgDurationMs: 0,
    activeSPs: 0
  };

  recentExecutions: RecentExecution[] = [];
  loading = false;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadStats();
    this.loadRecentExecutions();
  }

  loadStats() {
    this.loading = true;
    this.apiService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.loading = false;
      }
    });
  }

  loadRecentExecutions() {
    this.apiService.getRecentExecutions().subscribe({
      next: (executions) => {
        this.recentExecutions = executions;
      },
      error: (err) => {
        console.error('Error loading recent executions:', err);
      }
    });
  }
}
