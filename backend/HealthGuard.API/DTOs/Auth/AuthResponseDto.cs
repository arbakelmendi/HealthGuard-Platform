using HealthGuard.API.DTOs.Users;

namespace HealthGuard.API.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public UserResponseDto User { get; set; } = new();
}
