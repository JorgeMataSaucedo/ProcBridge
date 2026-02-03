using Dapper;
using Microsoft.Data.SqlClient;
using ProcBridge.Core.Models;
using System.Text.Json;

namespace ProcBridge.Engine;

/// <summary>
/// Guarda logs de ejecución en ProcExecLog.
/// </summary>
internal class ExecutionLogger
{
    private readonly string _connectionString;

    public ExecutionLogger(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task LogAsync(ProcResult result, ProcRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var conn = new SqlConnection(_connectionString);

            var sql = @"
                INSERT INTO ProcExecLog (
                    ExecutionId, 
                    ProcCode, 
                    PayloadJson, 
                    Success, 
                    ErrorMessage, 
                    DurationMs, 
                    ResultSetCount,
                    UserId, 
                    UserName, 
                    AppName, 
                    IpAddress, 
                    CorrelationId, 
                    ExecutedAt
                ) VALUES (
                    @ExecutionId, 
                    @ProcCode, 
                    @PayloadJson, 
                    @Success, 
                    @ErrorMessage, 
                    @DurationMs, 
                    @ResultSetCount,
                    @UserId, 
                    @UserName, 
                    @AppName, 
                    @IpAddress, 
                    @CorrelationId, 
                    @ExecutedAt
                )";

            await conn.ExecuteAsync(sql, new
            {
                result.Meta?.ExecutionId,
                result.Meta?.ProcCode,
                PayloadJson = JsonSerializer.Serialize(request.Payload),
                Success = result.IsOk,
                result.ErrorMessage,
                result.Meta?.DurationMs,
                result.Meta?.ResultSetCount,
                request.Meta.UserId,
                request.Meta.UserName,
                request.Meta.AppName,
                request.Meta.IpAddress,
                request.Meta.CorrelationId,
                result.Meta?.ExecutedAt
            });
        }
        catch
        {
            // Si falla el log, no queremos que afecte la ejecución principal
            // Solo lo tragamos silenciosamente
        }
    }
}
