using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Reports;

public class GenerateReportRequestDto
{
    [Required]
    public DateTime From { get; set; }

    [Required]
    public DateTime To { get; set; }

    [MaxLength(20)]
    public string? RiskLevel { get; set; }

    [MaxLength(50)]
    public string? Metric { get; set; }

    [MaxLength(50)]
    public string? ReportType { get; set; }

    [MaxLength(10)]
    public string? Format { get; set; }
}

public class GeneratedReportResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string ResultJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
}

public class ReportsSummaryDto
{
    public int PredictionCount { get; set; }
    public int HealthRecordCount { get; set; }
    public int GeneratedReportCount { get; set; }
    public double AverageRiskScore { get; set; }
    public DateTime? LastPredictionAt { get; set; }
}

public class ReportsClassificationDto
{
    public IReadOnlyList<ReportsClassificationModelDto> Models { get; set; } = Array.Empty<ReportsClassificationModelDto>();
    public ReportsClassificationModelDto? BestModel { get; set; }
}

public class ReportsClassificationModelDto
{
    public string ModelName { get; set; } = string.Empty;
    public string DatasetName { get; set; } = string.Empty;
    public double? Accuracy { get; set; }
    public double? Precision { get; set; }
    public double? Recall { get; set; }
    public double? F1Score { get; set; }
    public int[][]? ConfusionMatrix { get; set; }
    public DateOnly? TrainingDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ReportsAnalysisDto
{
    public IReadOnlyList<RiskDistributionDto> RiskDistribution { get; set; } = Array.Empty<RiskDistributionDto>();
    public IReadOnlyList<FeatureImportanceDto> FeatureImportance { get; set; } = Array.Empty<FeatureImportanceDto>();
    public IReadOnlyList<Dictionary<string, object>> ModelUsageTrends { get; set; } = Array.Empty<Dictionary<string, object>>();
}

public class RiskDistributionDto
{
    public string Level { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class FeatureImportanceDto
{
    public string Feature { get; set; } = string.Empty;
    public double Importance { get; set; }
}

public class ReportHistoryItemDto
{
    public int PredictionId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public IReadOnlyList<string> ContributingFactors { get; set; } = Array.Empty<string>();
    public string ModelName { get; set; } = string.Empty;
}
