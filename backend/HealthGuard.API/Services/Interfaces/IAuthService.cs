using HealthGuard.API.DTOs.Auth;

namespace HealthGuard.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken);
    Task ChangePasswordAsync(int userId, ChangePasswordDto request, CancellationToken cancellationToken);
}
