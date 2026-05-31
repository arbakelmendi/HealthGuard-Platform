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
                    notification.Type
                })
                .IsUnique()
                .HasFilter("[PredictionResultId] IS NOT NULL");
        });
    }
}
