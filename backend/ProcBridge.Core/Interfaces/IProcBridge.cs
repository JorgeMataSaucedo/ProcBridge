using ProcBridge.Core.Models;

namespace ProcBridge.Core.Interfaces;

/// <summary>
/// Contrato principal: ejecuta stored procedures dinámicamente.
/// </summary>
public interface IProcBridge
{
    /// <summary>
    /// Ejecuta un stored procedure.
    /// </summary>
    Task<ProcResult> ExecuteAsync(ProcRequest request, CancellationToken cancellationToken = default);
}
