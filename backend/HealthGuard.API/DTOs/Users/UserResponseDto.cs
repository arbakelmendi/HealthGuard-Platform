namespace HealthGuard.API.DTOs.Users;

public class UserResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public string? Phone { get; set; }
    public string? City { get; set; }
    public string? BloodType { get; set; }
    public string? ActivityLevel { get; set; }
    public string? ChronicConditions { get; set; }
    public string? Allergies { get; set; }
    public string? SmokingStatus { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
