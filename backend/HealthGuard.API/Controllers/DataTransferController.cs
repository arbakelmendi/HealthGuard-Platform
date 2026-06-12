using System.Security.Claims;
using System.Text;
using System.Text.Json;
using HealthGuard.API.DTOs.DataTransfer;
using HealthGuard.API.DTOs.HealthRecords;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/data")]
[Authorize]
public class DataTransferController : ControllerBase
{
    private readonly IApplicationDataService _dataService;

    public DataTransferController(IApplicationDataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet("health-records/export")]
    public async Task<IActionResult> ExportHealthRecords(
        [FromQuery] string format = "json",
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        var query = _dataService.Query<HealthRecord>(true).Where(record => record.UserId == userId);

        if (from.HasValue)
        {
            query = query.Where(record => record.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(record => record.CreatedAt <= to.Value);
        }

        var records = await query.OrderBy(record => record.CreatedAt).ToListAsync(cancellationToken);
        var normalized = format.Trim().ToLowerInvariant();
        await SaveExportJobAsync(userId, normalized, cancellationToken);

        if (normalized == "json")
        {
            return File(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(records)), "application/json", "health-records.json");
        }

        var csv = ToCsv(records);
        if (normalized == "csv")
        {
            return File(Encoding.UTF8.GetBytes(csv), "text/csv", "health-records.csv");
        }

        if (normalized is "excel" or "xls" or "xlsx")
        {
            return File(Encoding.UTF8.GetBytes(ToExcelHtml(records)), "application/vnd.ms-excel", "health-records.xls");
        }

        throw new ApiException(StatusCodes.Status400BadRequest, "Format must be json, csv, or excel.");
    }

    [HttpPost("health-records/import")]
    public async Task<ActionResult<object>> ImportHealthRecords(
        [FromBody] ImportHealthRecordsRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var normalized = request.Format.Trim().ToLowerInvariant();
        var records = normalized switch
        {
            "json" => JsonSerializer.Deserialize<List<CreateHealthRecordDto>>(request.Content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new(),
            "csv" => ParseCsv(request.Content),
            "excel" or "xls" or "xlsx" => ParseCsv(request.Content),
            _ => throw new ApiException(StatusCodes.Status400BadRequest, "Format must be json, csv, or excel.")
        };

        foreach (var item in records)
        {
            var heightCm = item.HeightCm ?? item.Height;
            var weightKg = item.WeightKg ?? item.Weight;
            var bloodSugar = item.BloodSugar ?? item.Glucose;
            var systolic = item.SystolicBp ?? 120;
            var diastolic = item.DiastolicBp ?? 80;
            var heightMeters = heightCm / 100m;

            _dataService.Add(new HealthRecord
            {
                UserId = userId,
                Age = item.Age,
                Gender = item.Gender.Trim(),
                Weight = weightKg,
                Height = heightCm,
                WeightKg = weightKg,
                HeightCm = heightCm,
                Bmi = Math.Round(weightKg / (heightMeters * heightMeters), 2),
                BloodPressure = $"{systolic}/{diastolic}",
                SystolicBp = systolic,
                DiastolicBp = diastolic,
                HeartRate = item.HeartRate,
                Glucose = bloodSugar,
                BloodSugar = bloodSugar,
                Cholesterol = item.Cholesterol,
                ActivityLevel = item.ActivityLevel.Trim(),
                SleepHours = item.SleepHours,
                StressLevel = item.StressLevel,
                SmokingStatus = item.SmokingStatus.Trim(),
                Symptoms = item.Symptoms.Trim(),
                CreatedAt = DateTime.UtcNow
            });
        }

        _dataService.Add(new ImportBatch
        {
            UserId = userId,
            Format = normalized,
            Status = "Completed",
            RecordsImported = records.Count,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            UpdatedBy = userId
        });

        await _dataService.SaveChangesAsync(cancellationToken);
        return Ok(new { imported = records.Count });
    }

    private async Task SaveExportJobAsync(int userId, string format, CancellationToken cancellationToken)
    {
        _dataService.Add(new DataExportJob
        {
            UserId = userId,
            Format = format,
            EntityType = "HealthRecord",
            Status = "Completed",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            UpdatedBy = userId
        });

        await _dataService.SaveChangesAsync(cancellationToken);
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

    private static string ToCsv(IEnumerable<HealthRecord> records)
    {
        var lines = new List<string> { "age,gender,heightCm,weightKg,systolicBp,diastolicBp,heartRate,bloodSugar,cholesterol,activityLevel,sleepHours,stressLevel,smokingStatus,symptoms,createdAt" };
        lines.AddRange(records.Select(record => $"{record.Age},\"{Escape(record.Gender)}\",{record.HeightCm},{record.WeightKg},{record.SystolicBp},{record.DiastolicBp},{record.HeartRate},{record.BloodSugar},{record.Cholesterol},\"{Escape(record.ActivityLevel)}\",{record.SleepHours},{record.StressLevel},\"{Escape(record.SmokingStatus)}\",\"{Escape(record.Symptoms)}\",{record.CreatedAt:O}"));
        return string.Join(Environment.NewLine, lines);
    }

    private static string ToExcelHtml(IEnumerable<HealthRecord> records)
    {
        var rows = records.Select(record => $"<tr><td>{record.Age}</td><td>{record.Gender}</td><td>{record.HeightCm}</td><td>{record.WeightKg}</td><td>{record.BloodPressure}</td><td>{record.BloodSugar}</td><td>{record.Cholesterol}</td><td>{record.CreatedAt:O}</td></tr>");
        return $"<html><body><table><tr><th>Age</th><th>Gender</th><th>Height cm</th><th>Weight kg</th><th>BP</th><th>Blood sugar</th><th>Cholesterol</th><th>Created</th></tr>{string.Join("", rows)}</table></body></html>";
    }

    private static List<CreateHealthRecordDto> ParseCsv(string content)
    {
        return content.Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Skip(1)
            .Select(line => line.Trim().Split(','))
            .Where(parts => parts.Length >= 14)
            .Select(parts => new CreateHealthRecordDto
            {
                Age = int.Parse(parts[0]),
                Gender = parts[1].Trim('"'),
                Height = decimal.Parse(parts[2]),
                HeightCm = decimal.Parse(parts[2]),
                Weight = decimal.Parse(parts[3]),
                WeightKg = decimal.Parse(parts[3]),
                SystolicBp = int.Parse(parts[4]),
                DiastolicBp = int.Parse(parts[5]),
                BloodPressure = $"{parts[4]}/{parts[5]}",
                HeartRate = int.Parse(parts[6]),
                Glucose = decimal.Parse(parts[7]),
                BloodSugar = decimal.Parse(parts[7]),
                Cholesterol = decimal.Parse(parts[8]),
                ActivityLevel = parts[9].Trim('"'),
                SleepHours = decimal.Parse(parts[10]),
                StressLevel = int.Parse(parts[11]),
                SmokingStatus = parts[12].Trim('"'),
                Symptoms = parts[13].Trim('"')
            })
            .ToList();
    }

    private static string Escape(string value) => value.Replace("\"", "\"\"");
}
