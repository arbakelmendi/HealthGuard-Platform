using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;

namespace HealthGuard.API.Services.Implementations;

public class ApplicationDataService : IApplicationDataService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRepository<AuditLog> _unitOfWorkRepository;

    public ApplicationDataService(
        IServiceProvider serviceProvider,
        IRepository<AuditLog> unitOfWorkRepository)
    {
        _serviceProvider = serviceProvider;
        _unitOfWorkRepository = unitOfWorkRepository;
    }

    public IQueryable<TEntity> Query<TEntity>(bool asNoTracking = false) where TEntity : class =>
        GetRepository<TEntity>().Query(asNoTracking);

    public void Add<TEntity>(TEntity entity) where TEntity : class =>
        GetRepository<TEntity>().Add(entity);

    public void AddRange<TEntity>(IEnumerable<TEntity> entities) where TEntity : class =>
        GetRepository<TEntity>().AddRange(entities);

    public void Remove<TEntity>(TEntity entity) where TEntity : class =>
        GetRepository<TEntity>().Remove(entity);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _unitOfWorkRepository.SaveChangesAsync(cancellationToken);

    private IRepository<TEntity> GetRepository<TEntity>() where TEntity : class =>
        _serviceProvider.GetRequiredService<IRepository<TEntity>>();
}
