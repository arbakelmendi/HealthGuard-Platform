using System.Security.Claims;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Middleware;

public class AuditLogMiddleware
{
    private static readonly HashSet<string> AuditedMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    private readonly RequestDelegate _next;

    public AuditLogMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IRepository<AuditLog> auditLogRepository,
        ILogger<AuditLogMiddleware> logger)
    {
        await _next(context);

        if (!AuditedMethods.Contains(context.Request.Method)
            || !context.Request.Path.StartsWithSegments("/api"))
        {
            return;
        }

        var endpoint = context.GetEndpoint();
        var routeValues = context.Request.RouteValues;
        var entityName = routeValues.TryGetValue("controller", out var controller)
            ? controller?.ToString() ?? "Api"
            : "Api";
        var entityId = routeValues.TryGetValue("id", out var id) ? id?.ToString() : null;
        var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        var action = $"{context.Request.Method} {endpoint?.DisplayName ?? context.Request.Path}";
        var details = $"StatusCode={context.Response.StatusCode}; Path={context.Request.Path}";
        auditLogRepository.Add(new AuditLog
        {
            UserId = int.TryParse(userIdClaim, out var userId) ? userId : null,
            Action = Truncate(action, 80)!,
            EntityName = Truncate(entityName, 120)!,
            EntityId = entityId,
            Details = Truncate(details, 1000),
            IpAddress = Truncate(context.Connection.RemoteIpAddress?.ToString(), 64),
            CreatedAt = DateTime.UtcNow
        });

        try
        {
            await auditLogRepository.SaveChangesAsync(context.RequestAborted);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Unable to persist audit log for {Method} {Path}.",
                context.Request.Method,
                context.Request.Path);
        }
    }

    private static string? Truncate(string? value, int maxLength) =>
        value is null || value.Length <= maxLength ? value : value[..maxLength];
}
