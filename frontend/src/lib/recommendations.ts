import type { PredictHealthRiskResponse, RiskLevel } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export type RecommendationCategory =
  | "Nutrition"
  | "Exercise"
  | "Sleep"
  | "Stress Management"
  | "Hydration"
  | "Preventive Care";

export type RecommendationPriority = "Low" | "Medium" | "High";

export type RecommendationStatus = "Pending" | "In Progress" | "Completed";

export type PersonalizedRecommendation = {
  id: string;
  title: string;
  category: RecommendationCategory;
  description: string;
  explanation: string;
  whyGenerated: string;
  actions: string[];
  benefits: string[];
  duration: string;
  priority: RecommendationPriority;
  targetedRiskLevel: RiskLevel;
};

type RecommendationSeed = Omit<PersonalizedRecommendation, "id" | "targetedRiskLevel"> & {
  id: string;
  minRisk?: RiskLevel;
};

export const recommendationCategories: RecommendationCategory[] = [
  "Nutrition",
  "Exercise",
  "Sleep",
  "Stress Management",
  "Hydration",
  "Preventive Care",
];

const riskRank: Record<RiskLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const containsAny = (value: string, terms: string[]) =>
  terms.some((term) => value.toLowerCase().includes(term));

const hasFactor = (prediction: PredictHealthRiskResponse, terms: string[]) =>
  prediction.contributingFactors.some((factor) => containsAny(factor, terms)) ||
  containsAny(prediction.explanation, terms);

const withRisk = (
  seed: RecommendationSeed,
  prediction: PredictHealthRiskResponse,
): PersonalizedRecommendation => ({
  ...seed,
  targetedRiskLevel: prediction.riskLevel,
});

export function buildPersonalizedRecommendations(
  prediction: PredictHealthRiskResponse | null,
  user?: AuthUser | null,
): PersonalizedRecommendation[] {
  if (!prediction) return [];

  const record = prediction.healthRecord;
  const chronicConditions = user?.chronicConditions?.trim() || "No chronic conditions listed";
  const allergies = user?.allergies?.trim() || "No allergies listed";
  const recommendations: RecommendationSeed[] = [];

  const add = (seed: RecommendationSeed) => {
    if (seed.minRisk && riskRank[prediction.riskLevel] < riskRank[seed.minRisk]) return;
    if (!recommendations.some((item) => item.id === seed.id)) recommendations.push(seed);
  };

  add({
    id: "hydrate-consistently",
    title: "Maintain Daily Hydration",
    category: "Hydration",
    description: "Keep fluid intake steady to support circulation, energy, and metabolic balance.",
    explanation: "A consistent hydration routine helps keep your core wellness markers stable between prediction checks.",
    whyGenerated: `Your latest prediction is ${prediction.riskLevel} risk at ${prediction.riskScore}/100, so hydration remains a low-friction way to support overall health.`,
    actions: ["Drink water after waking up", "Keep a bottle nearby during work", "Add a hydration reminder before meals", "Adjust intake on hot or active days"],
    benefits: ["More stable energy", "Better circulation support", "Improved appetite and glucose regulation"],
    duration: "7 days",
    priority: "Low",
  });

  add({
    id: "weekly-movement",
    title: prediction.riskLevel === "Low" ? "Keep Weekly Movement Consistent" : "Increase Physical Activity",
    category: "Exercise",
    description: "Build a realistic movement plan that improves cardiovascular and metabolic resilience.",
    explanation: "Movement is one of the strongest levers for lowering future risk scores and improving health record trends.",
    whyGenerated: hasFactor(prediction, ["activity", "exercise", "bmi", "weight"]) || record?.activityLevel
      ? `Your activity profile and latest prediction suggest movement can reduce risk pressure. Current activity: ${record?.activityLevel || user?.activityLevel || "not specified"}.`
      : `Your ${prediction.riskLevel} risk result benefits from a steady exercise baseline.`,
    actions: ["Walk briskly for 20-30 minutes", "Add two light strength sessions weekly", "Break up long sitting periods", "Track how activity affects your next prediction"],
    benefits: ["Lower cardiovascular strain", "Improved glucose control", "Better weight and blood pressure trends"],
    duration: prediction.riskLevel === "High" ? "14 days" : "4 weeks",
    priority: "High",
  });

  if (
    prediction.riskLevel !== "Low" ||
    hasFactor(prediction, ["sugar", "glucose", "diabetes", "cholesterol", "diet", "bmi"]) ||
    Number(record?.bloodSugar ?? record?.glucose ?? 0) >= 110 ||
    Number(record?.cholesterol ?? 0) >= 200
  ) {
    add({
      id: "reduce-sugar-processed-foods",
      title: "Reduce Sugar Intake",
      category: "Nutrition",
      description: "Limit sugary drinks and processed foods while increasing fiber-rich meals.",
      explanation: "Nutrition changes can directly influence blood sugar, cholesterol, BMI, and long-term risk trends.",
      whyGenerated: `Your prediction explanation and health profile indicate nutrition is relevant. Chronic conditions: ${chronicConditions}. Allergies: ${allergies}.`,
      actions: ["Avoid sugary drinks", "Reduce processed snacks", "Choose whole grains and fiber-rich foods", "Monitor glucose-related symptoms and readings"],
      benefits: ["Improved blood sugar control", "Reduced diabetes risk", "Better energy stability"],
      duration: "21 days",
      priority: "High",
      minRisk: "Medium",
    });
  }

  if (
    prediction.riskLevel !== "Low" ||
    hasFactor(prediction, ["sleep", "fatigue", "rest"]) ||
    Number(record?.sleepHours ?? 8) < 7
  ) {
    add({
      id: "sleep-schedule-reset",
      title: "Improve Sleep Schedule",
      category: "Sleep",
      description: "Create a repeatable sleep window to improve recovery and reduce risk strain.",
      explanation: "Sleep affects stress hormones, appetite regulation, blood pressure, and next-day activity.",
      whyGenerated: `Your latest prediction was ${prediction.riskLevel} risk. Sleep hours from your health record: ${record?.sleepHours ?? "not recorded"}.`,
      actions: ["Set a consistent bedtime", "Stop caffeine late in the day", "Dim screens 45 minutes before bed", "Aim for 7-8 hours of sleep"],
      benefits: ["Better recovery", "Lower stress response", "Improved blood pressure and appetite regulation"],
      duration: "14 nights",
      priority: "Medium",
    });
  }

  if (
    prediction.riskLevel !== "Low" ||
    hasFactor(prediction, ["stress", "anxiety", "pressure"]) ||
    Number(record?.stressLevel ?? 0) >= 6
  ) {
    add({
      id: "stress-breathing-routine",
      title: "Daily Stress Reset",
      category: "Stress Management",
      description: "Use short breathing and mindfulness sessions to lower stress load.",
      explanation: "Stress management can improve sleep, blood pressure, decision-making, and consistency with health habits.",
      whyGenerated: `Stress is relevant to your current risk picture. Recorded stress level: ${record?.stressLevel ?? "not recorded"}.`,
      actions: ["Practice 5 minutes of paced breathing", "Take a short outdoor break", "Write down one stress trigger", "Schedule one recovery block daily"],
      benefits: ["Lower daily tension", "Better sleep quality", "Improved heart-rate and blood-pressure support"],
      duration: "10 days",
      priority: "Medium",
    });
  }

  add({
    id: "preventive-care-baseline",
    title: "Preventive Care",
    category: "Preventive Care",
    description: "Keep routine screenings and profile updates current so future predictions stay accurate.",
    explanation: "Preventive care keeps your health record fresh and helps detect changes before they become urgent.",
    whyGenerated: `Your latest result is ${prediction.riskLevel} risk at ${prediction.riskScore}/100, so routine follow-up and updated health data remain useful.`,
    actions: ["Review your health profile monthly", "Keep routine screenings current", "Update chronic conditions and allergies", "Run a fresh prediction after major health changes"],
    benefits: ["More accurate predictions", "Earlier detection of changes", "Better long-term health planning"],
    duration: "Monthly",
    priority: "Low",
  });

  if (prediction.riskLevel === "High" || prediction.riskScore >= 70) {
    add({
      id: "clinical-follow-up",
      title: "Consult a Healthcare Professional",
      category: "Preventive Care",
      description: "Review your latest high-risk prediction with a qualified clinician.",
      explanation: "High-risk predictions should be paired with professional review, especially when multiple factors contribute.",
      whyGenerated: `Your latest prediction score is ${prediction.riskScore}/100 with a ${prediction.riskLevel} risk level. Explanation: ${prediction.explanation}`,
      actions: ["Book a primary care appointment", "Bring your prediction explanation", "Review blood pressure, glucose, and cholesterol", "Ask whether monitoring or lab work is needed"],
      benefits: ["Earlier intervention", "More accurate clinical guidance", "Clear next steps for risk reduction"],
      duration: "This week",
      priority: "High",
      minRisk: "High",
    });

    add({
      id: "daily-monitoring",
      title: "Daily Health Monitoring",
      category: "Preventive Care",
      description: "Track key symptoms and vitals daily until your risk trend improves.",
      explanation: "Daily monitoring helps catch changes early and creates better context for your next prediction.",
      whyGenerated: `A high prediction score (${prediction.riskScore}/100) makes short-term monitoring more important.`,
      actions: ["Log symptoms once per day", "Record blood pressure if available", "Note sleep and stress changes", "Repeat prediction after updating health data"],
      benefits: ["Faster response to changes", "Better trend visibility", "More useful data for clinicians"],
      duration: "7 days",
      priority: "High",
      minRisk: "High",
    });
  }

  return recommendations
    .map((seed) => withRisk(seed, prediction))
    .sort((a, b) => {
      const priorityRank: Record<RecommendationPriority, number> = { High: 3, Medium: 2, Low: 1 };
      return priorityRank[b.priority] - priorityRank[a.priority];
    });
}

export function getTopRecommendations(
  prediction: PredictHealthRiskResponse | null,
  user?: AuthUser | null,
  count = 3,
) {
  return buildPersonalizedRecommendations(prediction, user).slice(0, count);
}
