using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class PredictionResult
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public int? HealthRecordId { get; set; }

    [Required]
    [MaxLength(20)]
    public string RiskLevel { get; set; } = string.Empty;

    public int RiskScore { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Explanation { get; set; } = string.Empty;

    [Required]
    public string ContributingFactors { get; set; } = "[]";

    [Required]
    [MaxLength(100)]
    public string ModelName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public HealthRecord? HealthRecord { get; set; }

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
