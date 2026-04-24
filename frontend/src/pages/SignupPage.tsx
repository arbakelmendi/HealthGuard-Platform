import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import type { SignupRequest } from "@/types/auth";

type SignupForm = Omit<SignupRequest, "age" | "weight" | "height"> & {
  age: string;
  weight: string;
  height: string;
};

type SignupField = keyof SignupForm;
type SignupErrors = Partial<Record<SignupField, string>>;
type SignupTouched = Partial<Record<SignupField, boolean>>;

const initialForm: SignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
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

const accountFields: SignupField[] = ["firstName", "lastName", "email", "password", "confirmPassword"];
const healthFields: SignupField[] = ["age", "gender", "weight", "height"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

const getFieldError = (field: SignupField, form: SignupForm): string => {
  const value = form[field];

  switch (field) {
    case "firstName":
    case "lastName": {
      const label = field === "firstName" ? "First name" : "Last name";
      if (!value.trim()) return `${label} is required`;
      if (!namePattern.test(value.trim())) return `${label} can contain only letters`;
      return "";
    }
    case "email":
      if (!value.trim()) return "Email is required";
      if (!emailPattern.test(value.trim())) return "Please enter a valid email";
      return "";
    case "password":
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password";
      if (value !== form.password) return "Passwords do not match";
      return "";
    case "age": {
      if (!value.trim()) return "Age is required";
      const age = Number(value);
      if (!Number.isFinite(age) || !Number.isInteger(age)) return "Age must be between 1 and 120";
      if (age < 1 || age > 120) return "Age must be between 1 and 120";
      return "";
    }
    case "gender":
      if (!value) return "Gender is required";
      return "";
    case "weight": {
      if (!value.trim()) return "Weight is required";
      const weight = Number(value);
      if (!Number.isFinite(weight) || weight < 20 || weight > 300) return "Weight must be between 20 and 300 kg";
      return "";
    }
    case "height": {
      if (!value.trim()) return "Height is required";
      const height = Number(value);
      if (!Number.isFinite(height) || height < 100 || height > 250) return "Height must be between 100 and 250 cm";
      return "";
    }
    default:
      return "";
  }
};

const validateFields = (fields: SignupField[], form: SignupForm): SignupErrors =>
  fields.reduce<SignupErrors>((acc, field) => {
    const error = getFieldError(field, form);
    if (error) {
      acc[field] = error;
    }
    return acc;
  }, {});

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<SignupTouched>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const setField = (field: SignupField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setApiError("");

    if (submitted || touched[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        const error = getFieldError(field, { ...form, [field]: value });
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }

        if ((field === "password" || field === "confirmPassword") && (submitted || touched.confirmPassword || touched.password)) {
          const passwordError = getFieldError("password", { ...form, [field]: value });
          const confirmPasswordError = getFieldError("confirmPassword", { ...form, [field]: value });

          if (passwordError) next.password = passwordError;
          else delete next.password;

          if (confirmPasswordError) next.confirmPassword = confirmPasswordError;
          else delete next.confirmPassword;
        }

        return next;
      });
    }
  };

  const markTouched = (field: SignupField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      const error = getFieldError(field, form);

      if (error) next[field] = error;
      else delete next[field];

      if (field === "password" || field === "confirmPassword") {
        const confirmPasswordError = getFieldError("confirmPassword", form);
        if (confirmPasswordError && (field === "confirmPassword" || touched.confirmPassword || submitted)) {
          next.confirmPassword = confirmPasswordError;
        } else if (!confirmPasswordError) {
          delete next.confirmPassword;
        }
      }

      return next;
    });
  };

  const shouldShowError = (field: SignupField) => Boolean(errors[field] && (submitted || touched[field]));

  const goNext = () => {
    const nextErrors = validateFields(accountFields, form);
    setSubmitted(true);
    setTouched((prev) => ({
      ...prev,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    }));
    setErrors((prev) => ({ ...prev, ...nextErrors }));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStep(2);
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateFields([...accountFields, ...healthFields], form);
    setSubmitted(true);
    setTouched((prev) => ({
      ...prev,
      age: true,
      gender: true,
      weight: true,
      height: true,
    }));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setApiError("");
    setLoading(true);

    try {
      await signup({
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      });
      toast.success("Account created.");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("API ERROR:", err);
      const message = err instanceof Error ? err.message : "Unable to create account.";
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow">
            <Activity className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">HealthGuard</h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-display">Sign Up</CardTitle>
            <CardDescription>{step === 1 ? "Step 1 of 2: Account Information" : "Step 2 of 2: Personal and Health Information"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                        onBlur={() => markTouched("firstName")}
                      />
                      {shouldShowError("firstName") && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => setField("lastName", e.target.value)}
                        onBlur={() => markTouched("lastName")}
                      />
                      {shouldShowError("lastName") && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                    />
                    {shouldShowError("email") && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        onBlur={() => markTouched("password")}
                      />
                      {shouldShowError("password") && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        onBlur={() => markTouched("confirmPassword")}
                      />
                      {shouldShowError("confirmPassword") && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={form.age}
                        onChange={(e) => setField("age", e.target.value)}
                        onBlur={() => markTouched("age")}
                      />
                      {shouldShowError("age") && <p className="text-sm text-destructive">{errors.age}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={form.gender}
                        onValueChange={(value) => {
                          setField("gender", value);
                          setTouched((prev) => ({ ...prev, gender: true }));
                        }}
                      >
                        <SelectTrigger onBlur={() => markTouched("gender")}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {shouldShowError("gender") && <p className="text-sm text-destructive">{errors.gender}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="20"
                        max="300"
                        value={form.weight}
                        onChange={(e) => setField("weight", e.target.value)}
                        onBlur={() => markTouched("weight")}
                      />
                      {shouldShowError("weight") && <p className="text-sm text-destructive">{errors.weight}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        min="100"
                        max="250"
                        value={form.height}
                        onChange={(e) => setField("height", e.target.value)}
                        onBlur={() => markTouched("height")}
                      />
                      {shouldShowError("height") && <p className="text-sm text-destructive">{errors.height}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select value={form.bloodType} onValueChange={(value) => setField("bloodType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                      <Select value={form.activityLevel} onValueChange={(value) => setField("activityLevel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Sedentary", "Light", "Moderate", "Active", "Very active"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                      <Textarea id="chronicConditions" value={form.chronicConditions} onChange={(e) => setField("chronicConditions", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea id="allergies" value={form.allergies} onChange={(e) => setField("allergies", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Smoking Status</Label>
                    <Select value={form.smokingStatus} onValueChange={(value) => setField("smokingStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Never", "Former", "Current", "Prefer not to say"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {apiError && <p className="text-sm text-destructive">{apiError}</p>}

              <div className="flex items-center justify-between gap-3 pt-2">
                {step === 2 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step === 1 ? (
                  <Button type="button" className="gradient-primary text-primary-foreground" onClick={goNext}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="gradient-primary text-primary-foreground" disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                )}
              </div>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
