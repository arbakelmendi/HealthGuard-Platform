using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class ReportRepository : Repository<GeneratedReport>, IReportRepository
{
    public ReportRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
