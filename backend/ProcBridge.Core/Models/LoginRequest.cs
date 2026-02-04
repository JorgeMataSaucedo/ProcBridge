namespace ProcBridge.Core.Models;

/// <summary>
/// Request para autenticación de usuario.
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
