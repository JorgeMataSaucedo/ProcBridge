namespace ProcBridge.Core.Models;

/// <summary>
/// Response de la ejecución de un stored procedure.
/// </summary>
public class ProcResult
{
    /// <summary>
    /// Indica si la ejecución fue exitosa.
    /// </summary>
    public bool IsOk { get; set; }

    /// <summary>
    /// Mensaje de error si IsOk = false.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Datos devueltos por el SP.
    /// </summary>
    public ProcData? Data { get; set; }

    /// <summary>
    /// Metadata de la ejecución.
    /// </summary>
    public ProcResultMeta? Meta { get; set; }
}

/// <summary>
/// Datos devueltos por el SP.
/// </summary>
public class ProcData
{
    /// <summary>
    /// Lista de ResultSets (un SP puede hacer múltiples SELECT).
    /// </summary>
    public List<ResultSet> ResultSets { get; set; } = new();
}

/// <summary>
/// Un ResultSet = una tabla de datos (un SELECT del SP).
/// </summary>
public class ResultSet
{
    /// <summary>
    /// Nombres de las columnas.
    /// </summary>
    public List<string> Columns { get; set; } = new();

    /// <summary>
    /// Filas de datos.
    /// Cada fila es un Dictionary donde key = nombre columna.
    /// </summary>
    public List<Dictionary<string, object?>> Rows { get; set; } = new();
}

/// <summary>
/// Metadata del resultado de ejecución.
/// </summary>
public class ProcResultMeta
{
    public Guid ExecutionId { get; set; } = Guid.NewGuid();
    public string ProcCode { get; set; } = string.Empty;
    public string? SpName { get; set; }
    public long DurationMs { get; set; }
    public int ResultSetCount { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
    public string? UserId { get; set; }
    public string? AppName { get; set; }
    public string? CorrelationId { get; set; }
}
