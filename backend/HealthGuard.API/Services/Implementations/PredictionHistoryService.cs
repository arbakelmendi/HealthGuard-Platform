using System.Text.Json;
using HealthGuard.API.DTOs.HealthRecords;
using HealthGuard.API.DTOs.Predictions;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class PredictionHistoryService : IPredictionHistoryService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private readonly IPredictionRepository _predictionRepository;
    private readonly IRedisCacheService _redisCacheService;

    public PredictionHistoryService(
        IPredictionRepository predictionRepository,
        IRedisCacheService redisCacheService)
    {
        _predictionRepository = predictionRepository;
        _redisCacheService = redisCacheService;
    }

    public async Task<IReadOnlyList<PredictHealthRiskResponse>> GetByUserAsync(
        int userId,
        string? riskLevel,
        string? search,
        string sortBy,
        string sortDirection,
        CancellationToken cancellationToken)
    {
        var history = await GetHistoryAsync(userId, cancellationToken);
        IEnumerable<PredictHealthRiskResponse> filtered = history;

        if (!string.IsNullOrWhiteSpace(riskLevel))
        {
            filtered = filtered.Where(prediction =>
                prediction.RiskLevel.Equals(riskLevel, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            filtered = filtered.Where(prediction =>
                prediction.Explanation.Contains(term, StringComparison.OrdinalIgnoreCase)
                || prediction.ModelName.Contains(term, StringComparison.OrdinalIgnoreCase));
        }

        return ApplySort(filtered, sortBy, sortDirection).ToList();
    }

    public async Task RefreshAsync(int userId, CancellationToken cancellationToken)
    {
        var history = await LoadFromSqlAsync(userId, cancellationToken);
        await _redisCacheService.SetAsync(GetCacheKey(userId), history, CacheDuration);
        await _redisCacheService.RemoveAsync($"healthguard:dashboard:user:{userId}");
        await _redisCacheService.RemoveAsync("healthguard:dashboard:admin");
    }

    private async Task<IReadOnlyList<PredictHealthRiskResponse>> GetHistoryAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var cacheKey = GetCacheKey(userId);
        var cachedHistory =
            await _redisCacheService.GetAsync<List<PredictHealthRiskResponse>>(cacheKey);

        if (cachedHistory is not null)
        {
            return cachedHistory;
        }

        var history = await LoadFromSqlAsync(userId, cancellationToken);
        await _redisCacheService.SetAsync(cacheKey, history, CacheDuration);
        return history;
    }

    private async Task<List<PredictHealthRiskResponse>> LoadFromSqlAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var predictions = await _predictionRepository.Query(true)
            .Include(prediction => prediction.HealthRecord)
            .Where(prediction => prediction.UserId == userId)
            .OrderByDescending(prediction => prediction.CreatedAt)
            .ToListAsync(cancellationToken);

        return predictions.Select(ToResponse).ToList();
    }

    private static IEnumerable<PredictHealthRiskResponse> ApplySort(
        IEnumerable<PredictHealthRiskResponse> predictions,
        string sortBy,
        string sortDirection)
    {
        var descending = !sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
        return sortBy.ToLowerInvariant() switch
        {
            "risklevel" => descending
                ? predictions.OrderByDescending(item => item.RiskLevel)
                : predictions.OrderBy(item => item.RiskLevel),
            "riskscore" => descending
                ? predictions.OrderByDescending(item => item.RiskScore)
                : predictions.OrderBy(item => item.RiskScore),
            "modelname" => descending
                ? predictions.OrderByDescending(item => item.ModelName)
                : predictions.OrderBy(item => item.ModelName),
            _ => descending
                ? predictions.OrderByDescending(item => item.CreatedAt)
                : predictions.OrderBy(item => item.CreatedAt)
        };
    }

    private static PredictHealthRiskResponse ToResponse(PredictionResult prediction) => new()
    {
        PredictionId = prediction.Id,
        UserId = prediction.UserId,
        HealthRecordId = prediction.HealthRecordId,
        RiskLevel = prediction.RiskLevel,
        RiskScore = prediction.RiskScore,
        Explanation = prediction.Explanation,
        ContributingFactors = ParseFactors(prediction.ContributingFactors),
        ModelName = prediction.ModelName,
        CreatedAt = prediction.CreatedAt,
        HealthRecord = prediction.HealthRecord is null
            ? null
            : ToHealthRecordResponse(prediction.HealthRecord)
    };

    private static HealthRecordResponseDto ToHealthRecordResponse(HealthRecord record) => new()
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

    private static IReadOnlyList<string> ParseFactors(string factors)
    {
        if (string.IsNullOrWhiteSpace(factors))
        {
            return Array.Empty<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<IReadOnlyList<string>>(factors)
                ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return factors.Split(
                ';',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
    }

    private static string GetCacheKey(int userId) =>
        $"healthguard:user:{userId}:predictions:history";
}
