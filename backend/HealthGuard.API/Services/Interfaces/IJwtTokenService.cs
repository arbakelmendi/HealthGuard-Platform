using HealthGuard.API.Models;

namespace HealthGuard.API.Services.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
