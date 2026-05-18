namespace HealthGuard.API.DTOs.HealthRecords;

public class HealthRecordResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Age { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public string BloodPressure { get; set; } = string.Empty;
    public int HeartRate { get; set; }
    public decimal Glucose { get; set; }
    public DateTime CreatedAt { get; set; }
}