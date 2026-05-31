import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Brain,
  CheckCircle2,
  Clock3,
  Droplet,
  Dumbbell,
  Loader2,
  Moon,
  Play,
  RefreshCw,
  RotateCcw,
  Salad,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserPageContainer } from "@/components/PageContainers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { recommendationsData } from "@/lib/mockData";
import { predictionsApi, type PredictHealthRiskResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildPersonalizedRecommendations,
  recommendationCategories,
  type PersonalizedRecommendation,
  type RecommendationCategory,
  type RecommendationStatus,
} from "@/lib/recommendations";
import { toast } from "sonner";

const categoryIcons: Record<RecommendationCategory, typeof Salad> = {
  Nutrition: Salad,
  Exercise: Dumbbell,
  Sleep: Moon,
  "Stress Management": Brain,
  Hydration: Droplet,
  "Preventive Care": ShieldCheck,
};

const fallbackDurations: Record<string, string> = {
  Exercise: "4 weeks",
  Diet: "21 days",
  Nutrition: "21 days",
  Sleep: "14 nights",
  Hydration: "7 days",
  "Mental Health": "10 days",
  "Stress Management": "10 days",
  Prevention: "Monthly",
  "Preventive Care": "Monthly",
};

const filters = ["All", ...recommendationCategories] as const;

const priorityClass = (priority: string) =>
  priority === "High"
    ? "border-health-danger/25 bg-health-danger/10 text-health-danger"
    : priority === "Medium"
    ? "border-health-warning/25 bg-health-warning/10 text-health-warning"
    : "border-health-success/25 bg-health-success/10 text-health-success";

const statusClass = (status: RecommendationStatus) =>
  status === "Completed"
    ? "border-health-success/25 bg-health-success/10 text-health-success"
    : status === "In Progress"
    ? "border-primary/25 bg-primary/10 text-primary"
    : "border-muted bg-white/70 text-muted-foreground";

const riskClass = (riskLevel: string) =>
  riskLevel === "High"
    ? "text-health-danger"
    : riskLevel === "Medium"
    ? "text-health-warning"
    : "text-health-success";

const getLatestPrediction = (predictions: PredictHealthRiskResponse[]) =>
  [...predictions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] ?? null;

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>("All");
  const [predictions, setPredictions] = useState<PredictHealthRiskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const statusStorageKey = user?.id ? `healthguard:recommendation-status:${user.id}` : "";
  const bookmarkStorageKey = user?.id ? `healthguard:recommendation-bookmarks:${user.id}` : "";

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    predictionsApi.getByUser(Number(user.id))
      .then(setPredictions)
      .catch(() => toast.error("Could not load prediction-based recommendations."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!statusStorageKey) return;
    const saved = localStorage.getItem(statusStorageKey);
    setStatuses(saved ? JSON.parse(saved) : {});
  }, [statusStorageKey]);

  useEffect(() => {
    if (!bookmarkStorageKey) return;
    const saved = localStorage.getItem(bookmarkStorageKey);
    setBookmarked(saved ? JSON.parse(saved) : {});
  }, [bookmarkStorageKey]);

  const latestPrediction = useMemo(() => getLatestPrediction(predictions), [predictions]);
  const recommendations = useMemo(
    () => buildPersonalizedRecommendations(latestPrediction, user),
    [latestPrediction, user],
  );

  const visibleRecommendations = useMemo(
    () =>
      selectedFilter === "All"
        ? recommendations
        : recommendations.filter((recommendation) => recommendation.category === selectedFilter),
    [recommendations, selectedFilter],
  );

  const setRecommendationStatus = (id: string, status: RecommendationStatus) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    if (statusStorageKey) localStorage.setItem(statusStorageKey, JSON.stringify(next));
  };

  const toggleBookmark = (id: string) => {
    const next = { ...bookmarked, [id]: !bookmarked[id] };
    setBookmarked(next);
    if (bookmarkStorageKey) localStorage.setItem(bookmarkStorageKey, JSON.stringify(next));
  };

  const displayDuration = (recommendation: PersonalizedRecommendation) =>
    recommendation.duration ||
    fallbackDurations[recommendation.category] ||
    (recommendationsData.find((item) => item.title === recommendation.title) as { duration?: string } | undefined)?.duration ||
    "14 days";

  const primaryActionLabel = (status: RecommendationStatus) =>
    status === "Completed" ? "Completed" : status === "In Progress" ? "Mark Completed" : "Start";

  const handlePrimaryAction = (id: string, status: RecommendationStatus) => {
    if (status === "Pending") {
      setRecommendationStatus(id, "In Progress");
      return;
    }

    if (status === "In Progress") {
      setRecommendationStatus(id, "Completed");
    }
  };

  const openRecommendationDetails = (recommendation: PersonalizedRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  return (
    <DashboardLayout>
      <UserPageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
              <Brain className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> Recommendations
            </h1>
            <p className="text-muted-foreground text-sm">Personalized plans based on your health profile and predictions.</p>
          </div>
          {latestPrediction && (
            <Badge variant="outline" className="rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-primary">
              Latest score {latestPrediction.riskScore}/100
            </Badge>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              className={`shrink-0 rounded-full ${selectedFilter === filter ? "gradient-primary text-primary-foreground" : "bg-white/70"}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card className="glass-card rounded-3xl">
            <CardContent className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading personalized recommendations...
            </CardContent>
          </Card>
        ) : !latestPrediction ? (
          <Card className="glass-card rounded-3xl">
            <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="grid size-14 place-items-center rounded-2xl gradient-soft">
                <Sparkles className="size-7 text-primary" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">No recommendations available yet.</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Generate a health prediction first to receive personalized recommendations.
              </p>
              <Button asChild className="mt-5 gradient-primary text-primary-foreground">
                <Link to="/risk-assessment">Generate Prediction</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold">Why These Recommendations?</h2>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    These recommendations were generated because your latest prediction detected a {latestPrediction.riskLevel.toLowerCase()} risk profile and matched it with your health record data.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Risk Score</p>
                    <p className="font-display text-xl font-bold">{latestPrediction.riskScore}/100</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Risk Level</p>
                    <p className={`font-display text-xl font-bold ${riskClass(latestPrediction.riskLevel)}`}>{latestPrediction.riskLevel}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 p-4 text-sm text-muted-foreground">
                {latestPrediction.explanation}
              </div>
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {visibleRecommendations.length === 0 ? (
                <Card className="glass-card rounded-3xl md:col-span-2 xl:col-span-3">
                  <CardContent className="p-8 text-center">
                    <p className="font-display font-semibold">No recommendations in this category yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try All, or generate a new prediction after updating your health profile.</p>
                  </CardContent>
                </Card>
              ) : visibleRecommendations.map((recommendation, index) => {
                const Icon = categoryIcons[recommendation.category];
                const status = statuses[recommendation.id] ?? "Pending";

                return (
                  <motion.article
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Card
                      className={`flex h-full min-h-[430px] cursor-pointer overflow-hidden rounded-3xl bg-white/80 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-card-hover ${
                        status === "Completed"
                          ? "border-health-success/40 ring-1 ring-health-success/15"
                          : "border-white/70"
                      }`}
                      onClick={() => openRecommendationDetails(recommendation)}
                    >
                      <div className="flex w-full flex-col">
                        <div className="gradient-primary p-4 text-primary-foreground">
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                              <Icon className="size-6" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleBookmark(recommendation.id);
                              }}
                            >
                              <Bookmark className={`size-4 ${bookmarked[recommendation.id] ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <Badge className="border-0 bg-white/18 text-white">
                              <Clock3 className="mr-1 size-3" /> {displayDuration(recommendation)}
                            </Badge>
                            <Badge className="border-0 bg-white/18 text-white">{recommendation.category}</Badge>
                          </div>
                        </div>

                        <CardContent className="flex flex-1 flex-col p-5">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className={priorityClass(recommendation.priority)}>
                              {recommendation.priority} Priority
                            </Badge>
                            <Badge variant="outline" className={statusClass(status)}>
                              {status === "Completed" && <CheckCircle2 className="mr-1 size-3" />}
                              {status}
                            </Badge>
                          </div>
                          <h3 className="font-display text-lg font-semibold leading-tight">{recommendation.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{recommendation.description}</p>

                          <div className="mt-auto space-y-2 pt-5">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                className="gradient-primary text-primary-foreground"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handlePrimaryAction(recommendation.id, status);
                                }}
                                disabled={status === "Completed"}
                              >
                                {status === "Completed" ? <CheckCircle2 className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
                                {primaryActionLabel(status)}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openRecommendationDetails(recommendation);
                                }}
                              >
                                View Details
                              </Button>
                            </div>

                            {status === "Completed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-full border-muted bg-slate-50 text-muted-foreground transition hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRecommendationStatus(recommendation.id, "Pending");
                                }}
                              >
                                <RefreshCw className="mr-2 size-3.5" />
                                Reset
                              </Button>
                            ) : status === "In Progress" ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-9 w-full bg-primary/10 text-primary transition hover:bg-primary/15"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRecommendationStatus(recommendation.id, "Pending");
                                }}
                              >
                                <RotateCcw className="mr-2 size-3.5" />
                                Move to Pending
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.article>
                );
              })}
            </motion.div>
          </>
        )}

        <Dialog open={!!selectedRecommendation} onOpenChange={(open) => !open && setSelectedRecommendation(null)}>
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-3xl">
            {selectedRecommendation && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">{selectedRecommendation.title}</DialogTitle>
                  <DialogDescription>
                    {selectedRecommendation.category} plan with {selectedRecommendation.priority.toLowerCase()} priority.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={priorityClass(selectedRecommendation.priority)}>{selectedRecommendation.priority} Priority</Badge>
                    <Badge variant="outline" className={statusClass(statuses[selectedRecommendation.id] ?? "Pending")}>
                      {statuses[selectedRecommendation.id] ?? "Pending"}
                    </Badge>
                    <Badge variant="outline"><Clock3 className="mr-1 size-3" /> {displayDuration(selectedRecommendation)}</Badge>
                    <Badge variant="outline">{selectedRecommendation.category}</Badge>
                  </div>

                  <div className="rounded-2xl bg-white/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Explanation</p>
                    <p className="mt-2 text-sm">{selectedRecommendation.explanation}</p>
                  </div>

                  <div className="rounded-2xl bg-primary/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Why this was generated</p>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedRecommendation.whyGenerated}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border bg-white/55 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step-by-step actions</p>
                      <ol className="space-y-2">
                        {selectedRecommendation.actions.map((action, index) => (
                          <li key={action} className="flex gap-2 text-sm">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="rounded-2xl border bg-white/55 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected benefits</p>
                      <div className="space-y-2">
                        {selectedRecommendation.benefits.map((benefit) => (
                          <div key={benefit} className="flex gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-health-success" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button className="gradient-primary text-primary-foreground" onClick={() => setRecommendationStatus(selectedRecommendation.id, "In Progress")}>
                      <Play className="mr-2 size-4" /> Mark In Progress
                    </Button>
                    <Button variant="outline" onClick={() => setRecommendationStatus(selectedRecommendation.id, "Completed")}>
                      <CheckCircle2 className="mr-2 size-4" /> Mark Completed
                    </Button>
                    <Button variant="ghost" onClick={() => setRecommendationStatus(selectedRecommendation.id, "Pending")}>
                      Reset to Pending
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </UserPageContainer>
    </DashboardLayout>
  );
}
