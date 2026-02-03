import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../core/services/api.service';
import { CatalogEntry } from '../../core/models/procbridge.models';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
  template: `
    <div class="catalog-container">
      <div class="page-header">
        <div>
          <h1>Catalog</h1>
          <p class="subtitle">Manage stored procedure catalog entries</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-wrapper">
          <i class="pi pi-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Search procedures..." 
            [(ngModel)]="searchText"
            (ngModelChange)="applyFilter()"
            class="search-input" />
        </div>
      </div>

      <!-- Table -->
      <div class="table-section">
        <p-table 
          [value]="filteredEntries" 
          [paginator]="true" 
          [rows]="10"
          [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 150px">ProcCode</th>
              <th>SP Name</th>
              <th>Description</th>
              <th style="width: 100px">Status</th>
              <th style="width: 100px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-entry>
            <tr>
              <td><strong>{{ entry.procCode }}</strong></td>
              <td><code>{{ entry.spName }}</code></td>
              <td>{{ entry.description || '-' }}</td>
              <td>
                <span [class]="entry.isActive ? 'badge badge-success' : 'badge badge-inactive'">
                  {{ entry.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="icon-button" 
                    (click)="runInPlayground(entry)"
                    title="Run in Playground">
                    <i class="pi pi-play"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="empty-message">
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <p>No procedures found</p>
                  <span>{{ searchText ? 'Try a different search term' : 'No procedures in catalog' }}</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    /* Search */
    .search-section {
      margin-bottom: 1.5rem;
    }

    .search-wrapper {
      position: relative;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--accent-blue);
      font-size: 16px;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .search-input:focus {
      border-color: var(--accent-blue);
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-input:focus ~ .search-icon {
      color: var(--accent-blue);
    }

    /* Table */
    .table-section {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .icon-button {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: var(--accent-blue);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .icon-button:hover {
      background: #2563eb;
      transform: scale(1.05);
    }

    .icon-button i {
      font-size: 13px;
    }

    .empty-message {
      text-align: center !important;
      padding: 3rem 2rem !important;
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
export class CatalogListComponent implements OnInit {
  catalogEntries: CatalogEntry[] = [];
  filteredEntries: CatalogEntry[] = [];
  loading = false;
  searchText = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.loading = true;
    this.apiService.getCatalog().subscribe({
      next: (entries) => {
        this.catalogEntries = entries;
        this.filteredEntries = entries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading catalog:', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredEntries = this.catalogEntries;
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredEntries = this.catalogEntries.filter(entry =>
      entry.procCode.toLowerCase().includes(search) ||
      entry.spName.toLowerCase().includes(search) ||
      (entry.description && entry.description.toLowerCase().includes(search))
    );
  }

  runInPlayground(entry: CatalogEntry) {
    this.router.navigate(['/playground'], {
      queryParams: { procCode: entry.procCode }
    });
  }
}
