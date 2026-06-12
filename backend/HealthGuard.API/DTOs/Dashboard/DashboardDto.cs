namespace HealthGuard.API.DTOs.Dashboard;

public class DashboardDto
{
    public string UserName { get; set; } = string.Empty;
    public DateTime CurrentDate { get; set; }
    public int? HealthScore { get; set; }
    public int? CardioScore { get; set; }
    public int? SleepScore { get; set; }
    public int? HydrationScore { get; set; }
    public int? StressScore { get; set; }
    public IReadOnlyList<DashboardTrendPointDto> WeeklyTrend { get; set; } = Array.Empty<DashboardTrendPointDto>();
    public IReadOnlyList<DashboardInsightDto> AiInsights { get; set; } = Array.Empty<DashboardInsightDto>();
    public IReadOnlyList<DashboardWellnessItemDto> TodayWellness { get; set; } = Array.Empty<DashboardWellnessItemDto>();
    public IReadOnlyList<DashboardPredictionDto> RecentPredictions { get; set; } = Array.Empty<DashboardPredictionDto>();
    public IReadOnlyList<DashboardSymptomDto> LatestSymptoms { get; set; } = Array.Empty<DashboardSymptomDto>();
    public IReadOnlyList<DashboardRecommendationDto> RecommendationsSummary { get; set; } = Array.Empty<DashboardRecommendationDto>();
    public int NotificationsCount { get; set; }
    public IReadOnlyList<DashboardNotificationDto> RecentNotifications { get; set; } = Array.Empty<DashboardNotificationDto>();
}

public class DashboardTrendPointDto
{
    public DateTime Date { get; set; }
    public int Score { get; set; }
}

public class DashboardInsightDto
{
    public string Type { get; set; } = "info";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class DashboardWellnessItemDto
{
    public DateTime Date { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Tone { get; set; } = "ok";
}

public class DashboardPredictionDto
{
    public int Id { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public IReadOnlyList<string> ContributingFactors { get; set; } = Array.Empty<string>();
    public DateTime CreatedAt { get; set; }
}

public class DashboardSymptomDto
{
    public int Id { get; set; }
    public string Symptom { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DashboardRecommendationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DashboardNotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
