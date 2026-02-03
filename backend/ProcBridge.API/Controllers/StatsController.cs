using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ProcBridge.Core.Models;
using System.Data;

namespace ProcBridge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IConfiguration _config;

    public StatsController(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// GET /api/stats
    /// Retorna estadísticas del dashboard
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<DashboardStats>> GetStats()
    {
        try
        {
            var connectionString = _config.GetConnectionString("DefaultConnection");
            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            // Calcular estadísticas reales
            var stats = new DashboardStats();

            // Total executions
            using (var cmd = new SqlCommand("SELECT COUNT(*) FROM ProcExecLog", conn))
            {
                stats.TotalExecutions = (int)await cmd.ExecuteScalarAsync();
            }

            // Success rate
            if (stats.TotalExecutions > 0)
            {
                using var cmd = new SqlCommand(@"
                    SELECT 
                        CAST(COUNT(CASE WHEN Success = 1 THEN 1 END) AS DECIMAL) / COUNT(*) * 100
                    FROM ProcExecLog", conn);
                stats.SuccessRate = (decimal)await cmd.ExecuteScalarAsync();
            }

            // Avg duration
            if (stats.TotalExecutions > 0)
            {
                using var cmd = new SqlCommand("SELECT AVG(CAST(DurationMs AS DECIMAL)) FROM ProcExecLog", conn);
                var result = await cmd.ExecuteScalarAsync();
                stats.AvgDurationMs = result != DBNull.Value ? (decimal)result : 0;
            }

            // Active SPs count
            using (var cmd = new SqlCommand("SELECT COUNT(*) FROM ProcCatalog WHERE IsActive = 1", conn))
            {
                stats.ActiveSPs = (int)await cmd.ExecuteScalarAsync();
            }

            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/stats/recent
    /// Retorna las últimas 5 ejecuciones
    /// </summary>
    [HttpGet("recent")]
    public async Task<ActionResult<List<RecentExecution>>> GetRecentExecutions()
    {
        try
        {
            var connectionString = _config.GetConnectionString("DefaultConnection");
            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            var recent = new List<RecentExecution>();

            using var cmd = new SqlCommand(@"
                SELECT TOP 5 
                    ProcCode,
                    CASE WHEN Success = 1 THEN 'Success' ELSE 'Error' END AS Status,
                    DurationMs,
                    ExecutedAt
                FROM ProcExecLog
                ORDER BY ExecutedAt DESC", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                recent.Add(new RecentExecution
                {
                    ProcCode = reader.GetString(0),
                    Status = reader.GetString(1),
                    DurationMs = reader.IsDBNull(2) ? 0 : reader.GetInt64(2),
                    ExecutedAt = reader.GetDateTimeOffset(3).DateTime
                });
            }

            return Ok(recent);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
