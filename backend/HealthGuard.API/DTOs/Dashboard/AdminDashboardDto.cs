namespace HealthGuard.API.DTOs.Dashboard;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }

    public int TotalHealthRecords { get; set; }

    public int TotalPredictions { get; set; }

    public int HighRiskCases { get; set; }

    public DateTime GeneratedAt { get; set; }
}
