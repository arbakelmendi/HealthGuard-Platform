using System.ComponentModel.DataAnnotations;

namespace HealthGuard.API.Models;

public class PatientProfile : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [MaxLength(100)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(30)]
    public string? EmergencyContactPhone { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public User User { get; set; } = null!;
}

public class MedicalCondition : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public ICollection<UserMedicalCondition> UserMedicalConditions { get; set; } = new List<UserMedicalCondition>();
}

public class UserMedicalCondition : AuditableEntity
{
    public int UserId { get; set; }
    public int MedicalConditionId { get; set; }
    public DateTime? DiagnosedAt { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public User User { get; set; } = null!;
    public MedicalCondition MedicalCondition { get; set; } = null!;
}

public class Medication : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Dosage { get; set; }

    [MaxLength(100)]
    public string? Frequency { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public User User { get; set; } = null!;
}

public class Allergy : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Allergen { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Severity { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Reaction { get; set; }

    public User User { get; set; } = null!;
}

public class Appointment : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime ScheduledAt { get; set; }

    [Required]
    [MaxLength(150)]
    public string ProviderName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Reason { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "Scheduled";

    public User User { get; set; } = null!;
}

public class Recommendation : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? PredictionResultId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Priority { get; set; } = "Normal";

    public User User { get; set; } = null!;
    public PredictionResult? PredictionResult { get; set; }
}

public class ReportDefinition : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string ReportType { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? DefaultFiltersJson { get; set; }

    public ICollection<GeneratedReport> GeneratedReports { get; set; } = new List<GeneratedReport>();
}

public class GeneratedReport : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? ReportDefinitionId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string ReportType { get; set; } = string.Empty;

    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }

    [Required]
    public string FiltersJson { get; set; } = "{}";

    [Required]
    public string ResultJson { get; set; } = "{}";

    public User User { get; set; } = null!;
    public ReportDefinition? ReportDefinition { get; set; }
    public ICollection<ReportExport> ReportExports { get; set; } = new List<ReportExport>();
}

public class ReportExport : AuditableEntity
{
    public int Id { get; set; }
    public int GeneratedReportId { get; set; }
    public int? FileId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Format { get; set; } = string.Empty;

    public GeneratedReport GeneratedReport { get; set; } = null!;
    public StoredFile? File { get; set; }
}

public class ImportBatch : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? FileId { get; set; }

    [Required]
    [MaxLength(40)]
    public string Format { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Status { get; set; } = "Pending";

    public int RecordsImported { get; set; }

    public User User { get; set; } = null!;
    public StoredFile? File { get; set; }
}

public class DataExportJob : AuditableEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required]
    [MaxLength(40)]
    public string Format { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string EntityType { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Status { get; set; } = "Completed";

    public int? FileId { get; set; }

    public User User { get; set; } = null!;
    public StoredFile? File { get; set; }
}

public class MlDataset : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Type { get; set; } = "Classification";

    public int Records { get; set; }

    [Required]
    [MaxLength(150)]
    public string Source { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Active";

    public int? UploadedByUserId { get; set; }

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    public int? FileId { get; set; }

    public User? UploadedByUser { get; set; }

    public StoredFile? File { get; set; }
}
