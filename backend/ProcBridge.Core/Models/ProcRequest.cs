namespace ProcBridge.Core.Models;

/// <summary>
/// Request para ejecutar un stored procedure.
/// </summary>
public class ProcRequest
{
    /// <summary>
    /// Código único del procedimiento en el catálogo.
    /// Ejemplo: "GET_USERS", "CREATE_ORDER"
    /// </summary>
    public string ProcCode { get; set; } = string.Empty;

    /// <summary>
    /// Parámetros del SP como objeto dinámico.
    /// Puede ser un Dictionary, un objeto anónimo, o cualquier POCO.
    /// Ejemplo: new { UserId = 123, Status = "Active" }
    /// </summary>
    public object? Payload { get; set; }

    /// <summary>
    /// Metadata de ejecución (quién, desde dónde, etc.)
    /// </summary>
    public ProcMeta Meta { get; set; } = new();
}
