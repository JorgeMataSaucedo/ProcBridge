namespace ProcBridge.Core.Models;

/// <summary>
/// Estadísticas del dashboard
/// </summary>
public class DashboardStats
{
    public int TotalExecutions { get; set; }
    public decimal SuccessRate { get; set; }
    public decimal AvgDurationMs { get; set; }
    public int ActiveSPs { get; set; }
}

/// <summary>
/// Ejecución reciente para el dashboard
/// </summary>
public class RecentExecution
{
    public string ProcCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal DurationMs { get; set; }
    public DateTime ExecutedAt { get; set; }
}
