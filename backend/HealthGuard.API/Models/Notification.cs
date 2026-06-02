using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public static class NotificationTypes
{
    public const string Alert = "Alert";
    public const string Reminder = "Reminder";
    public const string Info = "Info";

    public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        Alert,
        Reminder,
        Info
    };
}

public static class NotificationSources
{
    public const string Prediction = "Prediction";
    public const string System = "System";
    public const string Profile = "Profile";
    public const string HealthRecord = "HealthRecord";
    public const string Report = "Report";

    public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        Prediction,
        System,
        Profile,
        HealthRecord,
        Report
    };
}

public class Notification
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = NotificationTypes.Info;

    public bool IsRead { get; set; }

    [Required]
    [MaxLength(20)]
    public string Source { get; set; } = NotificationSources.System;

    public int? PredictionResultId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    public User User { get; set; } = null!;

    public PredictionResult? PredictionResult { get; set; }
}
