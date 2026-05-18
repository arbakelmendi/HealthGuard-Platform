using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.HealthRecords;

public class CreateHealthRecordDto
{
    [Required]
    [Range(1, 120)]
    public int Age { get; set; }

    [Required]
    [Range(1, 300)]
    public decimal Weight { get; set; }

    [Required]
    [Range(30, 250)]
    public decimal Height { get; set; }

    [Required]
    [MaxLength(30)]
    public string BloodPressure { get; set; } = string.Empty;

    [Required]
    [Range(30, 220)]
    public int HeartRate { get; set; }

    [Required]
    [Range(1, 600)]
    public decimal Glucose { get; set; }
}