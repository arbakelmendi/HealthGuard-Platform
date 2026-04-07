import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminUsersData } from "@/lib/mockData";
import { Users, Search, UserCog, Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");

  const filtered = adminUsersData.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Users Management</h1>
          <p className="text-muted-foreground text-sm">Manage platform users, roles, and access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: adminUsersData.length, color: "text-primary" },
            { label: "Active", value: adminUsersData.filter((u) => u.status === "Active").length, color: "text-health-success" },
            { label: "Inactive", value: adminUsersData.filter((u) => u.status === "Inactive").length, color: "text-muted-foreground" },
            { label: "Admins", value: adminUsersData.filter((u) => u.role === "Admin").length, color: "text-health-info" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Predictions</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell><Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.status === "Active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{u.predictions}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.joinedDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${u.name}`)}>
                          <UserCog className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.warning(`${u.name} disabled`)}>
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
