using HealthGuard.API.DTOs.Datasets;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Repositories.Interfaces;
using HealthGuard.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Services.Implementations;

public class DatasetService : IDatasetService
{
    private const long MaxUploadBytes = 10 * 1024 * 1024;
    private readonly IRepository<MlDataset> _datasetRepository;
    private readonly IWebHostEnvironment _environment;

    public DatasetService(IRepository<MlDataset> datasetRepository, IWebHostEnvironment environment)
    {
        _datasetRepository = datasetRepository;
        _environment = environment;
    }

    public async Task<DatasetListResponseDto> GetDatasetsAsync(
        string? search,
        string? type,
        string? status,
        string sortBy,
        string sortDirection,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        await EnsureHeartDatasetRegisteredAsync(cancellationToken);

        page = Math.Max(page, 1);
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _datasetRepository.Query(true)
            .Include(dataset => dataset.UploadedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(dataset =>
                dataset.Name.Contains(term)
                || dataset.Source.Contains(term)
                || dataset.FileName.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(type) && !type.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(dataset => dataset.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(dataset => dataset.Status == status);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await ApplySort(query, sortBy, sortDirection)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(dataset => ToResponse(dataset))
            .ToListAsync(cancellationToken);

        return new DatasetListResponseDto
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<DatasetResponseDto> GetDatasetAsync(int id, CancellationToken cancellationToken)
    {
        await EnsureHeartDatasetRegisteredAsync(cancellationToken);

        var dataset = await _datasetRepository.Query(true)
            .Include(item => item.UploadedByUser)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (dataset is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Dataset not found.");
        }

        return ToResponse(dataset);
    }

    public async Task<DatasetResponseDto> UploadAsync(int userId, UploadDatasetRequestDto request, IFormFile file, CancellationToken cancellationToken)
    {
        ValidateCsv(file);

        var uploadRoot = ResolveUploadsPath();
        Directory.CreateDirectory(uploadRoot);

        var safeFileName = BuildSafeFileName(file.FileName);
        var absolutePath = Path.Combine(uploadRoot, safeFileName);
        await using (var stream = File.Create(absolutePath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var rowCount = await CountCsvRowsAsync(absolutePath, cancellationToken);
        if (rowCount == 0)
        {
            File.Delete(absolutePath);
            throw new ApiException(StatusCodes.Status400BadRequest, "CSV file must contain at least one data row.");
        }

        var now = DateTime.UtcNow;
        var storedFile = new StoredFile
        {
            UserId = userId,
            FileName = safeFileName,
            ContentType = "text/csv",
            StoragePath = ToProjectRelativePath(absolutePath),
            SizeBytes = file.Length,
            Purpose = "MlDataset",
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        var dataset = new MlDataset
        {
            Name = request.Name.Trim(),
            Type = request.Type.Trim(),
            Records = rowCount,
            Source = string.IsNullOrWhiteSpace(request.Source) ? "Uploaded Dataset" : request.Source.Trim(),
            FileName = safeFileName,
            FilePath = ToProjectRelativePath(absolutePath),
            Status = request.Status,
            UploadedByUserId = userId,
            UploadDate = now,
            File = storedFile,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _datasetRepository.Add(dataset);
        await _datasetRepository.SaveChangesAsync(cancellationToken);

        return await GetDatasetAsync(dataset.Id, cancellationToken);
    }

    public async Task<DatasetResponseDto> ReplaceAsync(int userId, int id, IFormFile file, CancellationToken cancellationToken)
    {
        ValidateCsv(file);

        var dataset = await _datasetRepository.Query().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (dataset is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Dataset not found.");
        }

        var uploadRoot = ResolveUploadsPath();
        Directory.CreateDirectory(uploadRoot);

        var safeFileName = BuildSafeFileName(file.FileName);
        var absolutePath = Path.Combine(uploadRoot, safeFileName);
        await using (var stream = File.Create(absolutePath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var rowCount = await CountCsvRowsAsync(absolutePath, cancellationToken);
        if (rowCount == 0)
        {
            File.Delete(absolutePath);
            throw new ApiException(StatusCodes.Status400BadRequest, "CSV file must contain at least one data row.");
        }

        var now = DateTime.UtcNow;
        var storedFile = new StoredFile
        {
            UserId = userId,
            FileName = safeFileName,
            ContentType = "text/csv",
            StoragePath = ToProjectRelativePath(absolutePath),
            SizeBytes = file.Length,
            Purpose = "MlDataset",
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        dataset.FileName = safeFileName;
        dataset.FilePath = ToProjectRelativePath(absolutePath);
        dataset.Records = rowCount;
        dataset.File = storedFile;
        dataset.Status = "Active";
        dataset.UploadDate = now;
        dataset.UpdatedAt = now;
        dataset.UpdatedBy = userId;

        await _datasetRepository.SaveChangesAsync(cancellationToken);
        return await GetDatasetAsync(dataset.Id, cancellationToken);
    }

    public async Task<DatasetResponseDto> ArchiveAsync(int userId, int id, CancellationToken cancellationToken)
    {
        var dataset = await _datasetRepository.Query().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (dataset is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Dataset not found.");
        }

        dataset.Status = "Archived";
        dataset.UpdatedAt = DateTime.UtcNow;
        dataset.UpdatedBy = userId;
        await _datasetRepository.SaveChangesAsync(cancellationToken);

        return await GetDatasetAsync(id, cancellationToken);
    }

    private async Task EnsureHeartDatasetRegisteredAsync(CancellationToken cancellationToken)
    {
        var heartPath = ResolveHeartDatasetPath();
        if (!File.Exists(heartPath))
        {
            return;
        }

        var relativePath = ToProjectRelativePath(heartPath);
        var exists = await _datasetRepository.Query(true).AnyAsync(
            dataset => dataset.FilePath == relativePath || dataset.FileName == "heart.csv",
            cancellationToken);

        if (exists)
        {
            return;
        }

        var now = DateTime.UtcNow;
        _datasetRepository.Add(new MlDataset
        {
            Name = "Heart Disease Dataset",
            Type = "Classification",
            Records = await CountCsvRowsAsync(heartPath, cancellationToken),
            Source = "Local ML Dataset",
            FileName = "heart.csv",
            FilePath = relativePath,
            Status = "Active",
            UploadDate = now,
            CreatedAt = now,
            UpdatedAt = now
        });
        await _datasetRepository.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<MlDataset> ApplySort(IQueryable<MlDataset> query, string sortBy, string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
        return sortBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(item => item.Name) : query.OrderBy(item => item.Name),
            "type" => descending ? query.OrderByDescending(item => item.Type) : query.OrderBy(item => item.Type),
            "records" => descending ? query.OrderByDescending(item => item.Records) : query.OrderBy(item => item.Records),
            "source" => descending ? query.OrderByDescending(item => item.Source) : query.OrderBy(item => item.Source),
            "status" => descending ? query.OrderByDescending(item => item.Status) : query.OrderBy(item => item.Status),
            _ => descending ? query.OrderByDescending(item => item.UploadDate) : query.OrderBy(item => item.UploadDate)
        };
    }

    private static DatasetResponseDto ToResponse(MlDataset dataset) => new()
    {
        Id = dataset.Id,
        Name = dataset.Name,
        Type = dataset.Type,
        Records = dataset.Records,
        Source = dataset.Source,
        FileName = dataset.FileName,
        FilePath = dataset.FilePath,
        Status = dataset.Status,
        UploadedByUserId = dataset.UploadedByUserId,
        UploadedByName = dataset.UploadedByUser?.FullName ?? string.Empty,
        UploadedByEmail = dataset.UploadedByUser?.Email ?? string.Empty,
        UploadDate = dataset.UploadDate,
        CreatedAt = dataset.CreatedAt,
        UpdatedAt = dataset.UpdatedAt
    };

    private static void ValidateCsv(IFormFile file)
    {
        if (file is null)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "CSV file is required.");
        }

        if (file.Length == 0)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "CSV file cannot be empty.");
        }

        if (file.Length > MaxUploadBytes)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "CSV file must be 10 MB or smaller.");
        }

        if (!Path.GetExtension(file.FileName).Equals(".csv", StringComparison.OrdinalIgnoreCase))
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Only .csv dataset files are allowed.");
        }
    }

    private static string BuildSafeFileName(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var safeBase = new string(baseName.Select(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' ? ch : '-').ToArray()).Trim('-');
        if (string.IsNullOrWhiteSpace(safeBase))
        {
            safeBase = "dataset";
        }

        return $"{safeBase}-{DateTime.UtcNow:yyyyMMddHHmmssfff}{extension.ToLowerInvariant()}";
    }

    private static async Task<int> CountCsvRowsAsync(string path, CancellationToken cancellationToken)
    {
        var lines = 0;
        using var reader = new StreamReader(path);
        while (await reader.ReadLineAsync(cancellationToken) is not null)
        {
            lines++;
        }

        return Math.Max(lines - 1, 0);
    }

    private string ResolveHeartDatasetPath() => Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "..", "ml", "dataset", "heart.csv"));

    private string ResolveUploadsPath() => Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "..", "ml", "dataset", "uploads"));

    private string ToProjectRelativePath(string absolutePath)
    {
        var root = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", ".."));
        return Path.GetRelativePath(root, absolutePath).Replace('\\', '/');
    }
}
