using System.Security.Claims;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.DTOs.Notifications;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IApplicationDataService _dataService;
    private readonly IRealtimeNotificationService _realtimeNotificationService;
    private readonly IRedisCacheService _redisCacheService;

    public NotificationsController(
        IApplicationDataService dataService,
        IRealtimeNotificationService realtimeNotificationService,
        IRedisCacheService redisCacheService)
    {
        _dataService = dataService;
        _realtimeNotificationService = realtimeNotificationService;
        _redisCacheService = redisCacheService;
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IReadOnlyList<NotificationResponseDto>>> GetByUser(
        int userId,
        [FromQuery] string? search,
        [FromQuery] string? type,
        [FromQuery] string? source,
        [FromQuery] bool? isRead,
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        EnsureCanAccessUser(userId);

        var query = _dataService.Query<Notification>(true)
            .Where(notification => notification.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(notification => notification.Title.Contains(term) || notification.Message.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(notification => notification.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(source))
        {
            query = query.Where(notification => notification.Source == source);
        }

        if (isRead.HasValue)
        {
            query = query.Where(notification => notification.IsRead == isRead.Value);
        }

        query = sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)
            ? query.OrderBy(notification => notification.CreatedAt)
            : query.OrderByDescending(notification => notification.CreatedAt);

        var notifications = await query
            .ToListAsync(cancellationToken);

        return Ok(notifications.Select(ToResponse).ToList());
    }

    [HttpGet("user/{userId:int}/unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

        var cacheKey = GetUnreadCountKey(userId);
        var cachedCount = await _redisCacheService.GetIntAsync(cacheKey);
        if (cachedCount.HasValue)
        {
            return Ok(new { unreadCount = cachedCount.Value });
        }

        var count = await _dataService.Query<Notification>(true)
            .CountAsync(notification => notification.UserId == userId && !notification.IsRead, cancellationToken);

        await _redisCacheService.SetIntAsync(cacheKey, count);
        return Ok(new { unreadCount = count });
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult<NotificationResponseDto>> MarkRead(
        int id,
        CancellationToken cancellationToken)
    {
        var notification = await _dataService.Query<Notification>()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (notification is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Notification not found.");
        }

        EnsureCanAccessUser(notification.UserId);

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _dataService.SaveChangesAsync(cancellationToken);
            await SynchronizeUnreadCountAsync(notification.UserId, cancellationToken);
        }

        return Ok(ToResponse(notification));
    }

    [HttpPut("user/{userId:int}/read-all")]
    public async Task<ActionResult<ApiMessageResponse>> MarkAllRead(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

        var now = DateTime.UtcNow;
        var notifications = await _dataService.Query<Notification>()
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _dataService.SaveChangesAsync(cancellationToken);
        await _redisCacheService.SetIntAsync(GetUnreadCountKey(userId), 0);
        await _redisCacheService.RemoveAsync($"healthguard:dashboard:user:{userId}");

        return Ok(new ApiMessageResponse("All notifications marked as read."));
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<NotificationResponseDto>> Create(
        [FromBody] CreateNotificationDto request,
        CancellationToken cancellationToken)
    {
        ValidateNotificationType(request.Type);
        ValidateNotificationSource(request.Source);

        var userExists = await _dataService.Query<User>(true)
            .AnyAsync(user => user.Id == request.UserId, cancellationToken);

        if (!userExists)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        if (request.PredictionResultId.HasValue)
        {
            var predictionExists = await _dataService.Query<PredictionResult>(true)
                .AnyAsync(
                    prediction => prediction.Id == request.PredictionResultId.Value && prediction.UserId == request.UserId,
                    cancellationToken);

            if (!predictionExists)
            {
                throw new ApiException(StatusCodes.Status404NotFound, "Prediction result not found for this user.");
            }

            var duplicateExists = await _dataService.Query<Notification>(true)
                .AnyAsync(
                    notification => notification.UserId == request.UserId
                        && notification.PredictionResultId == request.PredictionResultId.Value
                        && notification.Title == request.Title.Trim(),
                    cancellationToken);

            if (duplicateExists)
            {
                throw new ApiException(StatusCodes.Status409Conflict, "Notification already exists for this prediction result.");
            }
        }

        var notification = new Notification
        {
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = NormalizeNotificationType(request.Type),
            Source = NormalizeNotificationSource(request.Source),
            PredictionResultId = request.PredictionResultId,
            CreatedAt = DateTime.UtcNow
        };

        _dataService.Add(notification);
        await _dataService.SaveChangesAsync(cancellationToken);
        await _realtimeNotificationService.SendNotificationAsync(notification, cancellationToken);

        return CreatedAtAction(nameof(GetByUser), new { userId = notification.UserId }, ToResponse(notification));
    }

    [HttpPost("generate-health-reminders")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<object>> GenerateHealthRecordReminders(CancellationToken cancellationToken)
    {
        var reminderCutoff = DateTime.UtcNow.AddDays(-7);
        var users = await _dataService.Query<User>(true)
            .Where(user => user.IsActive)
            .Select(user => new
            {
                user.Id,
                LatestHealthRecordAt = _dataService.Query<HealthRecord>(true)
                    .Where(record => record.UserId == user.Id)
                    .Max(record => (DateTime?)record.CreatedAt)
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var createdCount = 0;

        foreach (var user in users)
        {
            if (user.LatestHealthRecordAt.HasValue && user.LatestHealthRecordAt.Value >= reminderCutoff)
            {
                continue;
            }

            var hasUnreadReminder = await _dataService.Query<Notification>(true).AnyAsync(
                notification => notification.UserId == user.Id
                    && notification.Source == NotificationSources.HealthRecord
                    && notification.Type == NotificationTypes.Reminder
                    && notification.Title == "Reminder"
                    && !notification.IsRead,
                cancellationToken);

            if (hasUnreadReminder)
            {
                continue;
            }

            var hasRecentReminder = await _dataService.Query<Notification>(true).AnyAsync(
                notification => notification.UserId == user.Id
                    && notification.Source == NotificationSources.HealthRecord
                    && notification.Type == NotificationTypes.Reminder
                    && notification.Title == "Reminder"
                    && notification.CreatedAt >= reminderCutoff,
                cancellationToken);

            if (hasRecentReminder)
            {
                continue;
            }

            var notification = new Notification
            {
                UserId = user.Id,
                Title = "Reminder",
                Message = "You haven't updated your health records recently. Add new health information for more accurate predictions.",
                Type = NotificationTypes.Reminder,
                Source = NotificationSources.HealthRecord,
                CreatedAt = now
            };

            _dataService.Add(notification);
            createdCount++;
        }

        await _dataService.SaveChangesAsync(cancellationToken);

        var reminders = await _dataService.Query<Notification>(true)
            .Where(notification => notification.CreatedAt == now && notification.Title == "Reminder")
            .ToListAsync(cancellationToken);

        foreach (var notification in reminders)
        {
            await _realtimeNotificationService.SendNotificationAsync(notification, cancellationToken);
        }

        return Ok(new
        {
            message = $"{createdCount} health record reminder notification(s) created.",
            createdCount
        });
    }

    private void EnsureCanAccessUser(int userId)
    {
        if (User.IsInRole(UserRoles.Admin))
        {
            return;
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(currentUserId, out var parsed) || parsed != userId)
        {
            throw new ApiException(StatusCodes.Status403Forbidden, "You can only access your own notifications.");
        }
    }

    private static NotificationResponseDto ToResponse(Notification notification)
    {
        return new NotificationResponseDto
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
    }

    private async Task SynchronizeUnreadCountAsync(int userId, CancellationToken cancellationToken)
    {
        var unreadCount = await _dataService.Query<Notification>(true)
            .CountAsync(notification => notification.UserId == userId && !notification.IsRead, cancellationToken);

        await _redisCacheService.SetIntAsync(GetUnreadCountKey(userId), unreadCount);
        await _redisCacheService.RemoveAsync($"healthguard:dashboard:user:{userId}");
    }

    private static string GetUnreadCountKey(int userId) =>
        $"healthguard:user:{userId}:notifications:unreadCount";

    private static void ValidateNotificationType(string type)
    {
        if (!NotificationTypes.All.Contains(type))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Notification type must be Alert, Reminder, or Info.");
        }
    }

    private static void ValidateNotificationSource(string source)
    {
        if (!NotificationSources.All.Contains(source))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Notification source must be Prediction, System, Profile, HealthRecord, or Report.");
        }
    }

    private static string NormalizeNotificationType(string type)
    {
        if (type.Equals(NotificationTypes.Alert, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationTypes.Alert;
        }

        if (type.Equals(NotificationTypes.Reminder, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationTypes.Reminder;
        }

        return NotificationTypes.Info;
    }

    private static string NormalizeNotificationSource(string source)
    {
        if (source.Equals(NotificationSources.Prediction, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationSources.Prediction;
        }

        if (source.Equals(NotificationSources.Profile, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationSources.Profile;
        }

        if (source.Equals(NotificationSources.HealthRecord, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationSources.HealthRecord;
        }

        if (source.Equals(NotificationSources.Report, StringComparison.OrdinalIgnoreCase))
        {
            return NotificationSources.Report;
        }

        return NotificationSources.System;
    }
}
