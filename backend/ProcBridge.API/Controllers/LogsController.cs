using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ProcBridge.Core.Models;

namespace ProcBridge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly IConfiguration _config;

    public LogsController(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// GET /api/logs
    /// Retorna logs de ejecución con filtros opcionales
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ExecutionLog>>> GetLogs(
        [FromQuery] string? status = null,
        [FromQuery] string? procCode = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            var connectionString = _config.GetConnectionString("DefaultConnection");
            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            var logs = new List<ExecutionLog>();
            var sql = "SELECT TOP (@limit) ExecutionId, ProcCode, '' as SpName, Success, DurationMs, ExecutedAt, UserId, ErrorMessage FROM ProcExecLog WHERE 1=1";

            // Apply filters
            if (!string.IsNullOrEmpty(status))
            {
                if (status.ToLower() == "success")
                    sql += " AND Success = 1";
                else if (status.ToLower() == "error")
                    sql += " AND Success = 0";
            }

            if (!string.IsNullOrEmpty(procCode))
            {
                sql += " AND ProcCode LIKE @procCode";
            }

            sql += " ORDER BY ExecutedAt DESC";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@limit", limit);
            if (!string.IsNullOrEmpty(procCode))
            {
                cmd.Parameters.AddWithValue("@procCode", $"%{procCode}%");
            }

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                logs.Add(new ExecutionLog
                {
                    ExecutionId = reader.GetGuid(0).ToString(),
                    ProcCode = reader.GetString(1),
                    SpName = reader.GetString(2),
                    IsSuccess = reader.GetBoolean(3),
                    DurationMs = reader.IsDBNull(4) ? 0 : reader.GetInt64(4),
                    ExecutedAt = reader.GetDateTimeOffset(5).ToString("o"),
                    UserId = reader.IsDBNull(6) ? null : reader.GetString(6),
                    ErrorMessage = reader.IsDBNull(7) ? null : reader.GetString(7)
                });
            }

            return Ok(logs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
