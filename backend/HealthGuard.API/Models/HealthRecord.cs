using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class HealthRecord
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public DateTime RecordDate { get; set; } = DateTime.UtcNow;

    public int? HeartRate { get; set; }

    [MaxLength(30)]
    public string? BloodPressure { get; set; }

    public decimal? BloodSugar { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public User User { get; set; } = null!;
}
