using HealthGuard.API.Models;

namespace HealthGuard.API.Services.Interfaces;

public interface IRealtimeNotificationService
{
    Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken);
}
