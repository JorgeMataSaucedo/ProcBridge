import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcRequest, ProcResult, CatalogEntry, DashboardStats, RecentExecution, ExecutionLog } from '../models/procbridge.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:5194/api';

    constructor(private http: HttpClient) { }

    execute(request: ProcRequest): Observable<ProcResult> {
        return this.http.post<ProcResult>(`${this.baseUrl}/execute`, request);
    }

    getCatalog(): Observable<CatalogEntry[]> {
        return this.http.get<CatalogEntry[]>(`${this.baseUrl}/catalog`);
    }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
    }

    getRecentExecutions(): Observable<RecentExecution[]> {
        return this.http.get<RecentExecution[]>(`${this.baseUrl}/stats/recent`);
    }

    getLogs(filters?: any): Observable<ExecutionLog[]> {
        return this.http.get<ExecutionLog[]>(`${this.baseUrl}/logs`, { params: filters });
    }
}
