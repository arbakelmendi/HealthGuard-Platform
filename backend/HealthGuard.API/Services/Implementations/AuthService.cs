using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Auth;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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

        return await CreateAuthResponseAsync(user, cancellationToken);
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

        return await CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var refreshToken = await _dbContext.RefreshTokens
            .Include(token => token.User)
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (refreshToken is null || !refreshToken.IsActive || !refreshToken.User.IsActive)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid refresh token.");
        }

        refreshToken.RevokedAt = DateTime.UtcNow;

        var response = await CreateAuthResponseAsync(refreshToken.User, cancellationToken);
        refreshToken.ReplacedByTokenHash = HashRefreshToken(response.RefreshToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task RevokeRefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var refreshToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (refreshToken is null)
        {
            return;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
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

    private async Task<AuthResponseDto> CreateAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
        var token = _jwtTokenService.GenerateToken(user);
        var refreshToken = CreateRefreshToken();
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(14);

        _dbContext.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = HashRefreshToken(refreshToken),
            ExpiresAt = refreshTokenExpiresAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = user.Id,
            UpdatedBy = user.Id
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto
        {
            Token = token.Token,
            RefreshToken = refreshToken,
            ExpiresAt = token.ExpiresAt,
            RefreshTokenExpiresAt = refreshTokenExpiresAt,
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

    private static string CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string HashRefreshToken(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes);
    }
}
