using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Datasets;

public class DatasetResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Records { get; set; }
    public string Source { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? UploadedByUserId { get; set; }
    public string UploadedByName { get; set; } = string.Empty;
    public string UploadedByEmail { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DatasetListResponseDto
{
    public IReadOnlyList<DatasetResponseDto> Items { get; set; } = Array.Empty<DatasetResponseDto>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class UploadDatasetRequestDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("Classification|Clustering", ErrorMessage = "Type must be Classification or Clustering.")]
    public string Type { get; set; } = "Classification";

    [MaxLength(150)]
    public string? Source { get; set; }

    [RegularExpression("Active|Processing", ErrorMessage = "Status must be Active or Processing.")]
    public string Status { get; set; } = "Active";
}
