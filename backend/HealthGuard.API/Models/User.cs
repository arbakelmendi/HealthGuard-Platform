using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = UserRoles.User;

    public int? Age { get; set; }

    [MaxLength(50)]
    public string? Gender { get; set; }

    public decimal? Weight { get; set; }

    public decimal? Height { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(10)]
    public string? BloodType { get; set; }

    [MaxLength(50)]
    public string? ActivityLevel { get; set; }

    [MaxLength(1000)]
    public string? ChronicConditions { get; set; }

    [MaxLength(1000)]
    public string? Allergies { get; set; }

    [MaxLength(50)]
    public string? SmokingStatus { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{FirstName} {LastName}".Trim();

    public ICollection<HealthRecord> HealthRecords { get; set; } = new List<HealthRecord>();
}
