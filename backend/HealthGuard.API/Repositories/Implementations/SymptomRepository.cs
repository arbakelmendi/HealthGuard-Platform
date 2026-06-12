using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class SymptomRepository : Repository<SymptomLog>, ISymptomRepository
{
    public SymptomRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
