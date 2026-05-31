using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class SymptomLog
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Symptom { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Severity { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string Duration { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
