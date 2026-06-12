using System.Security.Claims;
using System.Text.Json;
using HealthGuard.API.DTOs.HealthRecords;
using HealthGuard.API.DTOs.Predictions;
using HealthGuard.API.Middleware;
using HealthGuard.API.Models;
using HealthGuard.API.Services.Implementations;
using HealthGuard.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthGuard.API.Controllers;

[ApiController]
[Route("api/predictions")]
[Authorize]
public class PredictionsController : ControllerBase
{
    private readonly IApplicationDataService _dataService;
    private readonly HealthRiskPredictionService _predictionService;
    private readonly MachineLearningPredictionService _machineLearningPredictionService;
    private readonly IPredictionHistoryService _predictionHistoryService;
    private readonly IRealtimeNotificationService _realtimeNotificationService;

    public PredictionsController(
        IApplicationDataService dataService,
        HealthRiskPredictionService predictionService,
        MachineLearningPredictionService machineLearningPredictionService,
        IPredictionHistoryService predictionHistoryService,
        IRealtimeNotificationService realtimeNotificationService)
    {
        _dataService = dataService;
        _predictionService = predictionService;
        _machineLearningPredictionService = machineLearningPredictionService;
        _predictionHistoryService = predictionHistoryService;
        _realtimeNotificationService = realtimeNotificationService;
    }

    [HttpPost("predict")]
    public async Task<ActionResult<PredictHealthRiskResponse>> Predict(
        [FromBody] PredictHealthRiskRequest request,
        CancellationToken cancellationToken)
    {
        EnsureCanAccessUser(request.UserId);

        var userExists = await _dataService.Query<User>(true)
            .AnyAsync(user => user.Id == request.UserId, cancellationToken);

        if (!userExists)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "User not found.");
        }

        HealthRecord? healthRecord = null;
        var predictionRequest = request;
        if (request.HealthRecordId.HasValue)
        {
            healthRecord = await _dataService.Query<HealthRecord>()
                .FirstOrDefaultAsync(
                    record => record.Id == request.HealthRecordId.Value && record.UserId == request.UserId,
                    cancellationToken);

            if (healthRecord is null)
            {
                throw new ApiException(StatusCodes.Status404NotFound, "Health record not found for this user.");
            }

            predictionRequest = ToPredictionRequest(healthRecord);
        }

        var validationErrors = ValidatePredictionInput(predictionRequest);
        if (validationErrors.Count > 0)
        {
            return BadRequest(new
            {
                message = "Validation failed.",
                errors = validationErrors
            });
        }

        var prediction = await _machineLearningPredictionService.TryPredictAsync(predictionRequest, cancellationToken);
        if (prediction is null)
        {
            var fallbackPrediction = _predictionService.Predict(predictionRequest);
            prediction = fallbackPrediction with
            {
                Explanation = $"{fallbackPrediction.Explanation} Fallback rule-based prediction was used because the Python ML API is not running or did not respond.",
                ContributingFactors = new[] { "Fallback rule-based prediction used" }
                    .Concat(fallbackPrediction.ContributingFactors)
                    .ToList()
            };
        }

        if (healthRecord is null)
        {
            healthRecord = CreateHealthRecord(predictionRequest, prediction.Bmi);
            _dataService.Add(healthRecord);
        }

        var result = new PredictionResult
        {
            UserId = request.UserId,
            HealthRecord = healthRecord,
            RiskLevel = prediction.RiskLevel,
            RiskScore = prediction.RiskScore,
            Explanation = prediction.Explanation,
            ContributingFactors = JsonSerializer.Serialize(prediction.ContributingFactors),
            ModelName = prediction.ModelName,
            CreatedAt = DateTime.UtcNow
        };

        _dataService.Add(result);
        await _dataService.SaveChangesAsync(cancellationToken);

        await _predictionHistoryService.RefreshAsync(result.UserId, cancellationToken);
        await CreatePredictionNotificationsAsync(result, cancellationToken);

        return Ok(ToResponse(result));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IReadOnlyList<PredictHealthRiskResponse>>> GetByUser(
        int userId,
        [FromQuery] string? riskLevel,
        [FromQuery] string? search,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        EnsureCanAccessUser(userId);

        var predictions = await _predictionHistoryService.GetByUserAsync(
            userId,
            riskLevel,
            search,
            sortBy,
            sortDirection,
            cancellationToken);

        return Ok(predictions);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PredictHealthRiskResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var prediction = await _dataService.Query<PredictionResult>(true)
            .Include(prediction => prediction.HealthRecord)
            .FirstOrDefaultAsync(prediction => prediction.Id == id, cancellationToken);

        if (prediction is null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Prediction not found.");
        }

        EnsureCanAccessUser(prediction.UserId);

        return Ok(ToResponse(prediction));
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<IReadOnlyList<AdminPredictionRecordResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? riskLevel,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        IQueryable<PredictionResult> query = _dataService.Query<PredictionResult>(true)
            .Include(prediction => prediction.User)
            .Include(prediction => prediction.HealthRecord);

        if (!string.IsNullOrWhiteSpace(riskLevel))
        {
            query = query.Where(prediction => prediction.RiskLevel == riskLevel);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(prediction =>
                prediction.Explanation.Contains(term)
                || prediction.ModelName.Contains(term)
                || prediction.User.Email.Contains(term)
                || prediction.User.FirstName.Contains(term)
                || prediction.User.LastName.Contains(term));
        }

        var predictions = await ApplyPredictionSort(query, sortBy, sortDirection)
            .ToListAsync(cancellationToken);

        var response = predictions
            .Select(prediction => new AdminPredictionRecordResponse
            {
                PredictionId = prediction.Id,
                UserId = prediction.UserId,
                HealthRecordId = prediction.HealthRecordId,
                RiskLevel = prediction.RiskLevel,
                RiskScore = prediction.RiskScore,
                Explanation = prediction.Explanation,
                ContributingFactors = ParseFactors(prediction.ContributingFactors),
                ModelName = prediction.ModelName,
                CreatedAt = prediction.CreatedAt,
                HealthRecord = prediction.HealthRecord is null ? null : ToHealthRecordResponse(prediction.HealthRecord),
                UserName = prediction.User.FullName,
                UserEmail = prediction.User.Email
            })
            .ToList();

        return Ok(response);
    }

    private void EnsureCanAccessUser(int userId)
    {
        if (User.IsInRole(UserRoles.Admin))
        {
            return;
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(currentUserId, out var parsed) || parsed != userId)
        {
            throw new ApiException(StatusCodes.Status403Forbidden, "You can only access your own predictions.");
        }
    }

    private static HealthRecord CreateHealthRecord(PredictHealthRiskRequest request, decimal bmi)
    {
        var record = new HealthRecord
        {
            UserId = request.UserId,
            Age = request.Age!.Value,
            HeartRate = 0,
            CreatedAt = DateTime.UtcNow
        };

        UpdatePredictionFields(record, request, bmi);
        return record;
    }

    private static void UpdatePredictionFields(HealthRecord record, PredictHealthRiskRequest request, decimal bmi)
    {
        record.Gender = request.Gender?.Trim() ?? string.Empty;
        record.HeightCm = request.HeightCm!.Value;
        record.WeightKg = request.WeightKg!.Value;
        record.Height = request.HeightCm.Value;
        record.Weight = request.WeightKg.Value;
        record.Bmi = bmi;
        record.SystolicBp = request.SystolicBp!.Value;
        record.DiastolicBp = request.DiastolicBp!.Value;
        record.BloodPressure = $"{request.SystolicBp}/{request.DiastolicBp}";
        record.BloodSugar = request.BloodSugar!.Value;
        record.Glucose = request.BloodSugar.Value;
        record.Cholesterol = request.Cholesterol!.Value;
        record.ActivityLevel = request.ActivityLevel?.Trim() ?? string.Empty;
        record.SleepHours = request.SleepHours!.Value;
        record.StressLevel = request.StressLevel!.Value;
        record.SmokingStatus = request.SmokingStatus?.Trim() ?? string.Empty;
        record.Symptoms = request.Symptoms?.Trim() ?? string.Empty;
    }

    private static PredictHealthRiskRequest ToPredictionRequest(HealthRecord record)
    {
        return new PredictHealthRiskRequest
        {
            UserId = record.UserId,
            HealthRecordId = record.Id,
            Age = record.Age,
            Gender = record.Gender,
            HeightCm = record.HeightCm == 0 ? record.Height : record.HeightCm,
            WeightKg = record.WeightKg == 0 ? record.Weight : record.WeightKg,
            SystolicBp = record.SystolicBp,
            DiastolicBp = record.DiastolicBp,
            BloodSugar = record.BloodSugar == 0 ? record.Glucose : record.BloodSugar,
            Cholesterol = record.Cholesterol,
            ActivityLevel = record.ActivityLevel,
            SleepHours = record.SleepHours,
            StressLevel = record.StressLevel,
            SmokingStatus = record.SmokingStatus,
            Symptoms = record.Symptoms
        };
    }

    private static Dictionary<string, string[]> ValidatePredictionInput(PredictHealthRiskRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        AddRequiredError(errors, nameof(request.Age), request.Age);
        AddRequiredError(errors, nameof(request.Gender), request.Gender);
        AddRequiredError(errors, nameof(request.HeightCm), request.HeightCm);
        AddRequiredError(errors, nameof(request.WeightKg), request.WeightKg);
        AddRequiredError(errors, nameof(request.SystolicBp), request.SystolicBp, "Systolic blood pressure is required");
        AddRequiredError(errors, nameof(request.DiastolicBp), request.DiastolicBp, "Diastolic blood pressure is required");
        AddRequiredError(errors, nameof(request.BloodSugar), request.BloodSugar, "Blood sugar is required");
        AddRequiredError(errors, nameof(request.Cholesterol), request.Cholesterol, "Cholesterol is required");
        AddRequiredError(errors, nameof(request.SleepHours), request.SleepHours);
        AddRequiredError(errors, nameof(request.StressLevel), request.StressLevel);

        return errors;
    }

    private static void AddRequiredError<T>(
        Dictionary<string, string[]> errors,
        string field,
        T? value,
        string? message = null)
    {
        if (value is null || value is string text && string.IsNullOrWhiteSpace(text))
        {
            errors[field] = new[] { message ?? $"{field} is required for prediction." };
        }
    }

    private static PredictHealthRiskResponse ToResponse(PredictionResult prediction)
    {
        return new PredictHealthRiskResponse
        {
            PredictionId = prediction.Id,
            UserId = prediction.UserId,
            HealthRecordId = prediction.HealthRecordId,
            RiskLevel = prediction.RiskLevel,
            RiskScore = prediction.RiskScore,
            Explanation = prediction.Explanation,
            ContributingFactors = ParseFactors(prediction.ContributingFactors),
            ModelName = prediction.ModelName,
            CreatedAt = prediction.CreatedAt,
            HealthRecord = prediction.HealthRecord is null ? null : ToHealthRecordResponse(prediction.HealthRecord)
        };
    }

    private static HealthRecordResponseDto ToHealthRecordResponse(HealthRecord record)
    {
        return new HealthRecordResponseDto
        {
            Id = record.Id,
            UserId = record.UserId,
            Age = record.Age,
            Gender = record.Gender,
            Weight = record.Weight,
            Height = record.Height,
            WeightKg = record.WeightKg,
            HeightCm = record.HeightCm,
            Bmi = record.Bmi,
            BloodPressure = record.BloodPressure,
            SystolicBp = record.SystolicBp,
            DiastolicBp = record.DiastolicBp,
            HeartRate = record.HeartRate,
            Glucose = record.Glucose,
            BloodSugar = record.BloodSugar,
            Cholesterol = record.Cholesterol,
            ActivityLevel = record.ActivityLevel,
            SleepHours = record.SleepHours,
            StressLevel = record.StressLevel,
            SmokingStatus = record.SmokingStatus,
            Symptoms = record.Symptoms,
            CreatedAt = record.CreatedAt
        };
    }

    private static IReadOnlyList<string> ParseFactors(string factors)
    {
        if (string.IsNullOrWhiteSpace(factors))
        {
            return Array.Empty<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<IReadOnlyList<string>>(factors) ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return factors.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
    }

    private static IQueryable<PredictionResult> ApplyPredictionSort(
        IQueryable<PredictionResult> query,
        string sortBy,
        string sortDirection)
    {
        var descending = !sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
        return sortBy.ToLowerInvariant() switch
        {
            "risklevel" => descending ? query.OrderByDescending(item => item.RiskLevel) : query.OrderBy(item => item.RiskLevel),
            "riskscore" => descending ? query.OrderByDescending(item => item.RiskScore) : query.OrderBy(item => item.RiskScore),
            "modelname" => descending ? query.OrderByDescending(item => item.ModelName) : query.OrderBy(item => item.ModelName),
            _ => descending ? query.OrderByDescending(item => item.CreatedAt) : query.OrderBy(item => item.CreatedAt)
        };
    }

    private async Task CreatePredictionNotificationsAsync(
        PredictionResult prediction,
        CancellationToken cancellationToken)
    {
        await AddPredictionNotificationIfMissingAsync(
            prediction,
            title: "Prediction Completed",
            message: "A new health prediction has been generated successfully. View your results now.",
            type: NotificationTypes.Info,
            cancellationToken);

        string? type = null;
        if (prediction.RiskLevel.Equals("High", StringComparison.OrdinalIgnoreCase) || prediction.RiskScore >= 70)
        {
            type = NotificationTypes.Alert;
        }
        else if (prediction.RiskLevel.Equals("Medium", StringComparison.OrdinalIgnoreCase)
            || prediction.RiskScore is >= 40 and <= 69)
        {
            type = NotificationTypes.Info;
        }

        if (type is null)
        {
            return;
        }

        await AddPredictionNotificationIfMissingAsync(
            prediction,
            title: type == NotificationTypes.Alert ? "Health Risk Alert" : "Health Risk Update",
            message: $"Your latest health prediction shows {prediction.RiskLevel} risk with a score of {prediction.RiskScore}. Please review your health recommendations.",
            type,
            cancellationToken);
    }

    private async Task AddPredictionNotificationIfMissingAsync(
        PredictionResult prediction,
        string title,
        string message,
        string type,
        CancellationToken cancellationToken)
    {
        var exists = await _dataService.Query<Notification>(true).AnyAsync(
            notification => notification.PredictionResultId == prediction.Id
                && notification.UserId == prediction.UserId
                && notification.Title == title,
            cancellationToken);

        if (exists)
        {
            return;
        }

        var notification = new Notification
        {
            UserId = prediction.UserId,
            Title = title,
            Message = message,
            Type = type,
            Source = NotificationSources.Prediction,
            PredictionResultId = prediction.Id,
            CreatedAt = DateTime.UtcNow
        };

        _dataService.Add(notification);
        await _dataService.SaveChangesAsync(cancellationToken);
        await _realtimeNotificationService.SendNotificationAsync(notification, cancellationToken);
    }
}
