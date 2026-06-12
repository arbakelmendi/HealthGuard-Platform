using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Seed;

public class SecuritySeeder
{
    private static readonly string[] PermissionNames =
    {
        "users.read",
        "users.manage",
        "predictions.read",
        "predictions.manage",
        "reports.read",
        "reports.generate",
        "notifications.read",
        "notifications.manage",
        "settings.manage"
    };

    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;

    public SecuritySeeder(
        IRepository<Role> roleRepository,
        IRepository<Permission> permissionRepository,
        IRepository<RolePermission> rolePermissionRepository)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var roles = await _roleRepository.Query().ToListAsync(cancellationToken);

        var adminRole = roles.FirstOrDefault(role => role.Name == UserRoles.Admin);
        if (adminRole is null)
        {
            adminRole = new Role
            {
                Name = UserRoles.Admin,
                Description = "Full system administration access.",
                CreatedAt = now,
                UpdatedAt = now
            };
            _roleRepository.Add(adminRole);
        }

        var userRole = roles.FirstOrDefault(role => role.Name == UserRoles.User);
        if (userRole is null)
        {
            userRole = new Role
            {
                Name = UserRoles.User,
                Description = "Standard HealthGuard user access.",
                CreatedAt = now,
                UpdatedAt = now
            };
            _roleRepository.Add(userRole);
        }

        var permissions = await _permissionRepository.Query().ToListAsync(cancellationToken);
        foreach (var name in PermissionNames)
        {
            if (permissions.All(permission => permission.Name != name))
            {
                var permission = new Permission
                {
                    Name = name,
                    Description = $"Allows {name.Replace('.', ' ')} operations.",
                    CreatedAt = now,
                    UpdatedAt = now
                };
                permissions.Add(permission);
                _permissionRepository.Add(permission);
            }
        }

        await _roleRepository.SaveChangesAsync(cancellationToken);

        var existingMappings = await _rolePermissionRepository.Query(true)
            .Select(item => new { item.RoleId, item.PermissionId })
            .ToListAsync(cancellationToken);

        foreach (var permission in permissions)
        {
            if (existingMappings.All(item =>
                item.RoleId != adminRole.Id || item.PermissionId != permission.Id))
            {
                _rolePermissionRepository.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        var userPermissionNames = new[]
        {
            "predictions.read",
            "reports.read",
            "reports.generate",
            "notifications.read",
            "settings.manage"
        };
        foreach (var permission in permissions.Where(item => userPermissionNames.Contains(item.Name)))
        {
            if (existingMappings.All(item =>
                item.RoleId != userRole.Id || item.PermissionId != permission.Id))
            {
                _rolePermissionRepository.Add(new RolePermission
                {
                    RoleId = userRole.Id,
                    PermissionId = permission.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        await _rolePermissionRepository.SaveChangesAsync(cancellationToken);
    }
}
