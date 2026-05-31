namespace HealthGuard.API.DTOs.Settings;

public class UserSettingsDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool RiskLevelAlerts { get; set; }
    public bool WeeklyReports { get; set; }
    public bool AiRecommendations { get; set; }
    public bool SystemUpdates { get; set; }
    public bool HealthRecordReminders { get; set; }
    public bool PredictionCompletedAlerts { get; set; }
    public bool RecommendationProgressAlerts { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
