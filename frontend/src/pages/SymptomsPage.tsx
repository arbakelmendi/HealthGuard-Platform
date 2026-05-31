import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangle, Edit, Loader2, Plus, Search, Stethoscope, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserPageContainer } from "@/components/PageContainers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { symptomsApi, type SymptomLog, type SymptomLogPayload, type SymptomSeverity } from "@/services/symptomsApi";
import { useNotifications } from "@/contexts/NotificationsContext";

const symptomOptions = [
  "Headache", "Fatigue", "Dizziness", "Chest Pain", "Shortness of Breath", "Back Pain",
  "Abdominal Pain", "Nausea", "Vomiting", "Fever", "Cough", "Sore Throat",
  "Muscle Pain", "Joint Pain", "Insomnia", "Anxiety", "Palpitations", "Blurred Vision",
  "Increased Thirst", "Frequent Urination", "Loss of Appetite", "Sweating", "Numbness",
  "Weakness", "Other",
];

const severityOptions: SymptomSeverity[] = ["Mild", "Moderate", "Severe", "Critical"];
const durationOptions = ["30 min", "1 hour", "2 hours", "3 hours", "All day", "1 day", "2 days", "Ongoing", "Other"];

type FormState = {
  symptom: string;
  customSymptom: string;
  severity: SymptomSeverity | "";
  duration: string;
  customDuration: string;
  notes: string;
};

const emptyForm: FormState = {
  symptom: "",
  customSymptom: "",
  severity: "",
  duration: "",
  customDuration: "",
  notes: "",
};

const severityClass = (severity: string) =>
  severity === "Critical"
    ? "border-red-600 bg-red-600/10 text-red-700"
    : severity === "Severe"
    ? "border-health-danger/30 bg-health-danger/10 text-health-danger"
    : severity === "Moderate"
    ? "border-health-warning/30 bg-health-warning/10 text-health-warning"
    : "border-health-success/30 bg-health-success/10 text-health-success";

const getCreatedAt = (symptom: SymptomLog) => symptom.createdAt ?? null;

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const toLocalDateInputValue = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const newestFirst = (items: SymptomLog[]) =>
  [...items].sort((a, b) => {
    const aTime = parseDate(getCreatedAt(a))?.getTime() ?? 0;
    const bTime = parseDate(getCreatedAt(b))?.getTime() ?? 0;
    return bTime - aTime;
  });

const buildPayload = (form: FormState): SymptomLogPayload | null => {
  const symptom = form.symptom === "Other" ? form.customSymptom.trim() : form.symptom;
  const duration = form.duration === "Other" ? form.customDuration.trim() : form.duration;

  if (!symptom) {
    toast.error("Symptom is required.");
    return null;
  }
  if (!form.severity) {
    toast.error("Severity is required.");
    return null;
  }
  if (!duration) {
    toast.error("Duration is required.");
    return null;
  }

  return {
    symptom,
    severity: form.severity,
    duration,
    notes: form.notes.trim() || undefined,
  };
};

const toFormState = (log: SymptomLog): FormState => ({
  symptom: symptomOptions.includes(log.symptom) ? log.symptom : "Other",
  customSymptom: symptomOptions.includes(log.symptom) ? "" : log.symptom,
  severity: log.severity,
  duration: durationOptions.includes(log.duration) ? log.duration : "Other",
  customDuration: durationOptions.includes(log.duration) ? "" : log.duration,
  notes: log.notes || "",
});

function SymptomFields({ form, setForm }: { form: FormState; setForm: (form: FormState) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2">
        <Label>Symptom</Label>
        <Select value={form.symptom} onValueChange={(value) => setForm({ ...form, symptom: value })}>
          <SelectTrigger><SelectValue placeholder="Select symptom" /></SelectTrigger>
          <SelectContent>
            {symptomOptions.map((symptom) => <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {form.symptom === "Other" && (
        <div className="space-y-2">
          <Label>Describe symptom</Label>
          <Input value={form.customSymptom} onChange={(e) => setForm({ ...form, customSymptom: e.target.value })} />
        </div>
      )}
      <div className="space-y-2">
        <Label>Severity</Label>
        <Select value={form.severity} onValueChange={(value) => setForm({ ...form, severity: value as SymptomSeverity })}>
          <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
          <SelectContent>
            {severityOptions.map((severity) => <SelectItem key={severity} value={severity}>{severity}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Duration</Label>
        <Select value={form.duration} onValueChange={(value) => setForm({ ...form, duration: value })}>
          <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
          <SelectContent>
            {durationOptions.map((duration) => <SelectItem key={duration} value={duration}>{duration}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {form.duration === "Other" && (
        <div className="space-y-2">
          <Label>Custom duration</Label>
          <Input value={form.customDuration} onChange={(e) => setForm({ ...form, customDuration: e.target.value })} />
        </div>
      )}
      <div className="space-y-2 md:col-span-2 xl:col-span-4">
        <Label>Additional notes</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
      </div>
    </div>
  );
}

export default function SymptomsPage() {
  const { refreshUnreadCount } = useNotifications();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editingSymptom, setEditingSymptom] = useState<SymptomLog | null>(null);
  const [deletingSymptom, setDeletingSymptom] = useState<SymptomLog | null>(null);

  const loadSymptoms = async () => {
    try {
      setLoadError(null);
      setSymptoms(newestFirst(await symptomsApi.getMySymptoms()));
    } catch (err) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      const message = response?.data?.message ?? "";
      if (response?.status === 500 && message.includes("SymptomLogs")) {
        const readyMessage = "Symptoms service is not ready. Please run the latest database migration.";
        setLoadError(readyMessage);
        toast.error(readyMessage);
      } else {
        setLoadError("Could not load symptoms. Please try again.");
        toast.error("Could not load symptoms.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSymptoms();
  }, []);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return newestFirst(symptoms.filter((item) => {
      const matchesSearch = !normalized
        || item.symptom.toLowerCase().includes(normalized)
        || item.severity.toLowerCase().includes(normalized)
        || item.duration.toLowerCase().includes(normalized)
        || (item.notes || "").toLowerCase().includes(normalized);
      const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
      const matchesDate = !dateFilter || toLocalDateInputValue(getCreatedAt(item)) === dateFilter;
      return matchesSearch && matchesSeverity && matchesDate;
    }));
  }, [dateFilter, search, severityFilter, symptoms]);

  const createSymptom = async () => {
    const payload = buildPayload(form);
    if (!payload) return;

    setSaving(true);
    try {
      const created = await symptomsApi.createSymptomLog(payload);
      setSymptoms((current) => newestFirst([created, ...current]));
      setForm(emptyForm);
      await refreshUnreadCount();
      toast.success("Symptom logged.");
    } catch {
      toast.error("Could not log symptom.");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editingSymptom) return;
    const payload = buildPayload(editForm);
    if (!payload) return;

    setSaving(true);
    try {
      const updated = await symptomsApi.updateSymptomLog(editingSymptom.id, payload);
      setSymptoms((current) => newestFirst(current.map((item) => item.id === updated.id ? updated : item)));
      setEditingSymptom(null);
      toast.success("Symptom updated.");
    } catch {
      toast.error("Could not update symptom.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSymptom = async () => {
    if (!deletingSymptom) return;

    try {
      await symptomsApi.deleteSymptomLog(deletingSymptom.id);
      setSymptoms((current) => current.filter((item) => item.id !== deletingSymptom.id));
      setDeletingSymptom(null);
      toast.success("Symptom deleted.");
    } catch {
      toast.error("Could not delete symptom.");
    }
  };

  return (
    <DashboardLayout>
      <UserPageContainer>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
            <Stethoscope className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> Symptoms
          </h1>
          <p className="text-muted-foreground text-sm">Log and track your symptoms over time.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-white/60 bg-white/80 shadow-card backdrop-blur-xl">
          <div className="h-1.5 gradient-primary" />
          <CardHeader><CardTitle className="text-base font-display">Log New Symptom</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <SymptomFields form={form} setForm={setForm} />
            <Button onClick={() => void createSymptom()} disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Log Symptom
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="overflow-hidden border-white/60 bg-white/80 shadow-card backdrop-blur-xl">
          <div className="h-1.5 bg-gradient-to-r from-[#0EA5E9] via-[#14B8C4] to-[#22C55E]" />
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base font-display">Symptom History</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search symptoms..." className="pl-9 md:w-64" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_180px_auto]">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {severityOptions.map((severity) => <SelectItem key={severity} value={severity}>{severity}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              <Button variant="outline" onClick={() => { setSearch(""); setSeverityFilter("all"); setDateFilter(""); }}>Clear filters</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <div className="rounded-2xl border border-health-danger/20 bg-health-danger/10 p-8 text-center">
                <AlertTriangle className="mx-auto mb-3 size-6 text-health-danger" />
                <p className="font-display font-semibold text-health-danger">{loadError}</p>
                <p className="mt-1 text-sm text-muted-foreground">After applying the migration, refresh this page to continue symptom tracking.</p>
                <Button variant="outline" className="mt-4" onClick={() => void loadSymptoms()}>Retry</Button>
              </div>
            ) : loading ? (
              <div className="rounded-2xl border bg-white/45 p-8 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-3 size-5 animate-spin text-primary" />
                Loading symptoms...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white/45 p-8 text-center">
                <p className="font-display font-semibold">{symptoms.length === 0 ? "No symptoms logged yet." : "No symptoms match your filters."}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {symptoms.length === 0 ? "Log your first symptom to improve your health tracking." : "Try clearing filters or changing your search."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symptom</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{formatDateTime(getCreatedAt(item))}</TableCell>
                          <TableCell className="font-medium">{item.symptom}</TableCell>
                          <TableCell><Badge variant="outline" className={severityClass(item.severity)}>{item.severity}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.duration}</TableCell>
                          <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">{item.notes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingSymptom(item); setEditForm(toFormState(item)); }}><Edit className="mr-1 size-4" /> Edit</Button>
                            <Button variant="ghost" size="sm" className="text-health-danger hover:text-health-danger" onClick={() => setDeletingSymptom(item)}><Trash2 className="mr-1 size-4" /> Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-3 md:hidden">
                  {filtered.map((item) => (
                    <div key={item.id} className="rounded-2xl border bg-white/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.symptom}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(getCreatedAt(item))} - {item.duration}</p>
                        </div>
                        <Badge variant="outline" className={severityClass(item.severity)}>{item.severity}</Badge>
                      </div>
                      {item.notes && <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>}
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingSymptom(item); setEditForm(toFormState(item)); }}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-health-danger" onClick={() => setDeletingSymptom(item)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <Dialog open={!!editingSymptom} onOpenChange={(open) => !open && setEditingSymptom(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Edit Symptom</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <SymptomFields form={editForm} setForm={setEditForm} />
              <Button onClick={() => void saveEdit()} disabled={saving} className="gradient-primary text-primary-foreground">
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingSymptom} onOpenChange={(open) => !open && setDeletingSymptom(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete symptom?</AlertDialogTitle>
              <AlertDialogDescription>This removes the symptom log from your history.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-health-danger text-white hover:bg-health-danger/90" onClick={() => void deleteSymptom()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </UserPageContainer>
    </DashboardLayout>
  );
}
