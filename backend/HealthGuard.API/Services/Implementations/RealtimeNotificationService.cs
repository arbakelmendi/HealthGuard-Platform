using HealthGuard.API.DTOs.Notifications;
using HealthGuard.API.Hubs;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace HealthGuard.API.Services.Implementations;

public class RealtimeNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly INotificationService _notificationService;

    public RealtimeNotificationService(
        IHubContext<NotificationsHub> hubContext,
        INotificationService notificationService)
    {
        _hubContext = hubContext;
        _notificationService = notificationService;
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

        await _notificationService.InvalidateUnreadCountAsync(notification.UserId);

        await _hubContext.Clients
            .Group(NotificationsHub.GetUserGroup(notification.UserId))
            .SendAsync("notificationReceived", response, cancellationToken);
    }
}
