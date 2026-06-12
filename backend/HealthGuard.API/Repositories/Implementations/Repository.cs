using HealthGuard.API.Data;
using HealthGuard.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Repositories.Implementations;

public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly ApplicationDbContext DbContext;
    private readonly DbSet<TEntity> _entities;

    public Repository(ApplicationDbContext dbContext)
    {
        DbContext = dbContext;
        _entities = dbContext.Set<TEntity>();
    }

    public IQueryable<TEntity> Query(bool asNoTracking = false) =>
        asNoTracking ? _entities.AsNoTracking() : _entities;

    public void Add(TEntity entity) => _entities.Add(entity);

    public void AddRange(IEnumerable<TEntity> entities) => _entities.AddRange(entities);

    public void Remove(TEntity entity) => _entities.Remove(entity);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        DbContext.SaveChangesAsync(cancellationToken);
}
