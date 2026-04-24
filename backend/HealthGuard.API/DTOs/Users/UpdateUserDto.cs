using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [Range(1, 120)]
    public int? Age { get; set; }

    [StringLength(50)]
    public string? Gender { get; set; }

    [Range(1, 999)]
    public decimal? Weight { get; set; }

    [Range(1, 300)]
    public decimal? Height { get; set; }

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(10)]
    public string? BloodType { get; set; }

    [StringLength(50)]
    public string? ActivityLevel { get; set; }

    [StringLength(1000)]
    public string? ChronicConditions { get; set; }

    [StringLength(1000)]
    public string? Allergies { get; set; }

    [StringLength(50)]
    public string? SmokingStatus { get; set; }
}
