using Microsoft.Data.SqlClient;
using ProcBridge.Core.Interfaces;
using ProcBridge.Core.Models;
using System.Diagnostics;
using System.Transactions;

namespace ProcBridge.Engine;

/// <summary>
/// Motor principal de ProcBridge.
/// Ejecuta stored procedures dinámicamente con catálogo y logging.
/// </summary>
public class ProcBridgeEngine : IProcBridge
{
    private readonly string _connectionString;
    private readonly CatalogService _catalogService;
    private readonly ParameterMapper _parameterMapper;
    private readonly ExecutionLogger _executionLogger;

    public ProcBridgeEngine(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        _catalogService = new CatalogService(connectionString);
        _parameterMapper = new ParameterMapper();
        _executionLogger = new ExecutionLogger(connectionString);
    }

    public async Task<ProcResult> ExecuteAsync(ProcRequest request, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var executionId = Guid.NewGuid();

        try
        {
            // 1. Validar request
            if (string.IsNullOrWhiteSpace(request.ProcCode))
            {
                return CreateErrorResult(executionId, request.ProcCode, stopwatch, 
                    "ProcCode is required");
            }

            // 2. Buscar en catálogo
            var catalogEntry = await _catalogService.GetByCodeAsync(request.ProcCode, cancellationToken);
            if (catalogEntry == null)
            {
                return CreateErrorResult(executionId, request.ProcCode, stopwatch,
                    $"ProcCode '{request.ProcCode}' not found in catalog");
            }

            if (!catalogEntry.IsActive)
            {
                return CreateErrorResult(executionId, request.ProcCode, stopwatch,
                    $"ProcCode '{request.ProcCode}' is inactive");
            }

            // 3. Validar autenticación si es requerida
            if (catalogEntry.RequireAuth && string.IsNullOrEmpty(request.Meta.UserId))
            {
                return CreateErrorResult(executionId, request.ProcCode, stopwatch,
                    "Authentication required but UserId not provided");
            }

            // 4. Ejecutar SP (con o sin transacción)
            List<ResultSet> resultSets;
            if (catalogEntry.UseTransaction)
            {
                using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
                resultSets = await ExecuteStoredProcedureAsync(catalogEntry.SpName, request.Payload, cancellationToken);
                scope.Complete();
            }
            else
            {
                resultSets = await ExecuteStoredProcedureAsync(catalogEntry.SpName, request.Payload, cancellationToken);
            }

            stopwatch.Stop();

            // 5. Crear resultado exitoso
            var result = new ProcResult
            {
                IsOk = true,
                Data = new ProcData { ResultSets = resultSets },
                Meta = new ProcResultMeta
                {
                    ExecutionId = executionId,
                    ProcCode = request.ProcCode,
                    SpName = catalogEntry.SpName,
                    DurationMs = stopwatch.ElapsedMilliseconds,
                    ResultSetCount = resultSets.Count,
                    ExecutedAt = DateTimeOffset.UtcNow,
                    UserId = request.Meta.UserId,
                    AppName = request.Meta.AppName,
                    CorrelationId = request.Meta.CorrelationId
                }
            };

            // 6. Log de ejecución
            await _executionLogger.LogAsync(result, request, cancellationToken);

            return result;
        }
        catch (SqlException ex)
        {
            stopwatch.Stop();
            var errorResult = CreateErrorResult(executionId, request.ProcCode, stopwatch, 
                $"SQL Error: {ex.Message}");
            await _executionLogger.LogAsync(errorResult, request, cancellationToken);
            return errorResult;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            var errorResult = CreateErrorResult(executionId, request.ProcCode, stopwatch,
                $"Error: {ex.Message}");
            await _executionLogger.LogAsync(errorResult, request, cancellationToken);
            return errorResult;
        }
    }

    private async Task<List<ResultSet>> ExecuteStoredProcedureAsync(
        string spName, 
        object? payload, 
        CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync(cancellationToken);

        await using var cmd = new SqlCommand(spName, conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure,
            CommandTimeout = 300 // 5 minutos
        };

        // Mapear parámetros desde el payload
        _parameterMapper.MapParameters(cmd, payload);

        // Ejecutar y capturar result sets
        var resultSets = new List<ResultSet>();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

        do
        {
            var resultSet = new ResultSet();

            // Capturar columnas
            for (int i = 0; i < reader.FieldCount; i++)
            {
                resultSet.Columns.Add(reader.GetName(i));
            }

            // Capturar filas
            while (await reader.ReadAsync(cancellationToken))
            {
                var row = new Dictionary<string, object?>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    row[resultSet.Columns[i]] = value;
                }
                resultSet.Rows.Add(row);
            }

            if (resultSet.Columns.Count > 0)
            {
                resultSets.Add(resultSet);
            }

        } while (await reader.NextResultAsync(cancellationToken));

        return resultSets;
    }

    private ProcResult CreateErrorResult(Guid executionId, string procCode, Stopwatch stopwatch, string errorMessage)
    {
        return new ProcResult
        {
            IsOk = false,
            ErrorMessage = errorMessage,
            Meta = new ProcResultMeta
            {
                ExecutionId = executionId,
                ProcCode = procCode,
                DurationMs = stopwatch.ElapsedMilliseconds,
                ExecutedAt = DateTimeOffset.UtcNow
            }
        };
    }
}
