using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Profile;
using HealthGuard.API.DTOs.Users;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class UserService : IUserService
{
    private const string ProtectedAdminEmail = "admin@healthguard.com";
    private readonly ApplicationDbContext _dbContext;

    public UserService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllAsync(string? search, CancellationToken cancellationToken)
    {
        var query = _dbContext.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(user =>
                user.FirstName.ToLower().Contains(normalizedSearch) ||
                user.LastName.ToLower().Contains(normalizedSearch) ||
                user.Email.ToLower().Contains(normalizedSearch));
        }

        return await query
            .OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName)
            .Select(user => UserMapper.ToResponse(user))
            .ToListAsync(cancellationToken);
    }

    public async Task<UserResponseDto> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var user = await FindUserAsync(id, cancellationToken);
        return UserMapper.ToResponse(user);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto request, CancellationToken cancellationToken)
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
            Role = NormalizeRole(request.Role),
            IsActive = request.IsActive,
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
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return UserMapper.ToResponse(user);
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto request, CancellationToken cancellationToken)
    {
        var user = await FindUserAsync(id, cancellationToken);
        var email = NormalizeEmail(request.Email);
        await EnsureEmailIsAvailableAsync(email, id, cancellationToken);

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = email;
        user.Role = NormalizeRole(request.Role);
        user.IsActive = user.Email == ProtectedAdminEmail ? true : request.IsActive;
        user.Age = request.Age;
        user.Gender = TrimOrNull(request.Gender);
        user.Weight = request.Weight;
        user.Height = request.Height;
        user.Phone = TrimOrNull(request.Phone);
        user.City = TrimOrNull(request.City);
        user.BloodType = TrimOrNull(request.BloodType);
        user.ActivityLevel = TrimOrNull(request.ActivityLevel);
        user.ChronicConditions = TrimOrNull(request.ChronicConditions);
        user.Allergies = TrimOrNull(request.Allergies);
        user.SmokingStatus = TrimOrNull(request.SmokingStatus);
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return UserMapper.ToResponse(user);
    }

    public async Task DeleteAsync(int id, int currentAdminId, CancellationToken cancellationToken)
    {
        if (id == currentAdminId)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "You cannot delete your own account.");
        }

        var user = await FindUserAsync(id, cancellationToken);

        if (user.Email == ProtectedAdminEmail)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "The default admin account cannot be deleted.");
        }

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserResponseDto> GetProfileAsync(int currentUserId, CancellationToken cancellationToken)
    {
        var user = await FindUserAsync(currentUserId, cancellationToken);
        return UserMapper.ToResponse(user);
    }

    public async Task<UserResponseDto> UpdateProfileAsync(int currentUserId, UpdateProfileDto request, CancellationToken cancellationToken)
    {
        var user = await FindUserAsync(currentUserId, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = NormalizeEmail(request.Email);
            await EnsureEmailIsAvailableAsync(email, currentUserId, cancellationToken);
            user.Email = email;
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Age = request.Age;
        user.Gender = TrimOrNull(request.Gender);
        user.Weight = request.Weight;
        user.Height = request.Height;
        user.Phone = TrimOrNull(request.Phone);
        user.City = TrimOrNull(request.City);
        user.BloodType = TrimOrNull(request.BloodType);
        user.ActivityLevel = TrimOrNull(request.ActivityLevel);
        user.ChronicConditions = TrimOrNull(request.ChronicConditions);
        user.Allergies = TrimOrNull(request.Allergies);
        user.SmokingStatus = TrimOrNull(request.SmokingStatus);
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return UserMapper.ToResponse(user);
    }

    private async Task<User> FindUserAsync(int id, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (user is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        return user;
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

    private static string NormalizeRole(string role)
    {
        try
        {
            return UserRoles.Normalize(role);
        }
        catch (ArgumentException)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Role must be Admin or User.");
        }
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string? TrimOrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
