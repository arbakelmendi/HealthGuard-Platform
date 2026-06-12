using HealthGuard.API.DTOs.Dashboard;

namespace HealthGuard.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetMineAsync(int userId, CancellationToken cancellationToken);

    Task<AdminDashboardDto> GetAdminAsync(CancellationToken cancellationToken);
}
