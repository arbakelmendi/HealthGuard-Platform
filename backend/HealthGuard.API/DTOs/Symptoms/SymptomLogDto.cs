namespace HealthGuard.API.DTOs.Symptoms;

public class SymptomLogDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Symptom { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
