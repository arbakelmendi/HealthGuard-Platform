using System.Security.Claims;
using HealthGuard.API.Data;
using HealthGuard.API.DTOs.HealthRecords;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/health-records")]
[Authorize]
public class HealthRecordsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public HealthRecordsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<HealthRecordResponseDto>>> GetMyHealthRecords(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 10;
        }

        var query = _dbContext.HealthRecords
            .AsNoTracking()
            .Where(record => record.UserId == userId);

        if (from.HasValue)
        {
            query = query.Where(record => record.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(record => record.CreatedAt <= to.Value);
        }

        var records = await query
            .OrderByDescending(record => record.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(record => ToResponse(record))
            .ToListAsync(cancellationToken);

        return Ok(records);
    }

    [HttpGet("latest")]
    public async Task<ActionResult<HealthRecordResponseDto>> GetLatestHealthSnapshot(
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var latestRecord = await _dbContext.HealthRecords
            .AsNoTracking()
            .Where(record => record.UserId == userId)
            .OrderByDescending(record => record.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestRecord is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "No health records found.");
        }

        return Ok(ToResponse(latestRecord));
    }

    [HttpGet("chart-data")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetChartData(
        [FromQuery] string? metric,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var normalizedMetric = metric?.ToLower();

        var records = await _dbContext.HealthRecords
            .AsNoTracking()
            .Where(record => record.UserId == userId)
            .OrderBy(record => record.CreatedAt)
            .ToListAsync(cancellationToken);

        var chartData = records.Select(record => new
        {
            date = record.CreatedAt,
            weight = normalizedMetric == null || normalizedMetric == "weight" ? record.Weight : (decimal?)null,
            glucose = normalizedMetric == null || normalizedMetric == "glucose" ? record.Glucose : (decimal?)null,
            heartRate = normalizedMetric == null || normalizedMetric == "heartrate" ? record.HeartRate : (int?)null,
            bloodPressure = normalizedMetric == null || normalizedMetric == "bp" ? record.BloodPressure : null
        });

        return Ok(chartData);
    }

    [HttpGet("comparison")]
    public async Task<ActionResult<object>> CompareCurrentWithPrevious(
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var records = await _dbContext.HealthRecords
            .AsNoTracking()
            .Where(record => record.UserId == userId)
            .OrderByDescending(record => record.CreatedAt)
            .Take(2)
            .ToListAsync(cancellationToken);

        if (records.Count < 2)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "At least two health records are required for comparison.");
        }

        var current = records[0];
        var previous = records[1];

        var result = new
        {
            current = ToResponse(current),
            previous = ToResponse(previous),
            changes = new
            {
                weight = current.Weight - previous.Weight,
                glucose = current.Glucose - previous.Glucose,
                heartRate = current.HeartRate - previous.HeartRate,
                weightTrend = GetTrend(current.Weight, previous.Weight),
                glucoseTrend = GetTrend(current.Glucose, previous.Glucose),
                heartRateTrend = GetTrend(current.HeartRate, previous.HeartRate)
            }
        };

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<HealthRecordResponseDto>> GetHealthRecord(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var record = await _dbContext.HealthRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId, cancellationToken);

        if (record is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Health record not found.");
        }

        return Ok(ToResponse(record));
    }

    [HttpPost]
    public async Task<ActionResult<HealthRecordResponseDto>> CreateHealthRecord(
        [FromBody] CreateHealthRecordDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var record = new HealthRecord
        {
            UserId = userId,
            Age = request.Age,
            Weight = request.Weight,
            Height = request.Height,
            BloodPressure = request.BloodPressure.Trim(),
            HeartRate = request.HeartRate,
            Glucose = request.Glucose,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.HealthRecords.Add(record);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetHealthRecord), new { id = record.Id }, ToResponse(record));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<HealthRecordResponseDto>> UpdateHealthRecord(
        int id,
        [FromBody] UpdateHealthRecordDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var record = await _dbContext.HealthRecords
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId, cancellationToken);

        if (record is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Health record not found.");
        }

        record.Age = request.Age;
        record.Weight = request.Weight;
        record.Height = request.Height;
        record.BloodPressure = request.BloodPressure.Trim();
        record.HeartRate = request.HeartRate;
        record.Glucose = request.Glucose;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(record));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteHealthRecord(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var record = await _dbContext.HealthRecords
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId, cancellationToken);

        if (record is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Health record not found.");
        }

        _dbContext.HealthRecords.Remove(record);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Health record deleted successfully." });
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

    private static HealthRecordResponseDto ToResponse(HealthRecord record)
    {
        return new HealthRecordResponseDto
        {
            Id = record.Id,
            UserId = record.UserId,
            Age = record.Age,
            Weight = record.Weight,
            Height = record.Height,
            BloodPressure = record.BloodPressure,
            HeartRate = record.HeartRate,
            Glucose = record.Glucose,
            CreatedAt = record.CreatedAt
        };
    }

    private static string GetTrend(decimal current, decimal previous)
    {
        if (current > previous)
        {
            return "increase";
        }

        if (current < previous)
        {
            return "decrease";
        }

        return "same";
    }

    private static string GetTrend(int current, int previous)
    {
        if (current > previous)
        {
            return "increase";
        }

        if (current < previous)
        {
            return "decrease";
        }

        return "same";
    }
}