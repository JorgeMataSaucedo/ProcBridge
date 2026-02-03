using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ProcBridge.Core.Models;
using ProcBridge.Engine;

namespace ProcBridge.API.Controllers;

/// <summary>
/// Controller para CRUD del catálogo de procedimientos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly CatalogService _catalogService;
    private readonly IConfiguration _config;

    public CatalogController(CatalogService catalogService, IConfiguration config)
    {
        _catalogService = catalogService;
        _config = config;
    }

    /// <summary>
    /// GET /api/catalog
    /// Lista todos los procedimientos del catálogo.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CatalogEntry>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CatalogEntry>>> GetAll()
    {
        var items = await _catalogService.GetAllAsync();
        return Ok(items);
    }

    /// <summary>
    /// GET /api/catalog/{procCode}
    /// Obtiene un procedimiento por su código.
    /// </summary>
    [HttpGet("{procCode}")]
    [ProducesResponseType(typeof(CatalogEntry), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CatalogEntry>> GetByCode(string procCode)
    {
        var item = await _catalogService.GetByCodeAsync(procCode);
        
        if (item == null)
        {
            return NotFound(new { error = $"ProcCode '{procCode}' not found" });
        }

        return Ok(item);
    }
}
