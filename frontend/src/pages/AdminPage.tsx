import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminUsersData } from "@/lib/mockData";
import { Users, Settings, FileText, Activity } from "lucide-react";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">System management and configuration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "Total Users", value: "1,247", icon: Users, color: "text-primary" },
            { title: "Active Sessions", value: "89", icon: Activity, color: "text-health-success" },
            { title: "Predictions Today", value: "342", icon: Settings, color: "text-health-info" },
            { title: "Reports Generated", value: "56", icon: FileText, color: "text-health-warning" },
          ].map(stat => (
            <Card key={stat.title} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-display font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsersData.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell><Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={u.status === "Active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="shadow-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-display">System logs will appear here</p>
                <p className="text-sm">Real-time monitoring coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds">
            <Card className="shadow-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Settings className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-display">Risk threshold configuration</p>
                <p className="text-sm">Configure alert thresholds and AI model parameters</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
