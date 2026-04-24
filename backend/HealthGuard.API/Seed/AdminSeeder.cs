using HealthGuard.API.Data;
using HealthGuard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Seed;

public class AdminSeeder
{
    private const string AdminEmail = "admin@healthguard.com";
    private const string AdminPassword = "admin123";
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(ApplicationDbContext dbContext, ILogger<AdminSeeder> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (!await _dbContext.Database.CanConnectAsync())
        {
            return;
        }

        if (await _dbContext.Users.AnyAsync(user => user.Role == UserRoles.Admin))
        {
            return;
        }

        var now = DateTime.UtcNow;
        var admin = new User
        {
            FirstName = "HealthGuard",
            LastName = "Admin",
            Email = AdminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
            Role = UserRoles.Admin,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Users.Add(admin);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Seeded default HealthGuard admin user {Email}.", AdminEmail);
    }
}
