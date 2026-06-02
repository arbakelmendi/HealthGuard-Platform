using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.DataTransfer;

public class ImportHealthRecordsRequestDto
{
    [Required]
    [MaxLength(10)]
    public string Format { get; set; } = "json";

    [Required]
    public string Content { get; set; } = string.Empty;
}
