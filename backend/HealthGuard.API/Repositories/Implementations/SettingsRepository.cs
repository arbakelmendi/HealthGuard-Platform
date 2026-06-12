using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class SettingsRepository : Repository<UserSettings>, ISettingsRepository
{
    public SettingsRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
