namespace HealthGuard.API.DTOs.Settings;

public class UpdateUserSettingsDto
{
    public bool RiskLevelAlerts { get; set; } = true;
    public bool WeeklyReports { get; set; } = true;
    public bool AiRecommendations { get; set; } = true;
    public bool SystemUpdates { get; set; } = true;
    public bool HealthRecordReminders { get; set; } = true;
    public bool PredictionCompletedAlerts { get; set; } = true;
    public bool RecommendationProgressAlerts { get; set; } = true;
}
