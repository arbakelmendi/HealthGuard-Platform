using HealthGuard.API.Models;

namespace HealthGuard.API.Services.Interfaces;

public interface IJwtTokenService
{
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(
        User user,
        CancellationToken cancellationToken = default);
}
