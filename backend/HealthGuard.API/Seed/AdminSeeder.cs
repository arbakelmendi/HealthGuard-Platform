using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Seed;

public class AdminSeeder
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(
        IUserRepository userRepository,
        IConfiguration configuration,
        ILogger<AdminSeeder> logger)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (await _userRepository.Query(true).AnyAsync(user => user.Role == UserRoles.Admin))
        {
            return;
        }

        var adminEmail = _configuration["Admin:Email"];
        var adminPassword = _configuration["Admin:Password"];
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            _logger.LogWarning(
                "No admin account exists. Set Admin__Email and Admin__Password to enable initial admin seeding.");
            return;
        }

        var now = DateTime.UtcNow;
        var admin = new User
        {
            FirstName = "HealthGuard",
            LastName = "Admin",
            Email = adminEmail.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = UserRoles.Admin,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _userRepository.Add(admin);
        await _userRepository.SaveChangesAsync();
        _logger.LogInformation("Seeded default HealthGuard admin user {Email}.", admin.Email);
    }
}
