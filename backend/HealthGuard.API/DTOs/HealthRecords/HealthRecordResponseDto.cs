namespace HealthGuard.API.DTOs.HealthRecords;

public class HealthRecordResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public decimal WeightKg { get; set; }
    public decimal HeightCm { get; set; }
    public decimal Bmi { get; set; }
    public string BloodPressure { get; set; } = string.Empty;
    public int SystolicBp { get; set; }
    public int DiastolicBp { get; set; }
    public int HeartRate { get; set; }
    public decimal Glucose { get; set; }
    public decimal BloodSugar { get; set; }
    public decimal Cholesterol { get; set; }
    public string ActivityLevel { get; set; } = string.Empty;
    public decimal SleepHours { get; set; }
    public int StressLevel { get; set; }
    public string SmokingStatus { get; set; } = string.Empty;
    public string Symptoms { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
