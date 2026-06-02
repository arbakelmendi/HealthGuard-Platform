using HealthGuard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<HealthRecord> HealthRecords => Set<HealthRecord>();

    public DbSet<PredictionResult> PredictionResults => Set<PredictionResult>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    public DbSet<SymptomLog> SymptomLogs => Set<SymptomLog>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Permission> Permissions => Set<Permission>();

    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<AppSetting> Settings => Set<AppSetting>();

    public DbSet<StoredFile> Files => Set<StoredFile>();

    public DbSet<PatientProfile> PatientProfiles => Set<PatientProfile>();

    public DbSet<MedicalCondition> MedicalConditions => Set<MedicalCondition>();

    public DbSet<UserMedicalCondition> UserMedicalConditions => Set<UserMedicalCondition>();

    public DbSet<Medication> Medications => Set<Medication>();

    public DbSet<Allergy> Allergies => Set<Allergy>();

    public DbSet<Appointment> Appointments => Set<Appointment>();

    public DbSet<Recommendation> Recommendations => Set<Recommendation>();

    public DbSet<ReportDefinition> ReportDefinitions => Set<ReportDefinition>();

    public DbSet<GeneratedReport> GeneratedReports => Set<GeneratedReport>();

    public DbSet<ReportExport> ReportExports => Set<ReportExport>();

    public DbSet<ImportBatch> ImportBatches => Set<ImportBatch>();

    public DbSet<DataExportJob> DataExportJobs => Set<DataExportJob>();

    public DbSet<MlDataset> MlDatasets => Set<MlDataset>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.Property(user => user.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.LastName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.Email)
                .IsRequired()
                .HasMaxLength(256);

            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired();

            entity.Property(user => user.Role)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(user => user.Gender).HasMaxLength(50);
            entity.Property(user => user.Phone).HasMaxLength(30);
            entity.Property(user => user.BloodType).HasMaxLength(10);
            entity.Property(user => user.ActivityLevel).HasMaxLength(50);
            entity.Property(user => user.ChronicConditions).HasMaxLength(1000);
            entity.Property(user => user.Allergies).HasMaxLength(1000);
            entity.Property(user => user.SmokingStatus).HasMaxLength(50);

            entity.Property(user => user.Weight).HasColumnType("decimal(6,2)");
            entity.Property(user => user.Height).HasColumnType("decimal(6,2)");

            entity.HasMany(user => user.HealthRecords)
                .WithOne(record => record.User)
                .HasForeignKey(record => record.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(user => user.Notifications)
                .WithOne(notification => notification.User)
                .HasForeignKey(notification => notification.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(user => user.Settings)
                .WithOne(settings => settings.User)
                .HasForeignKey<UserSettings>(settings => settings.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(user => user.SymptomLogs)
                .WithOne(symptom => symptom.User)
                .HasForeignKey(symptom => symptom.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.HasKey(settings => settings.Id);

            entity.HasIndex(settings => settings.UserId)
                .IsUnique();

            entity.Property(settings => settings.CreatedAt)
                .IsRequired();

            entity.Property(settings => settings.UpdatedAt)
                .IsRequired();
        });

        modelBuilder.Entity<SymptomLog>(entity =>
        {
            entity.HasKey(symptom => symptom.Id);

            entity.Property(symptom => symptom.Symptom)
                .IsRequired()
                .HasMaxLength(120);

            entity.Property(symptom => symptom.Severity)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(symptom => symptom.Duration)
                .IsRequired()
                .HasMaxLength(80);

            entity.Property(symptom => symptom.Notes)
                .HasMaxLength(1000);

            entity.Property(symptom => symptom.CreatedAt)
                .IsRequired();

            entity.Property(symptom => symptom.UpdatedAt)
                .IsRequired();

            entity.HasIndex(symptom => new { symptom.UserId, symptom.CreatedAt });
        });

        modelBuilder.Entity<HealthRecord>(entity =>
        {
            entity.HasKey(record => record.Id);

            entity.Property(record => record.Age)
                .IsRequired();

            entity.Property(record => record.Gender)
                .HasMaxLength(50);

            entity.Property(record => record.Weight)
                .HasColumnType("decimal(6,2)")
                .IsRequired();

            entity.Property(record => record.Height)
                .HasColumnType("decimal(6,2)")
                .IsRequired();

            entity.Property(record => record.WeightKg)
                .HasColumnType("decimal(6,2)")
                .IsRequired();

            entity.Property(record => record.HeightCm)
                .HasColumnType("decimal(6,2)")
                .IsRequired();

            entity.Property(record => record.Bmi)
                .HasColumnType("decimal(5,2)")
                .IsRequired();

            entity.Property(record => record.BloodPressure)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(record => record.SystolicBp)
                .IsRequired();

            entity.Property(record => record.DiastolicBp)
                .IsRequired();

            entity.Property(record => record.HeartRate)
                .IsRequired();

            entity.Property(record => record.Glucose)
                .HasColumnType("decimal(7,2)")
                .IsRequired();

            entity.Property(record => record.BloodSugar)
                .HasColumnType("decimal(7,2)")
                .IsRequired();

            entity.Property(record => record.Cholesterol)
                .HasColumnType("decimal(7,2)")
                .IsRequired();

            entity.Property(record => record.ActivityLevel)
                .HasMaxLength(50);

            entity.Property(record => record.SleepHours)
                .HasColumnType("decimal(4,1)")
                .IsRequired();

            entity.Property(record => record.SmokingStatus)
                .HasMaxLength(50);

            entity.Property(record => record.Symptoms)
                .HasMaxLength(1000);

            entity.Property(record => record.CreatedAt)
                .IsRequired();

            entity.HasOne(record => record.User)
                .WithMany(user => user.HealthRecords)
                .HasForeignKey(record => record.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PredictionResult>(entity =>
        {
            entity.HasKey(prediction => prediction.Id);

            entity.Property(prediction => prediction.RiskLevel)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(prediction => prediction.RiskScore)
                .IsRequired();

            entity.Property(prediction => prediction.Explanation)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(prediction => prediction.ContributingFactors)
                .IsRequired();

            entity.Property(prediction => prediction.ModelName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(prediction => prediction.CreatedAt)
                .IsRequired();

            entity.HasOne(prediction => prediction.User)
                .WithMany(user => user.PredictionResults)
                .HasForeignKey(prediction => prediction.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(prediction => prediction.HealthRecord)
                .WithMany(record => record.PredictionResults)
                .HasForeignKey(prediction => prediction.HealthRecordId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(notification => notification.Id);

            entity.Property(notification => notification.Title)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(notification => notification.Message)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(notification => notification.Type)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(notification => notification.Source)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(notification => notification.CreatedAt)
                .IsRequired();

            entity.HasOne(notification => notification.User)
                .WithMany(user => user.Notifications)
                .HasForeignKey(notification => notification.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(notification => notification.PredictionResult)
                .WithMany(prediction => prediction.Notifications)
                .HasForeignKey(notification => notification.PredictionResultId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(notification => new
                {
                    notification.UserId,
                    notification.PredictionResultId,
                    notification.Title
                })
                .IsUnique()
                .HasFilter("[PredictionResultId] IS NOT NULL");
        });

        ConfigureSecurity(modelBuilder);
        ConfigureAdditionalDomain(modelBuilder);
        ConfigureAuditColumns(modelBuilder);
    }

    private static void ConfigureAuditColumns(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
            .Where(entityType => typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType)))
        {
            var entity = modelBuilder.Entity(entityType.ClrType);
            entity.Property(nameof(AuditableEntity.CreatedAt)).IsRequired();
            entity.Property(nameof(AuditableEntity.UpdatedAt)).IsRequired();
            entity.HasOne(typeof(User), nameof(AuditableEntity.CreatedByUser))
                .WithMany()
                .HasForeignKey(nameof(AuditableEntity.CreatedBy))
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(typeof(User), nameof(AuditableEntity.UpdatedByUser))
                .WithMany()
                .HasForeignKey(nameof(AuditableEntity.UpdatedBy))
                .OnDelete(DeleteBehavior.NoAction);
        }
    }

    private static void ConfigureSecurity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(role => role.Name).IsUnique();
            entity.Property(role => role.Name).IsRequired().HasMaxLength(50);
            entity.Property(role => role.Description).HasMaxLength(250);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(userRole => new { userRole.UserId, userRole.RoleId });
            entity.HasOne(userRole => userRole.User)
                .WithMany(user => user.UserRoles)
                .HasForeignKey(userRole => userRole.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(userRole => userRole.Role)
                .WithMany(role => role.UserRoles)
                .HasForeignKey(userRole => userRole.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasIndex(permission => permission.Name).IsUnique();
            entity.Property(permission => permission.Name).IsRequired().HasMaxLength(100);
            entity.Property(permission => permission.Description).HasMaxLength(250);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(rolePermission => new { rolePermission.RoleId, rolePermission.PermissionId });
            entity.HasOne(rolePermission => rolePermission.Role)
                .WithMany(role => role.RolePermissions)
                .HasForeignKey(rolePermission => rolePermission.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rolePermission => rolePermission.Permission)
                .WithMany(permission => permission.RolePermissions)
                .HasForeignKey(rolePermission => rolePermission.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(token => token.TokenHash).IsUnique();
            entity.Property(token => token.TokenHash).IsRequired().HasMaxLength(256);
            entity.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.Property(log => log.Action).IsRequired().HasMaxLength(80);
            entity.Property(log => log.EntityName).IsRequired().HasMaxLength(120);
            entity.HasOne(log => log.User)
                .WithMany()
                .HasForeignKey(log => log.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(log => new { log.EntityName, log.EntityId, log.CreatedAt });
        });

        modelBuilder.Entity<AppSetting>(entity =>
        {
            entity.ToTable("Settings");
            entity.HasIndex(setting => setting.Key).IsUnique();
            entity.Property(setting => setting.Key).IsRequired().HasMaxLength(100);
            entity.Property(setting => setting.Value).IsRequired().HasMaxLength(2000);
        });

        modelBuilder.Entity<StoredFile>(entity =>
        {
            entity.ToTable("Files");
            entity.Property(file => file.FileName).IsRequired().HasMaxLength(255);
            entity.Property(file => file.ContentType).IsRequired().HasMaxLength(120);
            entity.Property(file => file.StoragePath).IsRequired().HasMaxLength(500);
            entity.HasOne(file => file.User)
                .WithMany()
                .HasForeignKey(file => file.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureAdditionalDomain(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PatientProfile>(entity =>
        {
            entity.HasIndex(profile => profile.UserId).IsUnique();
            entity.HasOne(profile => profile.User)
                .WithMany(user => user.PatientProfiles)
                .HasForeignKey(profile => profile.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MedicalCondition>(entity =>
        {
            entity.HasIndex(condition => condition.Name).IsUnique();
            entity.Property(condition => condition.Name).IsRequired().HasMaxLength(150);
        });

        modelBuilder.Entity<UserMedicalCondition>(entity =>
        {
            entity.HasKey(condition => new { condition.UserId, condition.MedicalConditionId });
            entity.HasOne(condition => condition.User)
                .WithMany(user => user.UserMedicalConditions)
                .HasForeignKey(condition => condition.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(condition => condition.MedicalCondition)
                .WithMany(condition => condition.UserMedicalConditions)
                .HasForeignKey(condition => condition.MedicalConditionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Medication>().HasOne(item => item.User).WithMany(user => user.Medications).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Allergy>().HasOne(item => item.User).WithMany(user => user.AllergiesList).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Appointment>().HasOne(item => item.User).WithMany(user => user.Appointments).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Recommendation>().HasOne(item => item.User).WithMany(user => user.Recommendations).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Recommendation>().HasOne(item => item.PredictionResult).WithMany().HasForeignKey(item => item.PredictionResultId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<GeneratedReport>().HasOne(item => item.User).WithMany(user => user.GeneratedReports).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<GeneratedReport>().HasOne(item => item.ReportDefinition).WithMany(item => item.GeneratedReports).HasForeignKey(item => item.ReportDefinitionId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ReportExport>().HasOne(item => item.GeneratedReport).WithMany(item => item.ReportExports).HasForeignKey(item => item.GeneratedReportId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ReportExport>().HasOne(item => item.File).WithMany().HasForeignKey(item => item.FileId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ImportBatch>().HasOne(item => item.User).WithMany(user => user.ImportBatches).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ImportBatch>().HasOne(item => item.File).WithMany().HasForeignKey(item => item.FileId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<DataExportJob>().HasOne(item => item.User).WithMany(user => user.DataExportJobs).HasForeignKey(item => item.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DataExportJob>().HasOne(item => item.File).WithMany().HasForeignKey(item => item.FileId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<MlDataset>(entity =>
        {
            entity.HasIndex(item => item.Name);
            entity.Property(item => item.Name).IsRequired().HasMaxLength(150);
            entity.Property(item => item.Type).IsRequired().HasMaxLength(30);
            entity.Property(item => item.Source).IsRequired().HasMaxLength(150);
            entity.Property(item => item.FileName).IsRequired().HasMaxLength(255);
            entity.Property(item => item.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(item => item.Status).IsRequired().HasMaxLength(30);
            entity.HasOne(item => item.UploadedByUser)
                .WithMany()
                .HasForeignKey(item => item.UploadedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(item => item.File)
                .WithMany()
                .HasForeignKey(item => item.FileId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
