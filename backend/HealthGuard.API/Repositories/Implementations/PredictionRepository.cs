using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class PredictionRepository : Repository<PredictionResult>, IPredictionRepository
{
    public PredictionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
