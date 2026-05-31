using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Symptoms;

public class UpsertSymptomLogDto
{
    [Required]
    [StringLength(120)]
    public string Symptom { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Severity { get; set; } = string.Empty;

    [Required]
    [StringLength(80)]
    public string Duration { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }
}
