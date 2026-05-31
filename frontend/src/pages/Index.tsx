import { Link } from "react-router-dom";
import { Activity, ArrowRight, Brain, CheckCircle2, Heart, LineChart, MessageSquareHeart, ShieldCheck, Sparkles, Star, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen">
      <header className="px-4 pt-4 md:px-6 md:pt-6">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 md:px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl gradient-primary"><Stethoscope className="size-5 text-white" /></div>
            <span className="font-display text-lg font-bold">HealthGuard</span>
          </Link>
          <nav className="hidden gap-7 text-sm text-foreground/70 md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#score" className="hover:text-foreground">HealthScore</a>
            <a href="#trust" className="hover:text-foreground">Platform</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/signup"><Button>Get started <ArrowRight className="size-4" /></Button></Link>
          </div>
        </div>
      </header>

      <section className="px-4 pt-16 md:px-6 md:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/70">
              <Sparkles className="size-3.5 text-primary" /> AI symptom guidance, predictions, and reports
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-display font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Your daily <span className="gradient-text">AI health</span> companion.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              HealthGuard turns symptoms, vitals, and lifestyle signals into a clear health picture with personalized predictions and recommendations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button size="lg" className="px-6">Start free <ArrowRight className="size-4" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline" className="px-6">Sign in</Button></Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-foreground/60">
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Protected account data</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Connected to your backend</div>
            </div>
          </div>
          <div className="relative min-h-[500px]">
            <div className="glass absolute inset-0 overflow-hidden rounded-[2rem] p-6">
              <div className="absolute -right-24 -top-24 size-64 rounded-full bg-primary/30 blur-3xl" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-foreground/50">Today - HealthScore</div>
                <div className="mt-2 flex items-end gap-3">
                  <div className="text-7xl font-display font-bold gradient-text">82</div>
                  <div className="pb-2 text-sm font-medium text-health-success">+4 this week</div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[{ icon: Heart, label: "Cardio", value: "Low risk" }, { icon: Brain, label: "Stress", value: "Stable" }, { icon: Activity, label: "Sleep", value: "7h 12m" }].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="glass-card rounded-xl p-3">
                      <Icon className="size-4 text-primary" />
                      <div className="mt-2 text-[11px] text-foreground/50">{label}</div>
                      <div className="text-sm font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card mt-5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-foreground/50"><MessageSquareHeart className="size-4 text-secondary" /> AI Assistant</div>
                  <p className="mt-2 text-sm">Mild headache and short sleep noted. Hydration, light movement, and symptom tracking are recommended.</p>
                </div>
                <div className="glass-card mt-4 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/50">Prediction - Cardiovascular risk</span>
                    <span className="font-medium text-health-success">Low - 18%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/5"><div className="h-full w-[18%] rounded-full gradient-primary" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-32 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-display font-bold tracking-tight md:text-5xl">Built for everyday health decisions.</h2>
            <p className="mt-4 text-foreground/60">A Nexus-style interface for the existing HealthGuard workflows.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MessageSquareHeart, title: "Symptom guidance", desc: "Structured symptom logging with calm next steps." },
              { icon: Brain, title: "Predictive risk modeling", desc: "Health risk estimates powered by saved profiles and records." },
              { icon: Sparkles, title: "Recommendations", desc: "Personalized care suggestions for sleep, activity, and prevention." },
              { icon: LineChart, title: "Reports", desc: "Readable summaries and trend views for health history." },
              { icon: ShieldCheck, title: "Admin operations", desc: "Tools for users, datasets, prediction records, and analytics." },
              { icon: Activity, title: "Connected dashboard", desc: "A modern command center for your backend." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-6 transition hover:-translate-y-0.5">
                <div className="mb-4 grid size-11 place-items-center rounded-xl soft-icon"><Icon className="size-5 text-primary" /></div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-foreground/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="score" className="mt-32 px-4 md:px-6">
        <div className="glass mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] p-8 md:p-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-primary">HealthScore</div>
            <h2 className="mt-4 text-4xl font-display font-bold md:text-5xl">One number. Real context.</h2>
            <p className="mt-4 max-w-md text-foreground/60">A simple visual summary across risk, symptoms, sleep, activity, and trend signals.</p>
          </div>
          <div className="grid place-items-center">
            <div className="relative size-72 rounded-full border-[18px] border-primary/10">
              <div className="absolute inset-4 rounded-full border-[18px] border-b-accent border-l-primary/20 border-r-secondary border-t-primary" />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div><div className="text-6xl font-display font-bold gradient-text">82</div><div className="mt-1 text-xs uppercase tracking-widest text-foreground/50">Great</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="mt-32 px-4 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {["Clinical workflow", "Personal dashboard", "Admin console"].map((title) => (
            <div key={title} className="glass-card rounded-2xl p-6">
              <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-accent" />)}</div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-foreground/60">Designed to make HealthGuard data easier to scan, understand, and act on.</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-24 px-4 pb-12 text-sm text-foreground/60 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Stethoscope className="size-4 text-primary" /> 2026 HealthGuard. Not a substitute for medical advice.</div>
          <div className="flex gap-5"><span>Privacy</span><span>Terms</span><span>Security</span></div>
        </div>
      </footer>
    </div>
  );
}
