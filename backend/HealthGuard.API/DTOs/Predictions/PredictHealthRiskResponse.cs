using HealthGuard.API.DTOs.HealthRecords;

namespace HealthGuard.API.DTOs.Predictions;

public class PredictHealthRiskResponse
{
    public int PredictionId { get; set; }
    public int UserId { get; set; }
    public int? HealthRecordId { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public IReadOnlyList<string> ContributingFactors { get; set; } = Array.Empty<string>();
    public string ModelName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public HealthRecordResponseDto? HealthRecord { get; set; }
}
