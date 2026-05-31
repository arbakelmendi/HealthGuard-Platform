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

    [HttpGet("user/{userId:int}/latest")]
    public async Task<ActionResult<HealthRecordResponseDto>> GetLatestForUser(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

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

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IReadOnlyList<HealthRecordResponseDto>>> GetForUser(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

        var records = await _dbContext.HealthRecords
            .AsNoTracking()
            .Where(record => record.UserId == userId)
            .OrderByDescending(record => record.CreatedAt)
            .Select(record => ToResponse(record))
            .ToListAsync(cancellationToken);

        return Ok(records);
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
        var userId = request.UserId ?? GetCurrentUserId();
        EnsureCanAccessUser(userId);

        var record = new HealthRecord { UserId = userId, CreatedAt = DateTime.UtcNow };
        ApplyHealthRecordFields(record, request);

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
        var userId = request.UserId ?? GetCurrentUserId();
        EnsureCanAccessUser(userId);

        var record = await _dbContext.HealthRecords
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId, cancellationToken);

        if (record is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Health record not found.");
        }

        ApplyHealthRecordFields(record, request);

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

    private void EnsureCanAccessUser(int userId)
    {
        if (User.IsInRole(UserRoles.Admin))
        {
            return;
        }

        if (GetCurrentUserId() != userId)
        {
            throw new ApiException(StatusCodes.Status403Forbidden, "You can only access your own health records.");
        }
    }

    private static void ApplyHealthRecordFields(HealthRecord record, CreateHealthRecordDto request)
    {
        var heightCm = request.HeightCm ?? request.Height;
        var weightKg = request.WeightKg ?? request.Weight;
        var (systolicBp, diastolicBp) = ResolveBloodPressure(request.BloodPressure, request.SystolicBp, request.DiastolicBp);
        var bloodSugar = request.BloodSugar ?? request.Glucose;

        record.Age = request.Age;
        record.Gender = request.Gender.Trim();
        record.Weight = weightKg;
        record.Height = heightCm;
        record.WeightKg = weightKg;
        record.HeightCm = heightCm;
        record.Bmi = CalculateBmi(heightCm, weightKg);
        record.BloodPressure = $"{systolicBp}/{diastolicBp}";
        record.SystolicBp = systolicBp;
        record.DiastolicBp = diastolicBp;
        record.HeartRate = request.HeartRate;
        record.Glucose = bloodSugar;
        record.BloodSugar = bloodSugar;
        record.Cholesterol = request.Cholesterol;
        record.ActivityLevel = request.ActivityLevel.Trim();
        record.SleepHours = request.SleepHours;
        record.StressLevel = request.StressLevel;
        record.SmokingStatus = request.SmokingStatus.Trim();
        record.Symptoms = request.Symptoms.Trim();
    }

    private static void ApplyHealthRecordFields(HealthRecord record, UpdateHealthRecordDto request)
    {
        ApplyHealthRecordFields(record, new CreateHealthRecordDto
        {
            UserId = request.UserId,
            Age = request.Age,
            Gender = request.Gender,
            Weight = request.Weight,
            Height = request.Height,
            WeightKg = request.WeightKg,
            HeightCm = request.HeightCm,
            BloodPressure = request.BloodPressure,
            SystolicBp = request.SystolicBp,
            DiastolicBp = request.DiastolicBp,
            HeartRate = request.HeartRate,
            Glucose = request.Glucose,
            BloodSugar = request.BloodSugar,
            Cholesterol = request.Cholesterol,
            ActivityLevel = request.ActivityLevel,
            SleepHours = request.SleepHours,
            StressLevel = request.StressLevel,
            SmokingStatus = request.SmokingStatus,
            Symptoms = request.Symptoms
        });
    }

    private static (int Systolic, int Diastolic) ResolveBloodPressure(string bloodPressure, int? systolicBp, int? diastolicBp)
    {
        if (systolicBp.HasValue && diastolicBp.HasValue)
        {
            return (systolicBp.Value, diastolicBp.Value);
        }

        var parts = bloodPressure.Split('/', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 2 ||
            !int.TryParse(parts[0], out var systolic) ||
            !int.TryParse(parts[1], out var diastolic))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Blood pressure must use the format systolic/diastolic, for example 120/80.");
        }

        if (systolic is < 70 or > 250 || diastolic is < 40 or > 150)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Blood pressure values are outside the allowed range.");
        }

        return (systolic, diastolic);
    }

    private static decimal CalculateBmi(decimal heightCm, decimal weightKg)
    {
        var heightMeters = heightCm / 100m;
        return Math.Round(weightKg / (heightMeters * heightMeters), 2);
    }

    private static HealthRecordResponseDto ToResponse(HealthRecord record)
    {
        return new HealthRecordResponseDto
        {
            Id = record.Id,
            UserId = record.UserId,
            Age = record.Age,
            Gender = record.Gender,
            Weight = record.Weight,
            Height = record.Height,
            WeightKg = record.WeightKg,
            HeightCm = record.HeightCm,
            Bmi = record.Bmi,
            BloodPressure = record.BloodPressure,
            SystolicBp = record.SystolicBp,
            DiastolicBp = record.DiastolicBp,
            HeartRate = record.HeartRate,
            Glucose = record.Glucose,
            BloodSugar = record.BloodSugar,
            Cholesterol = record.Cholesterol,
            ActivityLevel = record.ActivityLevel,
            SleepHours = record.SleepHours,
            StressLevel = record.StressLevel,
            SmokingStatus = record.SmokingStatus,
            Symptoms = record.Symptoms,
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
