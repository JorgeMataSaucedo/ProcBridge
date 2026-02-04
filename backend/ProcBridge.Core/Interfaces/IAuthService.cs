using ProcBridge.Core.Models;

namespace ProcBridge.Core.Interfaces;

/// <summary>
/// Servicio de autenticación y autorización.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Autentica un usuario y retorna tokens JWT.
    /// </summary>
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    
    /// <summary>
    /// Renueva el access token usando un refresh token válido.
    /// </summary>
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
    
    /// <summary>
    /// Obtiene información de un usuario por su ID.
    /// </summary>
    Task<User?> GetUserByIdAsync(Guid userId);
    
    /// <summary>
    /// Valida si un usuario tiene al menos uno de los roles permitidos.
    /// </summary>
    Task<bool> ValidateUserRolesAsync(Guid userId, string[] allowedRoles);
    
    /// <summary>
    /// Invalida un refresh token (logout).
    /// </summary>
    Task RevokeRefreshTokenAsync(string refreshToken);
}
