namespace HealthGuard.API.Services.Interfaces;

public interface INotificationService
{
    Task<int> GetUnreadCountAsync(int userId, CancellationToken cancellationToken);

    Task InvalidateUnreadCountAsync(int userId);
}
