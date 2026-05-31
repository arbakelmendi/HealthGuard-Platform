using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.HealthRecords;

public class UpdateHealthRecordDto
{
    public int? UserId { get; set; }

    [Required]
    [Range(1, 120, ErrorMessage = "Age must be between 1 and 120.")]
    public int Age { get; set; }

    [Required]
    [MaxLength(50)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [Range(20, 300, ErrorMessage = "Weight must be between 20 and 300 kg.")]
    public decimal Weight { get; set; }

    [Required]
    [Range(50, 250, ErrorMessage = "Height must be between 50 and 250 cm.")]
    public decimal Height { get; set; }

    [Range(20, 300, ErrorMessage = "Weight must be between 20 and 300 kg.")]
    public decimal? WeightKg { get; set; }

    [Range(50, 250, ErrorMessage = "Height must be between 50 and 250 cm.")]
    public decimal? HeightCm { get; set; }

    [Required]
    [MaxLength(30)]
    public string BloodPressure { get; set; } = string.Empty;

    [Range(70, 250, ErrorMessage = "Systolic BP must be between 70 and 250.")]
    public int? SystolicBp { get; set; }

    [Range(40, 150, ErrorMessage = "Diastolic BP must be between 40 and 150.")]
    public int? DiastolicBp { get; set; }

    [Required]
    [Range(30, 220)]
    public int HeartRate { get; set; }

    [Required]
    [Range(40, 500, ErrorMessage = "Blood sugar must be between 40 and 500.")]
    public decimal Glucose { get; set; }

    [Range(40, 500, ErrorMessage = "Blood sugar must be between 40 and 500.")]
    public decimal? BloodSugar { get; set; }

    [Range(80, 400, ErrorMessage = "Cholesterol must be between 80 and 400.")]
    public decimal Cholesterol { get; set; }

    [Required]
    [MaxLength(50)]
    public string ActivityLevel { get; set; } = string.Empty;

    [Range(0, 24, ErrorMessage = "Sleep hours must be between 0 and 24.")]
    public decimal SleepHours { get; set; }

    [Range(0, 10, ErrorMessage = "Stress level must be between 0 and 10.")]
    public int StressLevel { get; set; }

    [Required]
    [MaxLength(50)]
    public string SmokingStatus { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Symptoms { get; set; } = string.Empty;
}
