using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.DTOs.Notifications;

public class CreateNotificationDto
{
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
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Source { get; set; } = string.Empty;

    public int? PredictionResultId { get; set; }
}
