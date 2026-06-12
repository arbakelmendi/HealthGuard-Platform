using System.Text;
using System.Text.Json;
using HealthGuard.API.DTOs.Admin;
using HealthGuard.API.DTOs.Reports;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;
    private readonly IPredictionRepository _predictionRepository;
    private readonly IRepository<HealthRecord> _healthRecordRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IRealtimeNotificationService _realtimeNotificationService;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public ReportService(
        IReportRepository reportRepository,
        IPredictionRepository predictionRepository,
        IRepository<HealthRecord> healthRecordRepository,
        INotificationRepository notificationRepository,
        IRealtimeNotificationService realtimeNotificationService,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _reportRepository = reportRepository;
        _predictionRepository = predictionRepository;
        _healthRecordRepository = healthRecordRepository;
        _notificationRepository = notificationRepository;
        _realtimeNotificationService = realtimeNotificationService;
        _environment = environment;
        _configuration = configuration;
    }

    public async Task<ReportsSummaryDto> GetSummaryAsync(int userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var predictions = await ScopedPredictions(userId, isAdmin).ToListAsync(cancellationToken);

        return new ReportsSummaryDto
        {
            PredictionCount = predictions.Count,
            HealthRecordCount = await ScopedHealthRecords(userId, isAdmin).CountAsync(cancellationToken),
            GeneratedReportCount = await ScopedGeneratedReports(userId, isAdmin).CountAsync(cancellationToken),
            AverageRiskScore = predictions.Count == 0 ? 0 : Math.Round(predictions.Average(prediction => prediction.RiskScore), 2),
            LastPredictionAt = predictions.Count == 0 ? null : predictions.Max(prediction => prediction.CreatedAt)
        };
    }

    public async Task<ReportsClassificationDto> GetClassificationAsync(CancellationToken cancellationToken)
    {
        var modelSummary = await LoadModelSummaryAsync(cancellationToken);
        var models = modelSummary.Classification
            .OrderByDescending(model => model.F1Score ?? -1)
            .Select(model => new ReportsClassificationModelDto
            {
                ModelName = model.ModelName,
                DatasetName = model.DatasetName,
                Accuracy = model.Accuracy,
                Precision = model.Precision,
                Recall = model.Recall,
                F1Score = model.F1Score,
                ConfusionMatrix = model.ConfusionMatrix,
                TrainingDate = model.TrainingDate,
                Status = model.Status
            })
            .ToList();

        return new ReportsClassificationDto
        {
            Models = models,
            BestModel = models.FirstOrDefault()
        };
    }

    public async Task<ReportsAnalysisDto> GetAnalysisAsync(int userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var predictions = await ScopedPredictions(userId, isAdmin)
            .OrderBy(prediction => prediction.CreatedAt)
            .ToListAsync(cancellationToken);

        var total = predictions.Count;
        var riskDistribution = predictions
            .GroupBy(prediction => prediction.RiskLevel)
            .Select(group => new RiskDistributionDto
            {
                Level = group.Key,
                Count = group.Count(),
                Percentage = total == 0 ? 0 : Math.Round(group.Count() * 100d / total, 1)
            })
            .OrderBy(item => item.Level)
            .ToList();

        var modelNames = predictions
            .Select(prediction => prediction.ModelName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(name => name)
            .ToList();

        var trends = predictions
            .GroupBy(prediction => new { Month = prediction.CreatedAt.ToString("MMM yyyy"), prediction.ModelName })
            .GroupBy(group => group.Key.Month)
            .Select(monthGroup =>
            {
                var row = new Dictionary<string, object> { ["month"] = monthGroup.Key };
                foreach (var modelName in modelNames)
                {
                    row[NormalizeTrendKey(modelName)] = monthGroup
                        .Where(group => group.Key.ModelName.Equals(modelName, StringComparison.OrdinalIgnoreCase))
                        .Sum(group => group.Count());
                }

                return row;
            })
            .ToList();

        var modelSummary = await LoadModelSummaryAsync(cancellationToken);
        var featureImportance = modelSummary.FeatureImportance
            .Where(item => !string.IsNullOrWhiteSpace(item.Feature))
            .OrderByDescending(item => item.Importance)
            .Select(item => new FeatureImportanceDto
            {
                Feature = item.Feature,
                Importance = item.Importance
            })
            .ToList();

        return new ReportsAnalysisDto
        {
            RiskDistribution = riskDistribution,
            FeatureImportance = featureImportance,
            ModelUsageTrends = trends
        };
    }

    public async Task<IReadOnlyList<ReportHistoryItemDto>> GetHistoryAsync(int userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var predictions = await ScopedPredictions(userId, isAdmin)
            .Include(prediction => prediction.User)
            .OrderByDescending(prediction => prediction.CreatedAt)
            .ToListAsync(cancellationToken);

        return predictions.Select(prediction => new ReportHistoryItemDto
        {
            PredictionId = prediction.Id,
            UserId = prediction.UserId,
            UserName = prediction.User?.FullName ?? string.Empty,
            UserEmail = prediction.User?.Email ?? string.Empty,
            Date = prediction.CreatedAt,
            RiskLevel = prediction.RiskLevel,
            RiskScore = prediction.RiskScore,
            ContributingFactors = ParseFactors(prediction.ContributingFactors),
            ModelName = prediction.ModelName
        }).ToList();
    }

    public async Task<GeneratedReportResponseDto> GenerateAsync(int userId, bool isAdmin, GenerateReportRequestDto request, CancellationToken cancellationToken)
    {
        if (request.To < request.From)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Report end date must be after the start date.");
        }

        var healthRecords = await ScopedHealthRecords(userId, isAdmin)
            .Where(record => record.CreatedAt >= request.From && record.CreatedAt <= request.To)
            .OrderBy(record => record.CreatedAt)
            .ToListAsync(cancellationToken);

        var predictionsQuery = ScopedPredictions(userId, isAdmin)
            .Where(prediction => prediction.CreatedAt >= request.From && prediction.CreatedAt <= request.To);

        if (!string.IsNullOrWhiteSpace(request.RiskLevel))
        {
            predictionsQuery = predictionsQuery.Where(prediction => prediction.RiskLevel == request.RiskLevel);
        }

        var predictions = await predictionsQuery.OrderByDescending(prediction => prediction.CreatedAt).ToListAsync(cancellationToken);

        var result = new
        {
            healthRecordCount = healthRecords.Count,
            predictionCount = predictions.Count,
            averageBmi = healthRecords.Count == 0 ? 0 : Math.Round(healthRecords.Average(record => record.Bmi), 2),
            averageRiskScore = predictions.Count == 0 ? 0 : Math.Round(predictions.Average(prediction => prediction.RiskScore), 2),
            riskLevels = predictions.GroupBy(prediction => prediction.RiskLevel).ToDictionary(group => group.Key, group => group.Count()),
            records = healthRecords.Select(record => new { record.UserId, record.CreatedAt, record.Bmi, record.BloodPressure, record.BloodSugar, record.Cholesterol, record.HeartRate }),
            predictions = predictions.Select(prediction => new { prediction.Id, prediction.UserId, prediction.CreatedAt, prediction.RiskLevel, prediction.RiskScore, prediction.ModelName })
        };

        var report = new GeneratedReport
        {
            UserId = userId,
            Title = isAdmin
                ? $"All users health report {request.From:yyyy-MM-dd} to {request.To:yyyy-MM-dd}"
                : $"Health report {request.From:yyyy-MM-dd} to {request.To:yyyy-MM-dd}",
            FromDate = request.From,
            ToDate = request.To,
            ReportType = string.IsNullOrWhiteSpace(request.ReportType) ? "HealthSummary" : request.ReportType.Trim(),
            FiltersJson = JsonSerializer.Serialize(new { request.RiskLevel, request.Metric, request.Format }),
            ResultJson = JsonSerializer.Serialize(result),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _reportRepository.Add(report);
        await _reportRepository.SaveChangesAsync(cancellationToken);

        var notification = new Notification
        {
            UserId = userId,
            Title = "Report Generated",
            Message = "Your health report is ready to export.",
            Type = NotificationTypes.Info,
            Source = NotificationSources.Report,
            CreatedAt = DateTime.UtcNow
        };
        _notificationRepository.Add(notification);
        await _notificationRepository.SaveChangesAsync(cancellationToken);
        await _realtimeNotificationService.SendNotificationAsync(notification, cancellationToken);

        return ToResponse(report);
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> ExportAsync(int userId, bool isAdmin, int reportId, string format, CancellationToken cancellationToken)
    {
        var report = await ScopedGeneratedReports(userId, isAdmin)
            .FirstOrDefaultAsync(item => item.Id == reportId, cancellationToken);

        if (report is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Report not found.");
        }

        var normalized = format.Trim().ToLowerInvariant();
        var fileBase = $"healthguard-report-{report.Id}";

        if (normalized == "json")
        {
            return (Encoding.UTF8.GetBytes(report.ResultJson), "application/json", $"{fileBase}.json");
        }

        if (normalized == "csv")
        {
            var csv = $"Id,Title,From,To,Result{Environment.NewLine}{report.Id},\"{Escape(report.Title)}\",{report.FromDate:O},{report.ToDate:O},\"{Escape(report.ResultJson)}\"";
            return (Encoding.UTF8.GetBytes(csv), "text/csv", $"{fileBase}.csv");
        }

        if (normalized is "excel" or "xlsx" or "xls")
        {
            var html = $"""
                <html><body><table>
                <tr><th>Id</th><th>Title</th><th>From</th><th>To</th><th>Result JSON</th></tr>
                <tr><td>{report.Id}</td><td>{System.Net.WebUtility.HtmlEncode(report.Title)}</td><td>{report.FromDate:O}</td><td>{report.ToDate:O}</td><td>{System.Net.WebUtility.HtmlEncode(report.ResultJson)}</td></tr>
                </table></body></html>
                """;
            return (Encoding.UTF8.GetBytes(html), "application/vnd.ms-excel", $"{fileBase}.xls");
        }

        throw new ApiException(StatusCodes.Status400BadRequest, "Format must be json, csv, or excel.");
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> ExportAllAsync(int userId, bool isAdmin, string format, int? predictionId, CancellationToken cancellationToken)
    {
        var history = await GetHistoryAsync(userId, isAdmin, cancellationToken);
        if (predictionId.HasValue)
        {
            history = history.Where(item => item.PredictionId == predictionId.Value).ToList();
        }

        var payload = new
        {
            scope = isAdmin ? "All Users" : "Personal",
            summary = await GetSummaryAsync(userId, isAdmin, cancellationToken),
            history
        };

        var normalized = format.Trim().ToLowerInvariant();
        var fileBase = predictionId.HasValue ? $"healthguard-prediction-{predictionId.Value}" : "healthguard-reports";

        if (normalized == "json")
        {
            return (Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload)), "application/json", $"{fileBase}.json");
        }

        if (normalized == "csv")
        {
            var lines = new List<string> { "PredictionId,UserId,UserName,UserEmail,Date,RiskLevel,RiskScore,ModelName,ContributingFactors" };
            lines.AddRange(history.Select(item => $"{item.PredictionId},{item.UserId},\"{Escape(item.UserName)}\",\"{Escape(item.UserEmail)}\",{item.Date:O},{Escape(item.RiskLevel)},{item.RiskScore},\"{Escape(item.ModelName)}\",\"{Escape(string.Join("; ", item.ContributingFactors))}\""));
            return (Encoding.UTF8.GetBytes(string.Join(Environment.NewLine, lines)), "text/csv", $"{fileBase}.csv");
        }

        if (normalized is "excel" or "xlsx" or "xls")
        {
            var rows = history.Select(item => $"<tr><td>{item.PredictionId}</td><td>{item.UserId}</td><td>{System.Net.WebUtility.HtmlEncode(item.UserName)}</td><td>{System.Net.WebUtility.HtmlEncode(item.UserEmail)}</td><td>{item.Date:O}</td><td>{System.Net.WebUtility.HtmlEncode(item.RiskLevel)}</td><td>{item.RiskScore}</td><td>{System.Net.WebUtility.HtmlEncode(item.ModelName)}</td><td>{System.Net.WebUtility.HtmlEncode(string.Join("; ", item.ContributingFactors))}</td></tr>");
            var html = $"<html><body><table><tr><th>PredictionId</th><th>UserId</th><th>UserName</th><th>UserEmail</th><th>Date</th><th>RiskLevel</th><th>RiskScore</th><th>ModelName</th><th>ContributingFactors</th></tr>{string.Join("", rows)}</table></body></html>";
            return (Encoding.UTF8.GetBytes(html), "application/vnd.ms-excel", $"{fileBase}.xls");
        }

        throw new ApiException(StatusCodes.Status400BadRequest, "Format must be json, csv, or excel.");
    }

    private static GeneratedReportResponseDto ToResponse(GeneratedReport report) => new()
    {
        Id = report.Id,
        Title = report.Title,
        ReportType = report.ReportType,
        FromDate = report.FromDate,
        ToDate = report.ToDate,
        ResultJson = report.ResultJson,
        CreatedAt = report.CreatedAt
    };

    private static string Escape(string value) => value.Replace("\"", "\"\"");

    private IQueryable<PredictionResult> ScopedPredictions(int userId, bool isAdmin)
    {
        var query = _predictionRepository.Query(true);
        return isAdmin ? query : query.Where(prediction => prediction.UserId == userId);
    }

    private IQueryable<HealthRecord> ScopedHealthRecords(int userId, bool isAdmin)
    {
        var query = _healthRecordRepository.Query(true);
        return isAdmin ? query : query.Where(record => record.UserId == userId);
    }

    private IQueryable<GeneratedReport> ScopedGeneratedReports(int userId, bool isAdmin)
    {
        var query = _reportRepository.Query(true);
        return isAdmin ? query : query.Where(report => report.UserId == userId);
    }

    private async Task<ModelSummaryDto> LoadModelSummaryAsync(CancellationToken cancellationToken)
    {
        var path = ResolveModelResultsPath();
        if (!File.Exists(path))
        {
            return new ModelSummaryDto();
        }

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<ModelSummaryDto>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken) ?? new ModelSummaryDto();
    }

    private string ResolveModelResultsPath()
    {
        var configuredPath = _configuration["MlResults:ModelComparisonPath"];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            return Path.IsPathRooted(configuredPath)
                ? configuredPath
                : Path.GetFullPath(Path.Combine(_environment.ContentRootPath, configuredPath));
        }

        return Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "..", "ml", "model_comparison_results.json"));
    }

    private static IReadOnlyList<string> ParseFactors(string factors)
    {
        if (string.IsNullOrWhiteSpace(factors))
        {
            return Array.Empty<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<IReadOnlyList<string>>(factors) ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return factors.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
    }

    private static string NormalizeTrendKey(string modelName)
    {
        var cleaned = new string(modelName.Where(char.IsLetterOrDigit).ToArray());
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return "model";
        }

        return char.ToLowerInvariant(cleaned[0]) + cleaned[1..];
    }
}
