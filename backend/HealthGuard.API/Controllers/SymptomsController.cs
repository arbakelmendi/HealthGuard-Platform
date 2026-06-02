using System.Security.Claims;
using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.DTOs.Symptoms;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/symptoms")]
[Authorize]
public class SymptomsController : ControllerBase
{
    private static readonly HashSet<string> ValidSeverities = new(StringComparer.OrdinalIgnoreCase)
    {
        "Mild",
        "Moderate",
        "Severe",
        "Critical"
    };

    private readonly ApplicationDbContext _dbContext;

    public SymptomsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("me")]
    public async Task<ActionResult<IReadOnlyList<SymptomLogDto>>> GetMine(
        [FromQuery] string? search,
        [FromQuery] string? severity,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        var query = _dbContext.SymptomLogs
            .AsNoTracking()
            .Where(symptom => symptom.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(symptom => symptom.Symptom.Contains(term) || symptom.Duration.Contains(term) || (symptom.Notes != null && symptom.Notes.Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(severity))
        {
            query = query.Where(symptom => symptom.Severity == severity);
        }

        var descending = !sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
        query = sortBy.ToLowerInvariant() switch
        {
            "symptom" => descending ? query.OrderByDescending(item => item.Symptom) : query.OrderBy(item => item.Symptom),
            "severity" => descending ? query.OrderByDescending(item => item.Severity) : query.OrderBy(item => item.Severity),
            "duration" => descending ? query.OrderByDescending(item => item.Duration) : query.OrderBy(item => item.Duration),
            _ => descending ? query.OrderByDescending(item => item.CreatedAt) : query.OrderBy(item => item.CreatedAt)
        };

        var symptoms = await query
            .Select(symptom => ToResponse(symptom))
            .ToListAsync(cancellationToken);

        return Ok(symptoms);
    }

    [HttpPost("me")]
    public async Task<ActionResult<SymptomLogDto>> CreateMine([FromBody] UpsertSymptomLogDto request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var symptom = new SymptomLog
        {
            UserId = userId,
            Symptom = request.Symptom.Trim(),
            Severity = NormalizeSeverity(request.Severity),
            Duration = request.Duration.Trim(),
            Notes = TrimOrNull(request.Notes),
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.SymptomLogs.Add(symptom);
        await AddSymptomNotificationIfMissingAsync(symptom, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await UpdateLatestHealthRecordSymptomsAsync(userId, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetMine), ToResponse(symptom));
    }

    [HttpPut("me/{id:int}")]
    public async Task<ActionResult<SymptomLogDto>> UpdateMine(int id, [FromBody] UpsertSymptomLogDto request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var symptom = await FindMineAsync(id, cancellationToken);

        symptom.Symptom = request.Symptom.Trim();
        symptom.Severity = NormalizeSeverity(request.Severity);
        symptom.Duration = request.Duration.Trim();
        symptom.Notes = TrimOrNull(request.Notes);
        symptom.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await UpdateLatestHealthRecordSymptomsAsync(symptom.UserId, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(symptom));
    }

    [HttpDelete("me/{id:int}")]
    public async Task<ActionResult<ApiMessageResponse>> DeleteMine(int id, CancellationToken cancellationToken)
    {
        var symptom = await FindMineAsync(id, cancellationToken);
        var userId = symptom.UserId;

        _dbContext.SymptomLogs.Remove(symptom);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await UpdateLatestHealthRecordSymptomsAsync(userId, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiMessageResponse("Symptom deleted successfully."));
    }

    private async Task<SymptomLog> FindMineAsync(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var symptom = await _dbContext.SymptomLogs.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);
        if (symptom is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Symptom log not found.");
        }

        return symptom;
    }

    private async Task UpdateLatestHealthRecordSymptomsAsync(int userId, CancellationToken cancellationToken)
    {
        var latestRecord = await _dbContext.HealthRecords
            .Where(record => record.UserId == userId)
            .OrderByDescending(record => record.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestRecord is null)
        {
            return;
        }

        var recentSymptoms = await _dbContext.SymptomLogs
            .Where(symptom => symptom.UserId == userId)
            .OrderByDescending(symptom => symptom.CreatedAt)
            .Take(5)
            .Select(symptom => symptom.Symptom)
            .ToListAsync(cancellationToken);

        latestRecord.Symptoms = string.Join(", ", recentSymptoms);
    }

    private async Task AddSymptomNotificationIfMissingAsync(SymptomLog symptom, CancellationToken cancellationToken)
    {
        var severe = symptom.Severity.Equals("Severe", StringComparison.OrdinalIgnoreCase)
            || symptom.Severity.Equals("Critical", StringComparison.OrdinalIgnoreCase);
        var title = severe ? "Severe Symptom Logged" : "Symptom Logged";
        var message = severe
            ? "Consider contacting a healthcare professional if symptoms persist or worsen."
            : "Your symptom has been recorded successfully.";
        var cutoff = DateTime.UtcNow.AddMinutes(-30);

        var exists = await _dbContext.Notifications.AnyAsync(
            notification => notification.UserId == symptom.UserId
                && notification.Title == title
                && notification.Source == NotificationSources.System
                && notification.CreatedAt >= cutoff,
            cancellationToken);

        if (exists)
        {
            return;
        }

        _dbContext.Notifications.Add(new Notification
        {
            UserId = symptom.UserId,
            Title = title,
            Message = message,
            Type = severe ? NotificationTypes.Alert : NotificationTypes.Info,
            Source = NotificationSources.System,
            CreatedAt = DateTime.UtcNow
        });
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

    private static void ValidateRequest(UpsertSymptomLogDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Symptom))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Symptom is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Severity) || !ValidSeverities.Contains(request.Severity))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Severity must be Mild, Moderate, Severe, or Critical.");
        }

        if (string.IsNullOrWhiteSpace(request.Duration))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Duration is required.");
        }
    }

    private static string NormalizeSeverity(string severity)
    {
        var trimmed = severity.Trim();
        return ValidSeverities.First(item => item.Equals(trimmed, StringComparison.OrdinalIgnoreCase));
    }

    private static string? TrimOrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static SymptomLogDto ToResponse(SymptomLog symptom) => new()
    {
        Id = symptom.Id,
        UserId = symptom.UserId,
        Symptom = symptom.Symptom,
        Severity = symptom.Severity,
        Duration = symptom.Duration,
        Notes = symptom.Notes,
        CreatedAt = symptom.CreatedAt,
        UpdatedAt = symptom.UpdatedAt
    };
}
