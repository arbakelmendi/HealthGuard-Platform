using HealthGuard.API.DTOs.Reports;

namespace HealthGuard.API.Services.Interfaces;

public interface IReportService
{
    Task<ReportsSummaryDto> GetSummaryAsync(int userId, bool isAdmin, CancellationToken cancellationToken);
    Task<ReportsClassificationDto> GetClassificationAsync(CancellationToken cancellationToken);
    Task<ReportsAnalysisDto> GetAnalysisAsync(int userId, bool isAdmin, CancellationToken cancellationToken);
    Task<IReadOnlyList<ReportHistoryItemDto>> GetHistoryAsync(int userId, bool isAdmin, CancellationToken cancellationToken);
    Task<GeneratedReportResponseDto> GenerateAsync(int userId, bool isAdmin, GenerateReportRequestDto request, CancellationToken cancellationToken);
    Task<(byte[] Content, string ContentType, string FileName)> ExportAsync(int userId, bool isAdmin, int reportId, string format, CancellationToken cancellationToken);
    Task<(byte[] Content, string ContentType, string FileName)> ExportAllAsync(int userId, bool isAdmin, string format, int? predictionId, CancellationToken cancellationToken);
}
