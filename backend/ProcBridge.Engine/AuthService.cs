using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProcBridge.Core.Interfaces;
using ProcBridge.Core.Models;

namespace ProcBridge.Engine;

/// <summary>
/// Implementación del servicio de autenticación con JWT y BCrypt.
/// </summary>
public class AuthService : IAuthService
{
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;

    public AuthService(string connectionString, IConfiguration configuration)
    {
        _connectionString = connectionString;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        // Validar input
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return null;

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // Obtener usuario por email
        var user = await GetUserByEmailAsync(conn, request.Email);
        if (user == null || !user.IsActive)
            return null;

        // Verificar password con BCrypt
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        // Actualizar LastLoginAt
        await UpdateLastLoginAsync(conn, user.Id);

        // Generar tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = await GenerateRefreshTokenAsync(conn, user.Id);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Roles = user.Roles
            }
        };
    }

    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // Validar refresh token
        var userId = await ValidateRefreshTokenAsync(conn, refreshToken);
        if (userId == null)
            return null;

        // Obtener usuario
        var user = await GetUserByIdAsync(userId.Value);
        if (user == null || !user.IsActive)
            return null;

        // Revocar token anterior
        await RevokeRefreshTokenInternalAsync(conn, refreshToken);

        // Generar nuevos tokens
        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = await GenerateRefreshTokenAsync(conn, user.Id);

        return new LoginResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Roles = user.Roles
            }
        };
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT u.Id, u.Email, u.PasswordHash, u.FullName, u.IsActive, 
                   u.CreatedAt, u.UpdatedAt, u.LastLoginAt
            FROM Users u
            WHERE u.Id = @UserId", conn);
        
        cmd.Parameters.Add(new SqlParameter("@UserId", SqlDbType.UniqueIdentifier) { Value = userId });

        using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var user = MapUser(reader);
        reader.Close();

        // Obtener roles
        user.Roles = await GetUserRolesAsync(conn, userId);

        return user;
    }

    public async Task<bool> ValidateUserRolesAsync(Guid userId, string[] allowedRoles)
    {
        if (allowedRoles == null || allowedRoles.Length == 0)
            return true;

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        var userRoles = await GetUserRolesAsync(conn, userId);
        return userRoles.Any(r => allowedRoles.Contains(r, StringComparer.OrdinalIgnoreCase));
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return;

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        await RevokeRefreshTokenInternalAsync(conn, refreshToken);
    }

    // ============================================
    // Métodos Privados
    // ============================================

    private async Task<User?> GetUserByEmailAsync(SqlConnection conn, string email)
    {
        var cmd = new SqlCommand(@"
            SELECT u.Id, u.Email, u.PasswordHash, u.FullName, u.IsActive, 
                   u.CreatedAt, u.UpdatedAt, u.LastLoginAt
            FROM Users u
            WHERE u.Email = @Email", conn);
        
        cmd.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 256) { Value = email });

        using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var user = MapUser(reader);
        reader.Close();

        // Obtener roles
        user.Roles = await GetUserRolesAsync(conn, user.Id);

        return user;
    }

    private async Task<List<string>> GetUserRolesAsync(SqlConnection conn, Guid userId)
    {
        var roles = new List<string>();
        var cmd = new SqlCommand(@"
            SELECT r.RoleName
            FROM UserRoles ur
            INNER JOIN Roles r ON ur.RoleId = r.Id
            WHERE ur.UserId = @UserId", conn);
        
        cmd.Parameters.Add(new SqlParameter("@UserId", SqlDbType.UniqueIdentifier) { Value = userId });

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            roles.Add(reader.GetString(0));
        }

        return roles;
    }

    private string GenerateAccessToken(User user)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = _configuration["JwtSettings:Issuer"] ?? "ProcBridge";
        var audience = _configuration["JwtSettings:Audience"] ?? "ProcBridgeApp";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        // Agregar roles como claims
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateRefreshTokenAsync(SqlConnection conn, Guid userId)
    {
        // Generar token aleatorio seguro
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        var token = Convert.ToBase64String(randomBytes);

        // Guardar en BD
        var expirationDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");
        var cmd = new SqlCommand(@"
            INSERT INTO RefreshTokens (Token, UserId, ExpiresAt)
            VALUES (@Token, @UserId, @ExpiresAt)", conn);
        
        cmd.Parameters.Add(new SqlParameter("@Token", SqlDbType.NVarChar, 256) { Value = token });
        cmd.Parameters.Add(new SqlParameter("@UserId", SqlDbType.UniqueIdentifier) { Value = userId });
        cmd.Parameters.Add(new SqlParameter("@ExpiresAt", SqlDbType.DateTime2) { Value = DateTime.UtcNow.AddDays(expirationDays) });

        await cmd.ExecuteNonQueryAsync();

        return token;
    }

    private async Task<Guid?> ValidateRefreshTokenAsync(SqlConnection conn, string token)
    {
        var cmd = new SqlCommand(@"
            SELECT UserId
            FROM RefreshTokens
            WHERE Token = @Token
              AND ExpiresAt > GETUTCDATE()
              AND RevokedAt IS NULL", conn);
        
        cmd.Parameters.Add(new SqlParameter("@Token", SqlDbType.NVarChar, 256) { Value = token });

        var result = await cmd.ExecuteScalarAsync();
        return result != null ? (Guid)result : null;
    }

    private async Task RevokeRefreshTokenInternalAsync(SqlConnection conn, string token)
    {
        var cmd = new SqlCommand(@"
            UPDATE RefreshTokens
            SET RevokedAt = GETUTCDATE()
            WHERE Token = @Token", conn);
        
        cmd.Parameters.Add(new SqlParameter("@Token", SqlDbType.NVarChar, 256) { Value = token });

        await cmd.ExecuteNonQueryAsync();
    }

    private async Task UpdateLastLoginAsync(SqlConnection conn, Guid userId)
    {
        var cmd = new SqlCommand(@"
            UPDATE Users
            SET LastLoginAt = GETUTCDATE()
            WHERE Id = @UserId", conn);
        
        cmd.Parameters.Add(new SqlParameter("@UserId", SqlDbType.UniqueIdentifier) { Value = userId });

        await cmd.ExecuteNonQueryAsync();
    }

    private User MapUser(SqlDataReader reader)
    {
        return new User
        {
            Id = reader.GetGuid(0),
            Email = reader.GetString(1),
            PasswordHash = reader.GetString(2),
            FullName = reader.GetString(3),
            IsActive = reader.GetBoolean(4),
            CreatedAt = reader.GetDateTime(5),
            UpdatedAt = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
            LastLoginAt = reader.IsDBNull(7) ? null : reader.GetDateTime(7)
        };
    }

    private int GetAccessTokenExpirationMinutes()
    {
        return int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "15");
    }
}
