namespace ProcBridge.Core.Models;

/// <summary>
/// Log de ejecución de un stored procedure
/// </summary>
public class ExecutionLog
{
    public string ExecutionId { get; set; } = string.Empty;
    public string ProcCode { get; set; } = string.Empty;
    public string SpName { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public decimal DurationMs { get; set; }
    public string ExecutedAt { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string? ErrorMessage { get; set; }
}
