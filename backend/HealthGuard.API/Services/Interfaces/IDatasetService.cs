using HealthGuard.API.DTOs.Datasets;

namespace HealthGuard.API.Services.Interfaces;

public interface IDatasetService
{
    Task<DatasetListResponseDto> GetDatasetsAsync(
        string? search,
        string? type,
        string? status,
        string sortBy,
        string sortDirection,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<DatasetResponseDto> GetDatasetAsync(int id, CancellationToken cancellationToken);

    Task<DatasetResponseDto> UploadAsync(int userId, UploadDatasetRequestDto request, IFormFile file, CancellationToken cancellationToken);

    Task<DatasetResponseDto> ReplaceAsync(int userId, int id, IFormFile file, CancellationToken cancellationToken);

    Task<DatasetResponseDto> ArchiveAsync(int userId, int id, CancellationToken cancellationToken);
}
