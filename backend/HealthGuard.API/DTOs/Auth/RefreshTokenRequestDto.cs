using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
