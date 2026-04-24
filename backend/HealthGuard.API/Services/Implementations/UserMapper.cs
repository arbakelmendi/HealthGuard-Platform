using HealthGuard.API.DTOs.Users;
using HealthGuard.API.Models;

namespace HealthGuard.API.Services.Implementations;

internal static class UserMapper
{
    public static UserResponseDto ToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Age = user.Age,
            Gender = user.Gender,
            Weight = user.Weight,
            Height = user.Height,
            Phone = user.Phone,
            City = user.City,
            BloodType = user.BloodType,
            ActivityLevel = user.ActivityLevel,
            ChronicConditions = user.ChronicConditions,
            Allergies = user.Allergies,
            SmokingStatus = user.SmokingStatus,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
