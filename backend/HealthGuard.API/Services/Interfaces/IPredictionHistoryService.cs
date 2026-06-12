using HealthGuard.API.DTOs.Predictions;

namespace HealthGuard.API.Services.Interfaces;

public interface IPredictionHistoryService
{
    Task<IReadOnlyList<PredictHealthRiskResponse>> GetByUserAsync(
        int userId,
        string? riskLevel,
        string? search,
        string sortBy,
        string sortDirection,
        CancellationToken cancellationToken);

    Task RefreshAsync(int userId, CancellationToken cancellationToken);
}
