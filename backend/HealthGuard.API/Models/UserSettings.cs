using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class UserSettings
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public bool RiskLevelAlerts { get; set; } = true;

    public bool WeeklyReports { get; set; } = true;

    public bool AiRecommendations { get; set; } = true;

    public bool SystemUpdates { get; set; } = true;

    public bool HealthRecordReminders { get; set; } = true;

    public bool PredictionCompletedAlerts { get; set; } = true;

    public bool RecommendationProgressAlerts { get; set; } = true;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
