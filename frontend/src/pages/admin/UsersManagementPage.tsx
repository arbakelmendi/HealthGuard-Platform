import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, UserCog, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { usersApi } from "@/services/usersApi";
import type { AdminCreateUserRequest, AdminUpdateUserRequest, AuthUser, UserRole, UserStatus } from "@/types/auth";

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  age: string;
  gender: string;
  weight: string;
  height: string;
  phone: string;
  city: string;
  bloodType: string;
  activityLevel: string;
  chronicConditions: string;
  allergies: string;
  smokingStatus: string;
};

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  age: "",
  gender: "",
  weight: "",
  height: "",
  phone: "",
  city: "",
  bloodType: "",
  activityLevel: "",
  chronicConditions: "",
  allergies: "",
  smokingStatus: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDate = (value: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
};

const userToForm = (user: AuthUser): UserForm => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  password: "",
  role: user.role,
  status: user.status,
  age: user.age?.toString() || "",
  gender: user.gender || "",
  weight: user.weight?.toString() || "",
  height: user.height?.toString() || "",
  phone: user.phone || "",
  city: user.city || "",
  bloodType: user.bloodType || "",
  activityLevel: user.activityLevel || "",
  chronicConditions: user.chronicConditions || "",
  allergies: user.allergies || "",
  smokingStatus: user.smokingStatus || "",
});

const validateForm = (form: UserForm, mode: "create" | "edit") => {
  if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return "Name and email are required.";
  if (!emailPattern.test(form.email)) return "Enter a valid email address.";
  if (mode === "create" && form.password.length < 6) return "Password must be at least 6 characters.";
  if (form.age && (Number(form.age) < 1 || Number(form.age) > 120)) return "Age must be between 1 and 120.";
  if (form.weight && Number(form.weight) <= 0) return "Weight must be positive.";
  if (form.height && Number(form.height) <= 0) return "Height must be positive.";
  return "";
};

const toCreatePayload = (form: UserForm): AdminCreateUserRequest => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  password: form.password,
  role: form.role,
  status: form.status,
  age: form.age ? Number(form.age) : undefined,
  gender: form.gender || undefined,
  weight: form.weight ? Number(form.weight) : undefined,
  height: form.height ? Number(form.height) : undefined,
  phone: form.phone || undefined,
  city: form.city || undefined,
  bloodType: form.bloodType || undefined,
  activityLevel: form.activityLevel || undefined,
  chronicConditions: form.chronicConditions || undefined,
  allergies: form.allergies || undefined,
  smokingStatus: form.smokingStatus || undefined,
});

const toUpdatePayload = (form: UserForm): AdminUpdateUserRequest => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  role: form.role,
  status: form.status,
  age: form.age ? Number(form.age) : undefined,
  gender: form.gender || undefined,
  weight: form.weight ? Number(form.weight) : undefined,
  height: form.height ? Number(form.height) : undefined,
  phone: form.phone || undefined,
  city: form.city || undefined,
  bloodType: form.bloodType || undefined,
  activityLevel: form.activityLevel || undefined,
  chronicConditions: form.chronicConditions || undefined,
  allergies: form.allergies || undefined,
  smokingStatus: form.smokingStatus || undefined,
});

export default function UsersManagementPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const nextUsers = await usersApi.list();
      setUsers(nextUsers);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((user) => user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
  }, [search, users]);

  const stats = {
    total: users.length,
    active: users.filter((item) => item.status === "active").length,
    inactive: users.filter((item) => item.status === "inactive").length,
    admins: users.filter((item) => item.role === "admin").length,
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (target: AuthUser) => {
    setEditingUser(target);
    setForm(userToForm(target));
    setDialogOpen(true);
  };

  const setField = (field: keyof UserForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveUser = async () => {
    const mode = editingUser ? "edit" : "create";
    const validationError = validateForm(form, mode);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, authService.toAdminUpdateRequest(toUpdatePayload(form)));
        toast.success("User updated.");
      } else {
        await usersApi.create(authService.toAdminCreateRequest(toCreatePayload(form)));
        toast.success("User created.");
      }
      setDialogOpen(false);
      await loadUsers();
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save user.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      setDeleteTarget(null);
      return;
    }

    try {
      await usersApi.remove(deleteTarget.id);
      toast.success("User deleted.");
      await loadUsers();
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete user.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Users Management</h1>
            <p className="text-muted-foreground text-sm">Manage platform users, roles, health profiles, and access.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, color: "text-primary" },
            { label: "Active Users", value: stats.active, color: "text-health-success" },
            { label: "Inactive Users", value: stats.inactive, color: "text-muted-foreground" },
            { label: "Admins", value: stats.admins, color: "text-health-info" },
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
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-display">All Users</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Loading users...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.fullName}</p>
                          <p className="text-xs text-muted-foreground">{[item.age ? `${item.age} yrs` : "", item.city].filter(Boolean).join(" / ") || "Profile pending"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
                      <TableCell><Badge variant={item.role === "admin" ? "default" : "secondary"}>{item.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={item.status === "active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label={`Edit ${item.fullName}`}>
                            <UserCog className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(item)} aria-label={`Delete ${item.fullName}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>Manage account access and core HealthGuard profile fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2 max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value: UserRole) => setField("role", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value: UserStatus) => setField("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => setField("age", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(value) => setField("gender", value)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Female", "Male", "Non-binary", "Prefer not to say"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={(e) => setField("weight", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height} onChange={(e) => setField("height", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={form.bloodType} onValueChange={(value) => setField("bloodType", value)}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={form.activityLevel} onValueChange={(value) => setField("activityLevel", value)}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {["Sedentary", "Light", "Moderate", "Active", "Very active"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <Textarea value={form.chronicConditions} onChange={(e) => setField("chronicConditions", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea value={form.allergies} onChange={(e) => setField("allergies", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Smoking Status</Label>
              <Select value={form.smokingStatus} onValueChange={(value) => setField("smokingStatus", value)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {["Never", "Former", "Current", "Prefer not to say"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => void saveUser()}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the user from the backend database and the users table. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
