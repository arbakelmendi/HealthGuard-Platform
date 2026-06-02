using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class Role : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Description { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class UserRole : AuditableEntity
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public User User { get; set; } = null!;

    public Role Role { get; set; } = null!;
}

public class Permission : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission : AuditableEntity
{
    public int RoleId { get; set; }

    public int PermissionId { get; set; }

    public Role Role { get; set; } = null!;

    public Permission Permission { get; set; } = null!;
}

public class RefreshToken : AuditableEntity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(256)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    [MaxLength(256)]
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTime.UtcNow;

    public User User { get; set; } = null!;
}

public class AuditLog
{
    public long Id { get; set; }

    public int? UserId { get; set; }

    [Required]
    [MaxLength(80)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string EntityName { get; set; } = string.Empty;

    [MaxLength(80)]
    public string? EntityId { get; set; }

    [MaxLength(1000)]
    public string? Details { get; set; }

    [MaxLength(64)]
    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class AppSetting : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Category { get; set; }
}

public class StoredFile : AuditableEntity
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string ContentType { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string StoragePath { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    [MaxLength(80)]
    public string? Purpose { get; set; }

    public User? User { get; set; }
}
