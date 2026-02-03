namespace ProcBridge.Core.Models;

/// <summary>
/// Metadata de una ejecución: quién, cuándo, desde dónde.
/// </summary>
public class ProcMeta
{
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? AppName { get; set; }
    public string? IpAddress { get; set; }
    public string? CorrelationId { get; set; }
}
