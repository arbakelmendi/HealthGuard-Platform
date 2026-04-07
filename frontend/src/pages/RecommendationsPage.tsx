import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recommendationsData } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function RecommendationsPage() {
  const priorityColor = (p: string) =>
    p === "High" ? "border-health-danger text-health-danger" :
    p === "Medium" ? "border-health-warning text-health-warning" :
    "border-health-success text-health-success";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" /> Recommendations
          </h1>
          <p className="text-muted-foreground text-sm">AI-generated personalized health recommendations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendationsData.map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-all h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{rec.icon}</span>
                    <Badge variant="outline" className={priorityColor(rec.priority)}>{rec.priority}</Badge>
                  </div>
                  <h3 className="font-display font-semibold mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <Badge variant="secondary" className="text-xs">{rec.category}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
