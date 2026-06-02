using System.Security.Claims;
using HealthGuard.API.DTOs.Datasets;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/admin/datasets")]
[Authorize(Roles = UserRoles.Admin)]
public class AdminDatasetsController : ControllerBase
{
    private readonly IDatasetService _datasetService;

    public AdminDatasetsController(IDatasetService datasetService)
    {
        _datasetService = datasetService;
    }

    [HttpGet]
    public async Task<ActionResult<DatasetListResponseDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] string sortBy = "uploadDate",
        [FromQuery] string sortDirection = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _datasetService.GetDatasetsAsync(search, type, status, sortBy, sortDirection, page, pageSize, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DatasetResponseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _datasetService.GetDatasetAsync(id, cancellationToken));
    }

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<DatasetResponseDto>> Upload(
        [FromForm] UploadDatasetRequestDto request,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        return Ok(await _datasetService.UploadAsync(GetCurrentUserId(), request, file, cancellationToken));
    }

    [HttpPost("{id:int}/replace")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<DatasetResponseDto>> Replace(
        int id,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        return Ok(await _datasetService.ReplaceAsync(GetCurrentUserId(), id, file, cancellationToken));
    }

    [HttpPost("{id:int}/archive")]
    public async Task<ActionResult<DatasetResponseDto>> Archive(int id, CancellationToken cancellationToken)
    {
        return Ok(await _datasetService.ArchiveAsync(GetCurrentUserId(), id, cancellationToken));
    }

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var parsed))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid authentication token.");
        }

        return parsed;
    }
}
