namespace ProcBridge.Core.Models;

/// <summary>
/// Modelo de dominio para usuarios del sistema.
/// </summary>
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    /// <summary>
    /// Lista de roles asignados al usuario.
    /// </summary>
    public List<string> Roles { get; set; } = new();
}
