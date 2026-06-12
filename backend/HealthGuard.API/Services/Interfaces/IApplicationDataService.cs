namespace HealthGuard.API.Services.Interfaces;

public interface IApplicationDataService
{
    IQueryable<TEntity> Query<TEntity>(bool asNoTracking = false) where TEntity : class;

    void Add<TEntity>(TEntity entity) where TEntity : class;

    void AddRange<TEntity>(IEnumerable<TEntity> entities) where TEntity : class;

    void Remove<TEntity>(TEntity entity) where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
