import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, HeartPulse, ShieldCheck, Sparkles, Stethoscope, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  bloodType: "",
  activityLevel: "",
  chronicConditions: "",
  allergies: "",
  smokingStatus: "",
};

const accountFields: SignupField[] = ["firstName", "lastName", "email", "password", "confirmPassword"];
const healthFields: SignupField[] = ["age", "gender", "weight", "height"];
const accountFieldSet = new Set<SignupField>(accountFields);
const healthFieldSet = new Set<SignupField>(healthFields);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const chronicConditionOptions = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Prediabetes", "Hypertension (High Blood Pressure)",
  "Heart Disease", "Coronary Artery Disease", "Heart Failure", "Arrhythmia", "Asthma",
  "Chronic Obstructive Pulmonary Disease (COPD)", "Chronic Kidney Disease", "Liver Disease",
  "Stroke History", "High Cholesterol (Hyperlipidemia)", "Arthritis", "Osteoporosis",
  "Thyroid Disorder", "Cancer", "Depression", "Anxiety Disorder", "Epilepsy / Seizure Disorder",
  "Autoimmune Disease", "Sleep Apnea", "Obesity", "None", "Other",
];
const allergyOptions = [
  "Pollen", "Dust", "Mold", "Pet Dander", "Insect Stings", "Peanuts", "Tree Nuts",
  "Milk / Dairy", "Eggs", "Soy", "Wheat / Gluten", "Fish", "Shellfish", "Sesame",
  "Penicillin", "Antibiotics (Other)", "Aspirin", "Ibuprofen / NSAIDs", "Latex",
  "Contrast Dye", "Fragrances / Perfumes", "None", "Other",
];
const duplicateEmailMessage = "This email is already registered. Please sign in or use another email.";

const parseMulti = (value: string) => value ? value.split(", ").filter(Boolean) : [];
const toggleMultiValue = (current: string, option: string) => {
  const selected = parseMulti(current);
  if (option === "None") return selected.includes("None") ? "" : "None";
  const withoutNone = selected.filter((item) => item !== "None");
  const next = withoutNone.includes(option) ? withoutNone.filter((item) => item !== option) : [...withoutNone, option];
  return next.join(", ");
};

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

const clearFields = <T extends Partial<Record<SignupField, unknown>>>(state: T, fields: SignupField[]) => {
  const next = { ...state };
  fields.forEach((field) => {
    delete next[field];
  });
  return next;
};

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<SignupTouched>({});
  const [accountSubmitted, setAccountSubmitted] = useState(false);
  const [healthSubmitted, setHealthSubmitted] = useState(false);
  const [showHealthErrors, setShowHealthErrors] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const setField = (field: SignupField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setApiError("");

    const shouldRevalidate =
      touched[field] ||
      (accountFieldSet.has(field) && accountSubmitted) ||
      (healthFieldSet.has(field) && healthSubmitted);

    if (shouldRevalidate) {
      setErrors((prev) => {
        const next = { ...prev };
        const error = getFieldError(field, { ...form, [field]: value });
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }

        if ((field === "password" || field === "confirmPassword") && (accountSubmitted || touched.confirmPassword || touched.password)) {
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
        if (confirmPasswordError && (field === "confirmPassword" || touched.confirmPassword || accountSubmitted)) {
          next.confirmPassword = confirmPasswordError;
        } else if (!confirmPasswordError) {
          delete next.confirmPassword;
        }
      }

      return next;
    });
  };

  const shouldShowError = (field: SignupField) => {
    if (healthFieldSet.has(field)) {
      return Boolean(errors[field] && (showHealthErrors || touched[field]));
    }

    return Boolean(errors[field] && (accountSubmitted || touched[field]));
  };

  const goNext = () => {
    // Continue validates Step 1 only. Step 2 fields must stay pristine until
    // Create Account or individual blur.
    const nextErrors = validateFields(accountFields, form);
    setAccountSubmitted(true);
    setTouched((prev) => ({
      ...prev,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    }));
    setErrors((prev) => ({ ...clearFields(prev, healthFields), ...nextErrors }));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setApiError("");
    setShowHealthErrors(false);
    setHealthSubmitted(false);
    setErrors((prev) => clearFields(prev, healthFields));
    setTouched((prev) => clearFields(prev, healthFields));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateFields(healthFields, form);
    setShowHealthErrors(true);
    setHealthSubmitted(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setApiError("");
    setLoading(true);

    try {
      const { age, weight, height, ...optionalFields } = form;
      await signup({
        ...optionalFields,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
      });
      toast.success("Account created.");
      navigate("/", { replace: true });
    } catch (err) {
      const isDuplicateEmail = axios.isAxiosError(err) && err.response?.status === 409;
      const responseMessage = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      const message = isDuplicateEmail
        ? duplicateEmailMessage
        : responseMessage || "Unable to create account. Please try again.";

      if (isDuplicateEmail) {
        setStep(1);
        setAccountSubmitted(true);
        setTouched((current) => ({ ...current, email: true }));
        setErrors((current) => ({ ...current, email: duplicateEmailMessage }));
      }

      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden lg:block gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(255,255,255,0.36),transparent_45%)]" />
        <div className="relative flex h-full flex-col p-8 text-white xl:p-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <Stethoscope className="size-6" />
            </div>
            <span className="font-display text-xl font-bold">HealthGuard</span>
          </Link>
          <div className="my-auto max-w-md">
            <p className="mb-3 text-sm uppercase tracking-[0.24em] text-white/70">Personalized risk intelligence</p>
            <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">Build your health baseline in minutes.</h1>
            <p className="mt-5 text-white/78">The registration flow still uses the current HealthGuard backend and creates a real account.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: HeartPulse, label: "Vitals" },
                { icon: ShieldCheck, label: "Secure" },
                { icon: Sparkles, label: "AI ready" },
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

      <div className="flex items-center justify-center p-4 md:p-5">
        <div className="w-full max-w-4xl">
          <Link to="/" className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-2xl gradient-primary">
              <Stethoscope className="size-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">HealthGuard</span>
          </Link>

          <Card className="rounded-3xl border bg-white/84 shadow-card backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl">Create account</CardTitle>
            <CardDescription>{step === 1 ? "Step 1 of 2: Account information" : "Step 2 of 2: Personal and health information"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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
                      aria-invalid={shouldShowError("email")}
                      className={shouldShowError("email") ? "border-destructive focus-visible:ring-destructive" : undefined}
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
                  <div className="rounded-2xl border bg-white/65 p-3.5">
                    <h3 className="mb-2.5 text-sm font-semibold text-foreground">Core health details</h3>
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
                        }}
                      >
                        <SelectTrigger onBlur={() => markTouched("gender")}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
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
                  </div>
                  <div className="rounded-2xl border bg-white/65 p-3.5">
                    <h3 className="mb-2.5 text-sm font-semibold text-foreground">Contact and lifestyle</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
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
                    <div className="space-y-2">
                      <Label>Smoking Status</Label>
                      <Select value={form.smokingStatus} onValueChange={(value) => setField("smokingStatus", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Never", "Former", "Current"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <MultiSelectPanel
                      title="Chronic Conditions"
                      options={chronicConditionOptions}
                      value={form.chronicConditions}
                      onChange={(option) => setField("chronicConditions", toggleMultiValue(form.chronicConditions || "", option))}
                    />
                    <MultiSelectPanel
                      title="Allergies"
                      options={allergyOptions}
                      value={form.allergies}
                      onChange={(option) => setField("allergies", toggleMultiValue(form.allergies || "", option))}
                    />
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
                  <Button
                    type="button"
                    className="gradient-primary text-primary-foreground"
                    onClick={(event) => {
                      event.preventDefault();
                      goNext();
                    }}
                  >
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
    </div>
  );
}

function MultiSelectPanel({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value?: string;
  onChange: (option: string) => void;
}) {
  const selected = parseMulti(value || "");

  return (
    <div className="rounded-2xl border bg-white/65 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{selected.length || 0} selected</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
          <label
            key={option}
            className={`flex min-h-9 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] leading-snug transition hover:-translate-y-0.5 ${
              checked
                ? "border-cyan-400 bg-cyan-50 text-cyan-800 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                : "border-border/70 bg-white/55 text-foreground hover:bg-white"
            }`}
          >
            <Checkbox checked={checked} onCheckedChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
          );
        })}
      </div>
    </div>
  );
}
