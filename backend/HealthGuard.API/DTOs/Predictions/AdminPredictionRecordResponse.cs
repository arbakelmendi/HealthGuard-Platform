namespace HealthGuard.API.DTOs.Predictions;

public class AdminPredictionRecordResponse : PredictHealthRiskResponse
{
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
}
