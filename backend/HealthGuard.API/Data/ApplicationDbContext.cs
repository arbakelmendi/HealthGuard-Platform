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
            entity.Property(user => user.City).HasMaxLength(100);
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
        });

        modelBuilder.Entity<HealthRecord>(entity =>
        {
            entity.HasKey(record => record.Id);
            entity.Property(record => record.BloodPressure).HasMaxLength(30);
            entity.Property(record => record.BloodSugar).HasColumnType("decimal(7,2)");
            entity.Property(record => record.Notes).HasMaxLength(1000);
        });
    }
}
