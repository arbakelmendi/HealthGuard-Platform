using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class NotificationService : INotificationService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private readonly INotificationRepository _notificationRepository;
    private readonly IRedisCacheService _redisCacheService;

    public NotificationService(
        INotificationRepository notificationRepository,
        IRedisCacheService redisCacheService)
    {
        _notificationRepository = notificationRepository;
        _redisCacheService = redisCacheService;
    }

    public async Task<int> GetUnreadCountAsync(int userId, CancellationToken cancellationToken)
    {
        var cacheKey = GetUnreadCountKey(userId);
        var cachedCount = await _redisCacheService.GetAsync<int?>(cacheKey);
        if (cachedCount.HasValue)
        {
            return cachedCount.Value;
        }

        var count = await _notificationRepository.Query(true)
            .CountAsync(
                notification => notification.UserId == userId && !notification.IsRead,
                cancellationToken);

        await _redisCacheService.SetAsync(cacheKey, count, CacheDuration);
        return count;
    }

    public async Task InvalidateUnreadCountAsync(int userId)
    {
        await _redisCacheService.RemoveAsync(GetUnreadCountKey(userId));
        await _redisCacheService.RemoveAsync($"healthguard:dashboard:user:{userId}");
    }

    private static string GetUnreadCountKey(int userId) =>
        $"healthguard:user:{userId}:notifications:unread-count";
}
