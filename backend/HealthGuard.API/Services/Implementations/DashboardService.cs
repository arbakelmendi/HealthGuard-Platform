using System.Text.Json;
using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Dashboard;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class DashboardService : IDashboardService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private readonly ApplicationDbContext _dbContext;
    private readonly IRedisCacheService _redisCacheService;

    public DashboardService(
        ApplicationDbContext dbContext,
        IRedisCacheService redisCacheService)
    {
        _dbContext = dbContext;
        _redisCacheService = redisCacheService;
    }

    public async Task<DashboardDto> GetMineAsync(int userId, CancellationToken cancellationToken)
    {
        var cacheKey = $"healthguard:dashboard:user:{userId}";
        var cachedDashboard = await _redisCacheService.GetAsync<DashboardDto>(cacheKey);
        if (cachedDashboard is not null)
        {
            return cachedDashboard;
        }

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId && item.IsActive, cancellationToken);

        if (user is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        var records = await _dbContext.HealthRecords
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .Take(7)
            .ToListAsync(cancellationToken);

        var predictions = await _dbContext.PredictionResults
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .Take(7)
            .ToListAsync(cancellationToken);

        var symptoms = await _dbContext.SymptomLogs
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        var recommendations = await _dbContext.Recommendations
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .Take(3)
            .ToListAsync(cancellationToken);

        var notifications = await _dbContext.Notifications
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.CreatedAt)
            .Take(4)
            .ToListAsync(cancellationToken);

        var unreadNotifications = await _dbContext.Notifications
            .AsNoTracking()
            .CountAsync(item => item.UserId == userId && !item.IsRead, cancellationToken);

        var latestRecord = records.FirstOrDefault();
        var latestPrediction = predictions.FirstOrDefault();
        var recentSymptoms = symptoms
            .Where(item => item.CreatedAt >= DateTime.UtcNow.AddDays(-7))
            .ToList();

        var cardioScore = latestRecord is null ? null : CalculateCardioScore(latestRecord);
        var sleepScore = latestRecord is null ? null : CalculateSleepScore(latestRecord.SleepHours);
        var stressScore = CalculateStressScore(latestRecord, latestPrediction, recentSymptoms);
        var healthScore = CalculateHealthScore(cardioScore, sleepScore, stressScore, latestPrediction?.RiskScore);

        var dashboard = new DashboardDto
        {
            UserName = user.FirstName,
            CurrentDate = DateTime.UtcNow,
            HealthScore = healthScore,
            CardioScore = cardioScore,
            SleepScore = sleepScore,
            HydrationScore = null,
            StressScore = stressScore,
            WeeklyTrend = BuildTrend(records, predictions),
            AiInsights = BuildInsights(latestRecord, latestPrediction, symptoms, recommendations),
            TodayWellness = BuildTodayWellness(records, predictions, symptoms, recommendations),
            RecentPredictions = predictions.Take(4).Select(ToPrediction).ToList(),
            LatestSymptoms = symptoms.Take(4).Select(item => new DashboardSymptomDto
            {
                Id = item.Id,
                Symptom = item.Symptom,
                Severity = item.Severity,
                Duration = item.Duration,
                CreatedAt = item.CreatedAt
            }).ToList(),
            RecommendationsSummary = recommendations.Select(item => new DashboardRecommendationDto
            {
                Id = item.Id,
                Title = item.Title,
                Content = item.Content,
                Priority = item.Priority,
                CreatedAt = item.CreatedAt
            }).ToList(),
            NotificationsCount = unreadNotifications,
            RecentNotifications = notifications.Select(item => new DashboardNotificationDto
            {
                Id = item.Id,
                Title = item.Title,
                Message = item.Message,
                Type = item.Type,
                IsRead = item.IsRead,
                CreatedAt = item.CreatedAt
            }).ToList()
        };

        await _redisCacheService.SetAsync(cacheKey, dashboard, CacheDuration);
        return dashboard;
    }

    public async Task<AdminDashboardDto> GetAdminAsync(CancellationToken cancellationToken)
    {
        const string cacheKey = "healthguard:dashboard:admin";
        var cachedDashboard = await _redisCacheService.GetAsync<AdminDashboardDto>(cacheKey);
        if (cachedDashboard is not null)
        {
            return cachedDashboard;
        }

        var dashboard = new AdminDashboardDto
        {
            TotalUsers = await _dbContext.Users.AsNoTracking().CountAsync(cancellationToken),
            TotalHealthRecords = await _dbContext.HealthRecords.AsNoTracking().CountAsync(cancellationToken),
            TotalPredictions = await _dbContext.PredictionResults.AsNoTracking().CountAsync(cancellationToken),
            HighRiskCases = await _dbContext.PredictionResults
                .AsNoTracking()
                .CountAsync(
                    prediction => prediction.RiskLevel == "High" || prediction.RiskScore >= 70,
                    cancellationToken),
            GeneratedAt = DateTime.UtcNow
        };

        await _redisCacheService.SetAsync(cacheKey, dashboard, CacheDuration);
        return dashboard;
    }

    private static IReadOnlyList<DashboardTrendPointDto> BuildTrend(
        IReadOnlyList<HealthRecord> records,
        IReadOnlyList<PredictionResult> predictions)
    {
        if (records.Count > 0)
        {
            return records
                .OrderBy(item => item.CreatedAt)
                .Select(record =>
                {
                    var prediction = predictions
                        .Where(item => item.HealthRecordId == record.Id)
                        .OrderByDescending(item => item.CreatedAt)
                        .FirstOrDefault();

                    return new DashboardTrendPointDto
                    {
                        Date = record.CreatedAt,
                        Score = CalculateHealthScore(
                            CalculateCardioScore(record),
                            CalculateSleepScore(record.SleepHours),
                            CalculateStressScore(record, prediction, Array.Empty<SymptomLog>()),
                            prediction?.RiskScore) ?? 0
                    };
                })
                .ToList();
        }

        return predictions
            .OrderBy(item => item.CreatedAt)
            .Select(item => new DashboardTrendPointDto
            {
                Date = item.CreatedAt,
                Score = Clamp(100 - item.RiskScore)
            })
            .ToList();
    }

    private static IReadOnlyList<DashboardInsightDto> BuildInsights(
        HealthRecord? latestRecord,
        PredictionResult? latestPrediction,
        IReadOnlyList<SymptomLog> symptoms,
        IReadOnlyList<Recommendation> recommendations)
    {
        var insights = new List<DashboardInsightDto>();

        if (latestPrediction is not null)
        {
            insights.Add(new DashboardInsightDto
            {
                Type = latestPrediction.RiskScore >= 60 ? "warning" : "info",
                Title = $"{latestPrediction.RiskLevel} risk prediction",
                Message = latestPrediction.Explanation
            });

            var factors = ParseFactors(latestPrediction.ContributingFactors);
            if (factors.Count > 0)
            {
                insights.Add(new DashboardInsightDto
                {
                    Type = "warning",
                    Title = "Contributing factors",
                    Message = string.Join(", ", factors.Take(3))
                });
            }
        }

        var latestSymptom = symptoms.FirstOrDefault();
        if (latestSymptom is not null)
        {
            insights.Add(new DashboardInsightDto
            {
                Type = IsSevere(latestSymptom.Severity) ? "warning" : "info",
                Title = "Latest symptom",
                Message = $"{latestSymptom.Symptom} was logged as {latestSymptom.Severity.ToLowerInvariant()}."
            });
        }

        var recommendation = recommendations.FirstOrDefault();
        if (recommendation is not null)
        {
            insights.Add(new DashboardInsightDto
            {
                Type = "info",
                Title = recommendation.Title,
                Message = recommendation.Content
            });
        }

        if (insights.Count == 0 && latestRecord is not null)
        {
            insights.Add(new DashboardInsightDto
            {
                Type = "info",
                Title = "Health record ready",
                Message = "Your latest health record is available. Generate a prediction to receive AI insights."
            });
        }

        return insights.Take(4).ToList();
    }

    private static IReadOnlyList<DashboardWellnessItemDto> BuildTodayWellness(
        IReadOnlyList<HealthRecord> records,
        IReadOnlyList<PredictionResult> predictions,
        IReadOnlyList<SymptomLog> symptoms,
        IReadOnlyList<Recommendation> recommendations)
    {
        var today = DateTime.UtcNow.Date;
        var items = new List<DashboardWellnessItemDto>();

        items.AddRange(records.Where(item => item.CreatedAt.Date == today).Select(item => new DashboardWellnessItemDto
        {
            Date = item.CreatedAt,
            Title = "Health record added",
            Description = $"Blood pressure {item.BloodPressure}, heart rate {item.HeartRate} bpm.",
            Tone = "ok"
        }));

        items.AddRange(predictions.Where(item => item.CreatedAt.Date == today).Select(item => new DashboardWellnessItemDto
        {
            Date = item.CreatedAt,
            Title = "Prediction completed",
            Description = $"{item.RiskLevel} risk with a score of {item.RiskScore}/100.",
            Tone = item.RiskScore >= 60 ? "warn" : "ok"
        }));

        items.AddRange(symptoms.Where(item => item.CreatedAt.Date == today).Select(item => new DashboardWellnessItemDto
        {
            Date = item.CreatedAt,
            Title = $"{item.Symptom} logged",
            Description = $"{item.Severity} severity for {item.Duration}.",
            Tone = IsSevere(item.Severity) ? "warn" : "ok"
        }));

        items.AddRange(recommendations.Where(item => item.CreatedAt.Date == today).Select(item => new DashboardWellnessItemDto
        {
            Date = item.CreatedAt,
            Title = "Recommendation added",
            Description = item.Title,
            Tone = "ok"
        }));

        return items.OrderByDescending(item => item.Date).Take(5).ToList();
    }

    private static DashboardPredictionDto ToPrediction(PredictionResult item) => new()
    {
        Id = item.Id,
        RiskLevel = item.RiskLevel,
        RiskScore = item.RiskScore,
        Explanation = item.Explanation,
        ContributingFactors = ParseFactors(item.ContributingFactors),
        CreatedAt = item.CreatedAt
    };

    private static int? CalculateHealthScore(
        int? cardioScore,
        int? sleepScore,
        int? stressScore,
        int? riskScore)
    {
        var scores = new List<int>();
        if (cardioScore.HasValue) scores.Add(cardioScore.Value);
        if (sleepScore.HasValue) scores.Add(sleepScore.Value);
        if (stressScore.HasValue) scores.Add(stressScore.Value);
        if (riskScore.HasValue) scores.Add(Clamp(100 - riskScore.Value));
        return scores.Count == 0 ? null : (int)Math.Round(scores.Average());
    }

    private static int? CalculateCardioScore(HealthRecord record)
    {
        var scores = new List<int>();

        if (record.SystolicBp > 0 && record.DiastolicBp > 0)
        {
            var systolicPenalty = DistancePenalty(record.SystolicBp, 90, 120, 1.2);
            var diastolicPenalty = DistancePenalty(record.DiastolicBp, 60, 80, 1.5);
            scores.Add(Clamp(100 - systolicPenalty - diastolicPenalty));
        }

        if (record.HeartRate > 0)
        {
            scores.Add(Clamp(100 - DistancePenalty(record.HeartRate, 60, 100, 1.2)));
        }

        if (record.Cholesterol > 0)
        {
            scores.Add(Clamp(100 - Math.Max(0, (int)Math.Round((double)(record.Cholesterol - 200) * 0.5))));
        }

        if (!string.IsNullOrWhiteSpace(record.SmokingStatus))
        {
            var smokingPenalty = record.SmokingStatus.Contains("never", StringComparison.OrdinalIgnoreCase)
                ? 0
                : record.SmokingStatus.Contains("former", StringComparison.OrdinalIgnoreCase) ? 12 : 30;
            scores.Add(100 - smokingPenalty);
        }

        return scores.Count == 0 ? null : (int)Math.Round(scores.Average());
    }

    private static int? CalculateSleepScore(decimal sleepHours)
    {
        if (sleepHours <= 0)
        {
            return null;
        }

        return Clamp(100 - (int)Math.Round(Math.Abs((double)sleepHours - 8d) * 18d));
    }

    private static int? CalculateStressScore(
        HealthRecord? record,
        PredictionResult? prediction,
        IReadOnlyList<SymptomLog> recentSymptoms)
    {
        var scores = new List<int>();

        if (record?.StressLevel > 0)
        {
            var normalizedLevel = Math.Clamp(record.StressLevel, 1, 10);
            scores.Add(Clamp(100 - ((normalizedLevel - 1) * 11)));
        }

        if (prediction is not null)
        {
            scores.Add(Clamp(100 - prediction.RiskScore));
        }

        if (recentSymptoms.Count > 0)
        {
            var averagePenalty = recentSymptoms.Average(item => SeverityPenalty(item.Severity));
            scores.Add(Clamp(100 - (int)Math.Round(averagePenalty)));
        }

        return scores.Count == 0 ? null : (int)Math.Round(scores.Average());
    }

    private static int DistancePenalty(int value, int minimum, int maximum, double multiplier)
    {
        if (value < minimum) return (int)Math.Round((minimum - value) * multiplier);
        if (value > maximum) return (int)Math.Round((value - maximum) * multiplier);
        return 0;
    }

    private static int SeverityPenalty(string severity) =>
        severity.ToLowerInvariant() switch
        {
            "critical" => 70,
            "severe" => 50,
            "moderate" => 30,
            _ => 12
        };

    private static bool IsSevere(string severity) =>
        severity.Equals("Severe", StringComparison.OrdinalIgnoreCase)
        || severity.Equals("Critical", StringComparison.OrdinalIgnoreCase);

    private static IReadOnlyList<string> ParseFactors(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }

    private static int Clamp(int value) => Math.Clamp(value, 0, 100);
}
