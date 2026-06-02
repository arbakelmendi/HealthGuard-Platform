using HealthGuard.API.DTOs.Users;

namespace HealthGuard.API.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime RefreshTokenExpiresAt { get; set; }

    public UserResponseDto User { get; set; } = new();
}
