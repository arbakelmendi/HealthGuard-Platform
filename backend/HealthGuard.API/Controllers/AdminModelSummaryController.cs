using System.Text.Json;
using HealthGuard.API.DTOs.Admin;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/admin/model-summary")]
[Authorize(Roles = UserRoles.Admin)]
public class AdminModelSummaryController : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public AdminModelSummaryController(IWebHostEnvironment environment, IConfiguration configuration)
    {
        _environment = environment;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<ModelSummaryDto>> Get(CancellationToken cancellationToken)
    {
        var resultsPath = ResolveResultsPath();
        if (!System.IO.File.Exists(resultsPath))
        {
            throw new ApiException(StatusCodes.Status404NotFound, "ML model comparison results file was not found.");
        }

        await using var stream = System.IO.File.OpenRead(resultsPath);
        var summary = await JsonSerializer.DeserializeAsync<ModelSummaryDto>(stream, JsonOptions, cancellationToken);

        if (summary is null)
        {
            throw new ApiException(StatusCodes.Status500InternalServerError, "ML model comparison results file could not be parsed.");
        }

        summary.Classification ??= Array.Empty<ClassificationModelSummaryDto>();
        summary.Clustering ??= Array.Empty<ClusteringModelSummaryDto>();

        return Ok(summary);
    }

    private string ResolveResultsPath()
    {
        var configuredPath = _configuration["MlResults:ModelComparisonPath"];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            return Path.IsPathRooted(configuredPath)
                ? configuredPath
                : Path.GetFullPath(Path.Combine(_environment.ContentRootPath, configuredPath));
        }

        return Path.GetFullPath(Path.Combine(
            _environment.ContentRootPath,
            "..",
            "..",
            "ml",
            "model_comparison_results.json"));
    }
}
