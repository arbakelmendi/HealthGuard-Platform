using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class HealthRecord
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int Age { get; set; }

    [MaxLength(50)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public decimal Weight { get; set; }

    [Required]
    public decimal Height { get; set; }

    public decimal WeightKg { get; set; }

    public decimal HeightCm { get; set; }

    public decimal Bmi { get; set; }

    [Required]
    [MaxLength(30)]
    public string BloodPressure { get; set; } = string.Empty;

    public int SystolicBp { get; set; }

    public int DiastolicBp { get; set; }

    [Required]
    public int HeartRate { get; set; }

    [Required]
    public decimal Glucose { get; set; }

    public decimal BloodSugar { get; set; }

    public decimal Cholesterol { get; set; }

    [MaxLength(50)]
    public string ActivityLevel { get; set; } = string.Empty;

    public decimal SleepHours { get; set; }

    public int StressLevel { get; set; }

    [MaxLength(50)]
    public string SmokingStatus { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Symptoms { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public ICollection<PredictionResult> PredictionResults { get; set; } = new List<PredictionResult>();
}
