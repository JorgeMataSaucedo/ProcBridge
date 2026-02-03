import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ApiService } from '../../core/services/api.service';
import { CatalogEntry, ProcRequest, ProcResult } from '../../core/models/procbridge.models';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, TableModule, TabViewModule],
  template: `
    <div class="playground-container">
      <div class="page-header">
        <h1>Playground</h1>
        <p class="subtitle">Execute stored procedures with payloads and view results</p>
      </div>

      <div class="playground-layout">
        <!-- Input Panel -->
        <div class="input-panel">
          <div class="panel-header">
            <h3>Input</h3>
          </div>
          
          <div class="panel-content">
            <p-dropdown 
              [options]="catalogEntries" 
              [(ngModel)]="selectedProc"
              optionLabel="procCode"
              placeholder="Select Stored Procedure"
              [style]="{'width': '100%'}" 
              [showClear]="true">
            </p-dropdown>
            
            <div class="editor-wrapper">
              <div class="editor-header">
                <span>Payload (JSON)</span>
              </div>
              <textarea 
                [(ngModel)]="payloadJson"
                rows="18"
                class="json-editor"
                placeholder='{\n  "userId": "123",\n  "startDate": "2024-01-01"\n}'>
              </textarea>
            </div>
            
            <p-button 
              label="Execute" 
              icon="pi pi-play"
              [loading]="loading"
              (onClick)="execute()"
              [style]="{'width': '100%'}">
            </p-button>
          </div>
        </div>
        
        <!-- Output Panel -->
        <div class="output-panel">
          <div class="panel-header">
            <h3>Output</h3>
            <div *ngIf="lastResult" class="status-badge">
              <i [class]="lastResult.isOk ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                 [style.color]="lastResult.isOk ? 'var(--accent-green)' : 'var(--accent-red)'"></i>
              <span>{{ lastResult.isOk ? 'Success' : 'Error' }}</span>
              <span class="duration">{{ lastResult.meta?.durationMs }}ms</span>
            </div>
          </div>
          
          <div class="panel-content" *ngIf="lastResult">
            <p-tabView>
              <p-tabPanel header="Table" *ngIf="lastResult.data?.resultSets?.[0]">
                <p-table 
                  [value]="lastResult.data!.resultSets![0].rows"
                  [scrollable]="true"
                  scrollHeight="500px">
                  <ng-template pTemplate="header">
                    <tr>
                      <th *ngFor="let col of getColumns()">{{ col }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-row>
                    <tr>
                      <td *ngFor="let col of getColumns()">{{ row[col] }}</td>
                    </tr>
                  </ng-template>
                </p-table>
              </p-tabPanel>
              
              <p-tabPanel header="JSON">
                <div class="json-container">
                  <button 
                    class="copy-button" 
                    (click)="copyJson()"
                    [class.copied]="jsonCopied"
                    title="{{ jsonCopied ? 'Copied!' : 'Copy JSON' }}">
                    <i [class]="jsonCopied ? 'pi pi-check' : 'pi pi-copy'"></i>
                    <span>{{ jsonCopied ? 'Copied!' : 'Copy' }}</span>
                  </button>
                  <pre class="json-output">{{ resultJson }}</pre>
                </div>
              </p-tabPanel>
              
              <p-tabPanel header="Meta">
                <div class="meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">Execution ID</span>
                    <span class="meta-value">{{ lastResult.meta.executionId }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">ProcCode</span>
                    <span class="meta-value">{{ lastResult.meta.procCode }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">SP Name</span>
                    <span class="meta-value">{{ lastResult.meta.spName }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Duration</span>
                    <span class="meta-value">{{ lastResult.meta.durationMs }}ms</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Executed At</span>
                    <span class="meta-value">{{ lastResult.meta.executedAt }}</span>
                  </div>
                </div>
              </p-tabPanel>
            </p-tabView>
          </div>
          
          <div class="panel-content empty-state" *ngIf="!lastResult">
            <i class="pi pi-inbox"></i>
            <p>No execution results yet</p>
            <span>Select a procedure and execute to see results</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playground-container {
      padding: 2rem;
      max-width: 1800px;
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

    /* Layout */
    .playground-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      height: calc(100vh - 180px);
    }

    .input-panel,
    .output-panel {
      background: var(--black-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .status-badge i {
      font-size: 16px;
    }

    .duration {
      color: var(--text-tertiary);
      font-size: 12px;
    }

    .panel-content {
      padding: 1.5rem;
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Editor */
    .editor-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .json-editor {
      flex: 1;
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 1rem;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      resize: none;
    }

    .json-editor:focus {
      border-color: var(--border-focus);
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Output */
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
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0;
    }

    .empty-state span {
      font-size: 13px;
    }

    /* JSON Copy Tool */
    .json-container {
      position: relative;
    }

    .copy-button {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      padding: 0.4rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .copy-button:hover {
      background: var(--black-elevated);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }

    .copy-button.copied {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--accent-green);
      color: var(--accent-green);
    }

    .json-output {
      margin: 0;
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1rem;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: var(--accent-blue);
      line-height: 1.5;
      overflow: auto;
      max-height: 500px;
    }

    /* Meta Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .meta-item {
      background: var(--black-pure);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-label {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-value {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Tab overrides */
    ::ng-deep .p-tabview .p-tabview-nav {
      background: transparent !important;
      border: none !important;
      border-bottom: 1px solid var(--border-subtle) !important;
    }

    ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link {
      background: transparent !important;
      border: none !important;
      color: var(--text-secondary) !important;
      padding: 0.75rem 1rem !important;
    }

    ::ng-deep .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
      color: var(--accent-blue) !important;
      border-bottom: 2px solid var(--accent-blue) !important;
    }

    ::ng-deep .p-tabview .p-tabview-panels {
      background: transparent !important;
      padding: 1.5rem 0 !important;
    }
  `]
})
export class PlaygroundComponent implements OnInit {
  catalogEntries: CatalogEntry[] = [];
  selectedProc?: CatalogEntry;
  payloadJson = '{\n  \n}';
  lastResult?: ProcResult;
  resultJson = '';
  loading = false;
  jsonCopied = false;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.apiService.getCatalog().subscribe(entries => {
      this.catalogEntries = entries.filter(e => e.isActive);
    });
  }

  execute() {
    if (!this.selectedProc) return;

    this.loading = true;
    const request: ProcRequest = {
      procCode: this.selectedProc.procCode,
      payload: JSON.parse(this.payloadJson || '{}')
    };

    this.apiService.execute(request).subscribe({
      next: (result) => {
        this.lastResult = result;
        this.resultJson = JSON.stringify(result, null, 2);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Execution failed:', err);
      }
    });
  }

  copyJson() {
    if (!this.resultJson) return;

    navigator.clipboard.writeText(this.resultJson).then(() => {
      this.jsonCopied = true;
      setTimeout(() => {
        this.jsonCopied = false;
      }, 2000);
    });
  }

  getColumns(): string[] {
    return this.lastResult?.data?.resultSets?.[0]?.columns || [];
  }
}
