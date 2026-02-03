namespace ProcBridge.Core.Models;

/// <summary>
/// Entrada del catálogo de stored procedures.
/// </summary>
public class CatalogEntry
{
    public int ProcCatalogId { get; set; }
    public string ProcCode { get; set; } = string.Empty;
    public string SpName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool RequireAuth { get; set; }
    public string? AllowedRoles { get; set; }
    public bool UseTransaction { get; set; }
    public bool IsActive { get; set; }
}
