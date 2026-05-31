using HealthGuard.API.DTOs.Predictions;

namespace HealthGuard.API.Services.Implementations;

public class HealthRiskPredictionService
{
    public const string ModelName = "HealthGuard Rule-Based Risk Model v1.0";

    public PredictionComputation Predict(PredictHealthRiskRequest request)
    {
        var age = request.Age ?? throw new InvalidOperationException("Age is required for prediction.");
        var heightCm = request.HeightCm ?? throw new InvalidOperationException("HeightCm is required for prediction.");
        var weightKg = request.WeightKg ?? throw new InvalidOperationException("WeightKg is required for prediction.");
        var systolicBp = request.SystolicBp ?? throw new InvalidOperationException("SystolicBp is required for prediction.");
        var diastolicBp = request.DiastolicBp ?? throw new InvalidOperationException("DiastolicBp is required for prediction.");
        var bloodSugar = request.BloodSugar ?? throw new InvalidOperationException("BloodSugar is required for prediction.");
        var cholesterol = request.Cholesterol ?? throw new InvalidOperationException("Cholesterol is required for prediction.");
        var activityLevel = request.ActivityLevel ?? string.Empty;
        var sleepHours = request.SleepHours ?? throw new InvalidOperationException("SleepHours is required for prediction.");
        var stressLevel = request.StressLevel ?? throw new InvalidOperationException("StressLevel is required for prediction.");
        var smokingStatus = request.SmokingStatus ?? string.Empty;
        var symptomsText = request.Symptoms ?? string.Empty;
        var factors = new List<string>();
        var score = 0;
        var bmi = CalculateBmi(heightCm, weightKg);

        // Each rule contributes transparent points so patients and clinicians can see the cause.
        if (age >= 75)
        {
            score += 15;
            factors.Add($"Age 75+ ({age})");
        }
        else if (age >= 60)
        {
            score += 10;
            factors.Add($"Age 60-74 ({age})");
        }
        else if (age >= 45)
        {
            score += 5;
            factors.Add($"Age 45-59 ({age})");
        }

        if (bmi < 18.5m)
        {
            score += 10;
            factors.Add($"Underweight BMI ({bmi:0.0})");
        }
        else if (bmi >= 30m)
        {
            score += 20;
            factors.Add($"Obese BMI ({bmi:0.0})");
        }
        else if (bmi >= 25m)
        {
            score += 10;
            factors.Add($"Overweight BMI ({bmi:0.0})");
        }

        if (systolicBp >= 140 || diastolicBp >= 90)
        {
            score += 20;
            factors.Add($"High blood pressure ({systolicBp}/{diastolicBp})");
        }
        else if ((systolicBp >= 130 && systolicBp <= 139) ||
                 (diastolicBp >= 80 && diastolicBp <= 89))
        {
            score += 10;
            factors.Add($"Elevated blood pressure ({systolicBp}/{diastolicBp})");
        }

        if (bloodSugar >= 126)
        {
            score += 20;
            factors.Add($"High blood sugar ({bloodSugar:0})");
        }
        else if (bloodSugar >= 100)
        {
            score += 10;
            factors.Add($"Elevated blood sugar ({bloodSugar:0})");
        }

        if (cholesterol >= 240)
        {
            score += 15;
            factors.Add($"High cholesterol ({cholesterol:0})");
        }
        else if (cholesterol >= 200)
        {
            score += 8;
            factors.Add($"Borderline cholesterol ({cholesterol:0})");
        }

        switch (activityLevel.Trim().ToLowerInvariant())
        {
            case "sedentary":
                score += 15;
                factors.Add("Sedentary activity level");
                break;
            case "low":
                score += 10;
                factors.Add("Low activity level");
                break;
            case "moderate":
                score += 3;
                factors.Add("Moderate activity level");
                break;
        }

        if (sleepHours < 6)
        {
            score += 10;
            factors.Add($"Short sleep duration ({sleepHours:0.#} hours)");
        }
        else if (sleepHours <= 7)
        {
            score += 5;
            factors.Add($"Borderline sleep duration ({sleepHours:0.#} hours)");
        }

        if (stressLevel >= 8)
        {
            score += 15;
            factors.Add($"High stress level ({stressLevel}/10)");
        }
        else if (stressLevel >= 5)
        {
            score += 8;
            factors.Add($"Moderate stress level ({stressLevel}/10)");
        }

        switch (smokingStatus.Trim().ToLowerInvariant())
        {
            case "current":
                score += 15;
                factors.Add("Current smoking");
                break;
            case "former":
                score += 5;
                factors.Add("Former smoking");
                break;
        }

        var symptoms = symptomsText.ToLowerInvariant();
        if (symptoms.Contains("chest pain") || symptoms.Contains("shortness of breath"))
        {
            score += 20;
            factors.Add("Serious reported symptoms");
        }
        else if (symptoms.Contains("fatigue") || symptoms.Contains("headache"))
        {
            score += 5;
            factors.Add("Fatigue or headache symptoms");
        }

        score = Math.Min(score, 100);
        var riskLevel = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
        var explanation = BuildExplanation(riskLevel, score, factors);

        return new PredictionComputation(score, riskLevel, explanation, factors, bmi, ModelName);
    }

    private static decimal CalculateBmi(decimal heightCm, decimal weightKg)
    {
        var heightMeters = heightCm / 100m;
        return Math.Round(weightKg / (heightMeters * heightMeters), 2);
    }

    private static string BuildExplanation(string riskLevel, int score, IReadOnlyList<string> factors)
    {
        if (factors.Count == 0)
        {
            return $"The rule-based model assigned a {riskLevel.ToLowerInvariant()} risk score of {score} because no major risk contributors were detected in the submitted data.";
        }

        return $"The rule-based model assigned a {riskLevel.ToLowerInvariant()} risk score of {score} based on {string.Join(", ", factors.Take(4))}.";
    }
}

public record PredictionComputation(
    int RiskScore,
    string RiskLevel,
    string Explanation,
    IReadOnlyList<string> ContributingFactors,
    decimal Bmi,
    string ModelName);
