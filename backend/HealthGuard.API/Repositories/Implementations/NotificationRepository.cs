using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
