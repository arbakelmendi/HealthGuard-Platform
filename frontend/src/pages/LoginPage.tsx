import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLoginErrorMessage = (error: unknown) => {
  const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data;
  const firstValidationError = response?.errors ? Object.values(response.errors)[0]?.[0] : undefined;
  return firstValidationError ?? response?.message ?? (error instanceof Error ? error.message : "Unable to sign in.");
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    if (!email.trim() || !password) return "Email and password are required.";
    if (!emailPattern.test(email)) return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success("Welcome back.");
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : user.role === "admin" ? "/admin/dashboard" : "/", { replace: true });
    } catch (err) {
      console.error("API ERROR:", err);
      const message = getLoginErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden lg:block gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.42),transparent_45%)]" />
        <div className="relative flex h-full flex-col p-10 text-white xl:p-14">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <Stethoscope className="size-6" />
            </div>
            <span className="font-display text-xl font-bold">HealthGuard</span>
          </Link>
          <div className="my-auto max-w-xl">
            <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/70">AI health intelligence</p>
            <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">Welcome back. Your HealthScore is waiting.</h1>
            <p className="mt-5 max-w-md text-white/78">
              Sign in to continue tracking risk signals, recommendations, and admin workflows with the connected HealthGuard backend.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: Heart, label: "Cardio" },
                { icon: ShieldCheck, label: "Protected" },
                { icon: Sparkles, label: "Insights" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <Icon className="size-5" />
                  <div className="mt-3 text-xs text-white/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[390px]">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-2xl gradient-primary">
              <Stethoscope className="size-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">HealthGuard</span>
          </Link>

          <Card className="rounded-3xl border bg-white/82 shadow-card backdrop-blur">
            <CardHeader className="pb-5">
              <CardTitle className="font-display text-2xl">Sign in</CardTitle>
              <CardDescription className="text-base">Continue to your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@health.io" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                  Remember me
                </label>
              </div>
              {error && <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              New to HealthGuard?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
