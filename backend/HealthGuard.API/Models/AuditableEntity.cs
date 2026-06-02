namespace HealthGuard.API.Models;

public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int? CreatedBy { get; set; }

    public int? UpdatedBy { get; set; }

    public User? CreatedByUser { get; set; }

    public User? UpdatedByUser { get; set; }
}
