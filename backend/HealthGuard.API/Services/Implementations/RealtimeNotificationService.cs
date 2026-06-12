using HealthGuard.API.DTOs.Notifications;
using HealthGuard.API.Data;
using HealthGuard.API.Hubs;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class RealtimeNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly ApplicationDbContext _dbContext;
    private readonly IRedisCacheService _redisCacheService;

    public RealtimeNotificationService(
        IHubContext<NotificationsHub> hubContext,
        ApplicationDbContext dbContext,
        IRedisCacheService redisCacheService)
    {
        _hubContext = hubContext;
        _dbContext = dbContext;
        _redisCacheService = redisCacheService;
    }

    public async Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        var response = new NotificationResponseDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            Source = notification.Source,
            PredictionResultId = notification.PredictionResultId,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };

        var unreadCount = await _dbContext.Notifications
            .AsNoTracking()
            .CountAsync(
                item => item.UserId == notification.UserId && !item.IsRead,
                cancellationToken);

        await _redisCacheService.SetIntAsync(
            $"healthguard:user:{notification.UserId}:notifications:unreadCount",
            unreadCount);
        await _redisCacheService.PushToListAsync(
            $"healthguard:user:{notification.UserId}:notifications:latest",
            response,
            maxLength: 20,
            expiration: TimeSpan.FromDays(7));
        await _redisCacheService.RemoveAsync($"healthguard:dashboard:user:{notification.UserId}");

        await _hubContext.Clients
            .Group(NotificationsHub.GetUserGroup(notification.UserId))
            .SendAsync("notificationReceived", response, cancellationToken);
    }
}
