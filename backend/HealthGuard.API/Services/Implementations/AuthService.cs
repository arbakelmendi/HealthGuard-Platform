using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Auth;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(ApplicationDbContext dbContext, IJwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        await EnsureEmailIsAvailableAsync(email, null, cancellationToken);

        var now = DateTime.UtcNow;
        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRoles.User,
            Age = request.Age,
            Gender = TrimOrNull(request.Gender),
            Weight = request.Weight,
            Height = request.Height,
            Phone = TrimOrNull(request.Phone),
            City = TrimOrNull(request.City),
            BloodType = TrimOrNull(request.BloodType),
            ActivityLevel = TrimOrNull(request.ActivityLevel),
            ChronicConditions = TrimOrNull(request.ChronicConditions),
            Allergies = TrimOrNull(request.Allergies),
            SmokingStatus = TrimOrNull(request.SmokingStatus),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users.FirstOrDefaultAsync(item => item.Email == email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "This account is inactive.");
        }

        return CreateAuthResponse(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token.Token,
            ExpiresAt = token.ExpiresAt,
            User = UserMapper.ToResponse(user)
        };
    }

    private async Task EnsureEmailIsAvailableAsync(string email, int? ignoredUserId, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Users.AnyAsync(
            user => user.Email == email && (!ignoredUserId.HasValue || user.Id != ignoredUserId.Value),
            cancellationToken);

        if (exists)
        {
            throw new ApiException(StatusCodes.Status409Conflict, "A user with this email already exists.");
        }
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string? TrimOrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
