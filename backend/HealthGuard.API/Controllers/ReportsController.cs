using System.Security.Claims;
using HealthGuard.API.DTOs.Reports;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ReportsSummaryDto>> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(await _reportService.GetSummaryAsync(GetCurrentUserId(), IsAdmin(), cancellationToken));
    }

    [HttpGet("classification")]
    public async Task<ActionResult<ReportsClassificationDto>> GetClassification(CancellationToken cancellationToken)
    {
        return Ok(await _reportService.GetClassificationAsync(cancellationToken));
    }

    [HttpGet("analysis")]
    public async Task<ActionResult<ReportsAnalysisDto>> GetAnalysis(CancellationToken cancellationToken)
    {
        return Ok(await _reportService.GetAnalysisAsync(GetCurrentUserId(), IsAdmin(), cancellationToken));
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<ReportHistoryItemDto>>> GetHistory(CancellationToken cancellationToken)
    {
        return Ok(await _reportService.GetHistoryAsync(GetCurrentUserId(), IsAdmin(), cancellationToken));
    }

    [HttpPost("generate")]
    public async Task<ActionResult<GeneratedReportResponseDto>> Generate(
        [FromBody] GenerateReportRequestDto request,
        CancellationToken cancellationToken)
    {
        return Ok(await _reportService.GenerateAsync(GetCurrentUserId(), IsAdmin(), request, cancellationToken));
    }

    [HttpGet("{id:int}/export")]
    public async Task<IActionResult> Export(
        int id,
        [FromQuery] string format = "json",
        CancellationToken cancellationToken = default)
    {
        var export = await _reportService.ExportAsync(GetCurrentUserId(), IsAdmin(), id, format, cancellationToken);
        return File(export.Content, export.ContentType, export.FileName);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportAll(
        [FromQuery] string format = "json",
        [FromQuery] int? predictionId = null,
        CancellationToken cancellationToken = default)
    {
        var export = await _reportService.ExportAllAsync(GetCurrentUserId(), IsAdmin(), format, predictionId, cancellationToken);
        return File(export.Content, export.ContentType, export.FileName);
    }

    private bool IsAdmin() => User.IsInRole(UserRoles.Admin);

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
