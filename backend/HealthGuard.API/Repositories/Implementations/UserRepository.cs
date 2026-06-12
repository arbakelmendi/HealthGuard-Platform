using HealthGuard.API.Data;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;

namespace HealthGuard.API.Repositories.Implementations;

public sealed class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
