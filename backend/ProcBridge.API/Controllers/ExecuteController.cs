using Microsoft.AspNetCore.Mvc;
using ProcBridge.Core.Interfaces;
using ProcBridge.Core.Models;

namespace ProcBridge.API.Controllers;

/// <summary>
/// Controller principal: ejecuta stored procedures dinámicamente.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ExecuteController : ControllerBase
{
    private readonly IProcBridge _procBridge;
    private readonly ILogger<ExecuteController> _logger;

    public ExecuteController(IProcBridge procBridge, ILogger<ExecuteController> logger)
    {
        _procBridge = procBridge;
        _logger = logger;
    }

    /// <summary>
    /// Ejecuta un stored procedure.
    /// </summary>
    /// <param name="request">Request con ProcCode y parámetros</param>
    /// <returns>Resultado de la ejecución</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ProcResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProcResult>> Execute([FromBody] ProcRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProcCode))
        {
            return BadRequest(new { error = "ProcCode is required" });
        }

        // Enrichir metadata con datos del HTTP request
        request.Meta.IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        request.Meta.AppName ??= HttpContext.Request.Headers["X-App-Name"].ToString();

        // Ejecutar
        _logger.LogInformation("Ejecutando ProcCode: {ProcCode}", request.ProcCode);
        
        var result = await _procBridge.ExecuteAsync(request);

        if (!result.IsOk)
        {
            _logger.LogError("Error ejecutando {ProcCode}: {Error}", request.ProcCode, result.ErrorMessage);
        }

        return Ok(result);
    }
}
