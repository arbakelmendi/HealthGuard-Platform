using System.Security.Claims;
using HealthGuard.API.Data;
using HealthGuard.API.DTOs.Common;
using HealthGuard.API.DTOs.Notifications;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public NotificationsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IReadOnlyList<NotificationResponseDto>>> GetByUser(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

        var notifications = await _dbContext.Notifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(notifications.Select(ToResponse).ToList());
    }

    [HttpGet("user/{userId:int}/unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount(
        int userId,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(userId);

        var count = await _dbContext.Notifications
            .AsNoTracking()
            .CountAsync(notification => notification.UserId == userId && !notification.IsRead, cancellationToken);

        return Ok(new { unreadCount = count });
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult<NotificationResponseDto>> MarkRead(
        int id,
        CancellationToken cancellationToken)
    {
        var notification = await _dbContext.Notifications
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
            await _dbContext.SaveChangesAsync(cancellationToken);
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
        var notifications = await _dbContext.Notifications
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

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

        var userExists = await _dbContext.Users
            .AnyAsync(user => user.Id == request.UserId, cancellationToken);

        if (!userExists)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        if (request.PredictionResultId.HasValue)
        {
            var predictionExists = await _dbContext.PredictionResults
                .AnyAsync(
                    prediction => prediction.Id == request.PredictionResultId.Value && prediction.UserId == request.UserId,
                    cancellationToken);

            if (!predictionExists)
            {
                throw new ApiException(StatusCodes.Status404NotFound, "Prediction result not found for this user.");
            }

            var duplicateExists = await _dbContext.Notifications
                .AnyAsync(
                    notification => notification.UserId == request.UserId
                        && notification.PredictionResultId == request.PredictionResultId.Value
                        && notification.Type == NormalizeNotificationType(request.Type),
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

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetByUser), new { userId = notification.UserId }, ToResponse(notification));
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
            throw new ApiException(StatusCodes.Status400BadRequest, "Notification source must be Prediction, System, or Profile.");
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

        return NotificationSources.System;
    }
}
