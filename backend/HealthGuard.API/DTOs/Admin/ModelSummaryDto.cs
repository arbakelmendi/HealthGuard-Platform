using System.Text.Json;

namespace HealthGuard.API.DTOs.Admin;

public class ModelSummaryDto
{
    public ModelSummarySourceDto Source { get; set; } = new();

    public IReadOnlyList<ClassificationModelSummaryDto> Classification { get; set; } = Array.Empty<ClassificationModelSummaryDto>();

    public IReadOnlyList<ClusteringModelSummaryDto> Clustering { get; set; } = Array.Empty<ClusteringModelSummaryDto>();

    public IReadOnlyList<ModelFeatureImportanceDto> FeatureImportance { get; set; } = Array.Empty<ModelFeatureImportanceDto>();
}

public class ModelSummarySourceDto
{
    public string Notebook { get; set; } = string.Empty;
    public string Dataset { get; set; } = string.Empty;
    public DateTime? ExportedAt { get; set; }
    public string? Notes { get; set; }
}

public class ClassificationModelSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string DatasetName { get; set; } = string.Empty;
    public double? Accuracy { get; set; }
    public double? Precision { get; set; }
    public double? Recall { get; set; }
    public double? F1Score { get; set; }
    public int[][]? ConfusionMatrix { get; set; }
    public Dictionary<string, JsonElement>? BestHyperparameters { get; set; }
    public DateOnly? TrainingDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ClusteringModelSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string DatasetName { get; set; } = string.Empty;
    public string AlgorithmName { get; set; } = string.Empty;
    public int? NumberOfClusters { get; set; }
    public double? SilhouetteScore { get; set; }
    public Dictionary<string, JsonElement>? PcaVisualization { get; set; }
    public Dictionary<string, JsonElement>? LabelComparison { get; set; }
    public Dictionary<string, JsonElement>? BestHyperparameters { get; set; }
    public DateOnly? TrainingDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ModelFeatureImportanceDto
{
    public string Feature { get; set; } = string.Empty;
    public double Importance { get; set; }
}
