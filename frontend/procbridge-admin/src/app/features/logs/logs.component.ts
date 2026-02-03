import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ApiService } from '../../core/services/api.service';
import { ExecutionLog } from '../../core/models/procbridge.models';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, CalendarModule],
  template: `
    <div class="logs-container">
      <div class="page-header">
        <h1>Execution Logs</h1>
        <p class="subtitle">View and filter stored procedure execution history</p>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Date Range</label>
          <input type="text" 
                 placeholder="All dates" 
                 class="date-input"
                 readonly />
        </div>

        <div class="filter-group">
          <label>Status</label>
          <p-dropdown [options]="statusOptions" 
                      [(ngModel)]="selectedStatus"
                      (ngModelChange)="loadLogs()"
                      placeholder="All Statuses"
                      [style]="{'width': '100%'}">
          </p-dropdown>
        </div>

        <div class="filter-group">
          <label>Procedure</label>
          <input type="text" 
                 placeholder="Filter by ProcCode" 
                 [(ngModel)]="filterProcCode"
                 (ngModelChange)="loadLogs()"
                 class="filter-input" />
        </div>
      </div>

      <!--Table -->
      <div class="table-section">
        <p-table [value]="logs" 
                 [paginator]="true" 
                 [rows]="50"
                 [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 150px">ExecutionId</th>
              <th>ProcCode</th>
              <th style="width: 120px">Status</th>
              <th style="width: 100px">Duration</th>
              <th style="width: 180px">User</th>
              <th style="width: 180px">Timestamp</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-log>
            <tr>
              <td><span class="exec-id">{{log.executionId}}</span></td>
              <td><code>{{log.procCode}}</code></td>
              <td>
                <span [class]="'badge badge-' + (log.isSuccess ? 'success' : 'error')">
                  {{log.isSuccess ? 'SUCCESS' : 'ERROR'}}
                </span>
              </td>
              <td class="duration">{{log.durationMs | number:'1.0-0'}} ms</td>
              <td class="user">{{log.userId || 'system'}}</td>
              <td class="timestamp">{{log.executedAt | date:'yyyy-MM-dd HH:mm:ss'}}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <p>No execution logs found</p>
                  <span>Execute a procedure in Playground to see logs</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .logs-container {
      padding: 2rem;
      max-width: 1600px;
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

    /* Filters */
    .filters-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .filter-input,
    .date-input {
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 0.625rem 0.875rem;
      font-family: inherit;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .filter-input:focus,
    .date-input:focus {
      border-color: var(--border-focus);
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Table Section */
    .table-section {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    /* Custom table styling */
    .exec-id {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .duration {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .user {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .timestamp {
      color: var(--text-tertiary);
      font-size: 12px;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    /* Status badges */
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      color: var(--accent-red);
    }

    .empty-message {
      text-align: center !important;
      padding: 4rem 2rem !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
export class LogsComponent implements OnInit {
  logs: ExecutionLog[] = [];
  loading = false;
  selectedStatus?: string;
  filterProcCode = '';

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Success', value: 'success' },
    { label: 'Error', value: 'error' }
  ];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    const filters: any = {};

    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    if (this.filterProcCode) {
      filters.procCode = this.filterProcCode;
    }

    this.apiService.getLogs(filters).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading logs:', err);
        this.loading = false;
        this.logs = [];
      }
    });
  }
}
