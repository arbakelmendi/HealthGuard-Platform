using System.Net.Http.Json;
using System.Text.Json.Serialization;
using HealthGuard.API.DTOs.Predictions;

namespace HealthGuard.API.Services.Implementations;

public class MachineLearningPredictionService
{
    public const string ModelName = "Logistic Regression ML Model";

    private readonly HttpClient _httpClient;
    private readonly ILogger<MachineLearningPredictionService> _logger;

    public MachineLearningPredictionService(HttpClient httpClient, ILogger<MachineLearningPredictionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PredictionComputation?> TryPredictAsync(
        PredictHealthRiskRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var age = request.Age ?? throw new InvalidOperationException("Age is required for ML prediction.");
            var gender = request.Gender ?? string.Empty;
            var heightCm = request.HeightCm ?? throw new InvalidOperationException("HeightCm is required for ML prediction.");
            var weightKg = request.WeightKg ?? throw new InvalidOperationException("WeightKg is required for ML prediction.");
            var systolicBp = request.SystolicBp ?? throw new InvalidOperationException("SystolicBp is required for ML prediction.");
            var bloodSugar = request.BloodSugar ?? throw new InvalidOperationException("BloodSugar is required for ML prediction.");
            var cholesterol = request.Cholesterol ?? throw new InvalidOperationException("Cholesterol is required for ML prediction.");
            var symptoms = request.Symptoms ?? string.Empty;

            var mlRequest = new
            {
                age,
                sex = gender.Equals("male", StringComparison.OrdinalIgnoreCase) ? 1 : 0,
                cp = 0,
                trestbps = systolicBp,
                chol = decimal.ToInt32(Math.Round(cholesterol)),
                fbs = bloodSugar > 120 ? 1 : 0,
                restecg = 1,
                thalach = 150,
                exang = symptoms.Contains("chest pain", StringComparison.OrdinalIgnoreCase) ? 1 : 0,
                oldpeak = 1.0,
                slope = 1,
                ca = 0,
                thal = 2
            };

            var response = await _httpClient.PostAsJsonAsync("/predict", mlRequest, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("ML prediction API returned {StatusCode}.", response.StatusCode);
                return null;
            }

            var prediction = await response.Content.ReadFromJsonAsync<MlPredictionResponse>(cancellationToken);
            if (prediction is null)
            {
                return null;
            }

            return new PredictionComputation(
                prediction.RiskScore,
                prediction.RiskLevel,
                prediction.Explanation,
                prediction.ContributingFactors,
                CalculateBmi(heightCm, weightKg),
                ModelName);
        }
        catch (Exception ex) when (
            ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
        {
            _logger.LogWarning(ex, "ML prediction could not be completed. Falling back to rule-based prediction.");
            return null;
        }
    }

    private static decimal CalculateBmi(decimal heightCm, decimal weightKg)
    {
        var heightMeters = heightCm / 100m;
        return Math.Round(weightKg / (heightMeters * heightMeters), 2);
    }

    private sealed class MlPredictionResponse
    {
        [JsonPropertyName("riskScore")]
        public int RiskScore { get; set; }

        [JsonPropertyName("riskLevel")]
        public string RiskLevel { get; set; } = string.Empty;

        [JsonPropertyName("explanation")]
        public string Explanation { get; set; } = string.Empty;

        [JsonPropertyName("contributingFactors")]
        public IReadOnlyList<string> ContributingFactors { get; set; } = Array.Empty<string>();
    }
}
