using Dapper;
using Microsoft.Data.SqlClient;
using ProcBridge.Core.Models;

namespace ProcBridge.Engine;

/// <summary>
/// Servicio para interactuar con el ProcCatalog en la base de datos.
/// </summary>
public class CatalogService
{
    private readonly string _connectionString;

    public CatalogService(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// Busca un procedimiento por su código.
    /// </summary>
    public async Task<CatalogEntry?> GetByCodeAsync(string procCode, CancellationToken cancellationToken = default)
    {
        await using var conn = new SqlConnection(_connectionString);
        
        var sql = @"
            SELECT 
                ProcCatalogId, 
                ProcCode, 
                SpName, 
                Description, 
                RequireAuth, 
                AllowedRoles, 
                UseTransaction, 
                IsActive
            FROM ProcCatalog 
            WHERE ProcCode = @ProcCode";

        return await conn.QueryFirstOrDefaultAsync<CatalogEntry>(sql, new { ProcCode = procCode });
    }

    /// <summary>
    /// Obtiene todos los procedimientos del catálogo.
    /// </summary>
    public async Task<IEnumerable<CatalogEntry>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await using var conn = new SqlConnection(_connectionString);
        
        var sql = @"
            SELECT 
                ProcCatalogId, 
                ProcCode, 
                SpName, 
                Description, 
                RequireAuth, 
                AllowedRoles, 
                UseTransaction, 
                IsActive
            FROM ProcCatalog 
            ORDER BY ProcCode";

        return await conn.QueryAsync<CatalogEntry>(sql);
    }
}
