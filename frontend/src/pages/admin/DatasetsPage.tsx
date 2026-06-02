import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Upload, Eye, Archive, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageContainer } from "@/components/PageContainers";
import { datasetsApi, type DatasetRecord, type DatasetType } from "@/services/datasetsApi";

type UploadMode = "create" | "replace";

const defaultUpload = {
  name: "",
  type: "Classification" as DatasetType,
  source: "",
  status: "Active" as "Active" | "Processing",
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedDataset, setSelectedDataset] = useState<DatasetRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("create");
  const [replaceTarget, setReplaceTarget] = useState<DatasetRecord | null>(null);
  const [uploadForm, setUploadForm] = useState(defaultUpload);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const statusColor = (status: string) => {
    switch (status) {
      case "Active": return "border-health-success text-health-success";
      case "Processing": return "border-health-warning text-health-warning";
      case "Archived": return "border-muted-foreground text-muted-foreground";
      default: return "";
    }
  };

  const loadDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await datasetsApi.list({
        search: search || undefined,
        type: typeFilter,
        status: statusFilter,
        sortBy,
        sortDirection,
        page: 1,
        pageSize: 100,
      });
      setDatasets(response.items);
      setTotal(response.total);
    } catch (err) {
      setError("Datasets could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDatasets();
  }, [search, typeFilter, statusFilter, sortBy, sortDirection]);

  const summary = useMemo(() => ({
    total: total || datasets.length,
    active: datasets.filter((d) => d.status === "Active").length,
    records: datasets.reduce((sum, d) => sum + d.records, 0),
    classification: datasets.filter((d) => d.type === "Classification").length,
  }), [datasets, total]);

  const openUpload = () => {
    setUploadMode("create");
    setReplaceTarget(null);
    setUploadForm(defaultUpload);
    setSelectedFile(null);
    setUploadOpen(true);
  };

  const openReplace = (dataset: DatasetRecord) => {
    setUploadMode("replace");
    setReplaceTarget(dataset);
    setUploadForm({ name: dataset.name, type: dataset.type, source: dataset.source, status: "Active" });
    setSelectedFile(null);
    setUploadOpen(true);
  };

  const handleView = async (dataset: DatasetRecord) => {
    try {
      setSelectedDataset(await datasetsApi.get(dataset.id));
    } catch (err) {
      toast.error("Dataset details could not be loaded.");
    }
  };

  const handleArchive = async (dataset: DatasetRecord) => {
    try {
      await datasetsApi.archive(dataset.id);
      toast.success(`${dataset.name} archived.`);
      await loadDatasets();
    } catch (err) {
      toast.error("Dataset could not be archived.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Select a CSV file first.");
      return;
    }

    setSaving(true);
    try {
      if (uploadMode === "replace" && replaceTarget) {
        await datasetsApi.replace(replaceTarget.id, selectedFile);
        toast.success("Dataset file replaced.");
      } else {
        await datasetsApi.upload({ ...uploadForm, file: selectedFile });
        toast.success("Dataset uploaded.");
      }

      setUploadOpen(false);
      setSelectedFile(null);
      await loadDatasets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Dataset save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Database className="h-7 w-7 text-cyan-400" /> Datasets</h1>
            <p className="text-muted-foreground text-sm">Manage training and evaluation datasets.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={openUpload}>
            <Upload className="w-4 h-4 mr-2" /> Upload Dataset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Datasets", value: summary.total },
            { label: "Active", value: summary.active, color: "text-health-success" },
            { label: "Total Records", value: summary.records.toLocaleString() },
            { label: "Classification", value: summary.classification, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-display font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {uploadOpen && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-display">{uploadMode === "replace" ? `Replace ${replaceTarget?.name}` : "Upload Dataset"}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {uploadMode === "create" && (
                <>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={uploadForm.name} onChange={(e) => setUploadForm((form) => ({ ...form, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value) => setUploadForm((form) => ({ ...form, type: value as DatasetType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Classification">Classification</SelectItem>
                        <SelectItem value="Clustering">Clustering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input value={uploadForm.source} onChange={(e) => setUploadForm((form) => ({ ...form, source: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={uploadForm.status} onValueChange={(value) => setUploadForm((form) => ({ ...form, status: value as "Active" | "Processing" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>CSV File</Label>
                <Input type="file" accept=".csv,text/csv" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSubmit} disabled={saving} className="gradient-primary text-primary-foreground">
                  {saving ? "Saving..." : uploadMode === "replace" ? "Replace" : "Upload"}
                </Button>
                <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={saving}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDataset && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Dataset Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDataset(null)}>Close</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Detail label="Name" value={selectedDataset.name} />
              <Detail label="Type" value={selectedDataset.type} />
              <Detail label="Records" value={selectedDataset.records.toLocaleString()} />
              <Detail label="Source" value={selectedDataset.source} />
              <Detail label="File Name" value={selectedDataset.fileName} />
              <Detail label="File Path" value={selectedDataset.filePath} />
              <Detail label="Status" value={selectedDataset.status} />
              <Detail label="Uploaded By" value={selectedDataset.uploadedByName || selectedDataset.uploadedByEmail || "System"} />
              <Detail label="Upload Date" value={new Date(selectedDataset.uploadDate).toLocaleDateString()} />
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base font-display">All Datasets</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Search datasets" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Classification">Classification</SelectItem>
                  <SelectItem value="Clustering">Clustering</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadDate">Upload Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="records">Records</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDirection} onValueChange={setSortDirection}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
            {loading ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Loading datasets...</div>
            ) : datasets.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No datasets found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell><Badge variant="secondary">{d.type}</Badge></TableCell>
                      <TableCell className="font-mono">{d.records.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{new Date(d.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.source}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor(d.status)}>{d.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(d)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openReplace(d)}><RefreshCw className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleArchive(d)} disabled={d.status === "Archived"}><Archive className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </AdminPageContainer>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
