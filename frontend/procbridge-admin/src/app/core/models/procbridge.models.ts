export interface ProcRequest {
    procCode: string;
    payload?: Record<string, any>;
    meta?: {
        userId?: string;
        appName?: string;
        correlationId?: string;
    };
}

export interface ProcResult {
    isOk: boolean;
    data?: {
        resultSets: ResultSet[];
    };
    error?: {
        message: string;
        code: string;
    };
    meta: {
        executionId: string;
        procCode: string;
        spName: string;
        durationMs: number;
        executedAt: string;
    };
}

export interface ResultSet {
    columns: string[];
    rows: Record<string, any>[];
}

export interface CatalogEntry {
    procCode: string;
    spName: string;
    description?: string;
    requireAuth: boolean;
    allowedRoles?: string;
    isActive: boolean;
}

export interface ExecutionLog {
    executionId: string;
    procCode: string;
    spName: string;
    isSuccess: boolean;
    durationMs: number;
    executedAt: string;
    userId?: string;
    errorMessage?: string;
}

export interface DashboardStats {
    totalExecutions: number;
    successRate: number;
    avgDurationMs: number;
    activeSPs: number;
}

export interface RecentExecution {
    procCode: string;
    status: string;
    durationMs: number;
    executedAt: Date;
}
