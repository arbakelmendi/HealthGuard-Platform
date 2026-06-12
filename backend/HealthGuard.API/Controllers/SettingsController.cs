using System.Security.Claims;
using HealthGuard.API.DTOs.Settings;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IApplicationDataService _dataService;

    public SettingsController(IApplicationDataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserSettingsDto>> GetMySettings(CancellationToken cancellationToken)
    {
        return Ok(ToResponse(await GetOrCreateSettingsAsync(GetCurrentUserId(), cancellationToken)));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserSettingsDto>> UpdateMySettings([FromBody] UpdateUserSettingsDto request, CancellationToken cancellationToken)
    {
        var settings = await GetOrCreateSettingsAsync(GetCurrentUserId(), cancellationToken);

        settings.RiskLevelAlerts = request.RiskLevelAlerts;
        settings.WeeklyReports = request.WeeklyReports;
        settings.AiRecommendations = request.AiRecommendations;
        settings.SystemUpdates = request.SystemUpdates;
        settings.HealthRecordReminders = request.HealthRecordReminders;
        settings.PredictionCompletedAlerts = request.PredictionCompletedAlerts;
        settings.RecommendationProgressAlerts = request.RecommendationProgressAlerts;
        settings.UpdatedAt = DateTime.UtcNow;

        await _dataService.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(settings));
    }

    private async Task<UserSettings> GetOrCreateSettingsAsync(int userId, CancellationToken cancellationToken)
    {
        var settings = await _dataService.Query<UserSettings>().FirstOrDefaultAsync(item => item.UserId == userId, cancellationToken);
        if (settings is not null)
        {
            return settings;
        }

        var userExists = await _dataService.Query<User>(true).AnyAsync(user => user.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        var now = DateTime.UtcNow;
        settings = new UserSettings
        {
            UserId = userId,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dataService.Add(settings);
        await _dataService.SaveChangesAsync(cancellationToken);

        return settings;
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

    private static UserSettingsDto ToResponse(UserSettings settings) => new()
    {
        Id = settings.Id,
        UserId = settings.UserId,
        RiskLevelAlerts = settings.RiskLevelAlerts,
        WeeklyReports = settings.WeeklyReports,
        AiRecommendations = settings.AiRecommendations,
        SystemUpdates = settings.SystemUpdates,
        HealthRecordReminders = settings.HealthRecordReminders,
        PredictionCompletedAlerts = settings.PredictionCompletedAlerts,
        RecommendationProgressAlerts = settings.RecommendationProgressAlerts,
        CreatedAt = settings.CreatedAt,
        UpdatedAt = settings.UpdatedAt
    };
}
