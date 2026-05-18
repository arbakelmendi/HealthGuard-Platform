modelBuilder.Entity<HealthRecord>(entity =>
{
    entity.HasKey(record => record.Id);

    entity.Property(record => record.Age).IsRequired();
    entity.Property(record => record.Weight).HasColumnType("decimal(6,2)").IsRequired();
    entity.Property(record => record.Height).HasColumnType("decimal(6,2)").IsRequired();

    entity.Property(record => record.BloodPressure)
        .IsRequired()
        .HasMaxLength(30);

    entity.Property(record => record.HeartRate).IsRequired();
    entity.Property(record => record.Glucose).HasColumnType("decimal(7,2)").IsRequired();

    entity.Property(record => record.CreatedAt).IsRequired();

    entity.HasOne(record => record.User)
        .WithMany(user => user.HealthRecords)
        .HasForeignKey(record => record.UserId)
        .OnDelete(DeleteBehavior.Cascade);
});