using HealthGuard.API.DTOs.Profile;
using HealthGuard.API.DTOs.Users;

namespace HealthGuard.API.Services.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserResponseDto>> GetAllAsync(string? search, CancellationToken cancellationToken);
    Task<UserResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<UserResponseDto> CreateAsync(CreateUserDto request, CancellationToken cancellationToken);
    Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto request, CancellationToken cancellationToken);
    Task DeleteAsync(int id, int currentAdminId, CancellationToken cancellationToken);
    Task<UserResponseDto> GetProfileAsync(int currentUserId, CancellationToken cancellationToken);
    Task<UserResponseDto> UpdateProfileAsync(int currentUserId, UpdateProfileDto request, CancellationToken cancellationToken);
}
