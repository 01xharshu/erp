import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const featureCards = [
  {
    title: "Student Hub",
    description: "Attendance, assignments, fees, and results in one dashboard.",
    icon: BookOpenCheck,
  },
  {
    title: "Faculty Workspace",
    description: "Manage classes, learners, and academic workflows efficiently.",
    icon: Users,
  },
  {
    title: "Admin Control",
    description: "Create users, manage records, and control system access.",
    icon: ShieldCheck,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-foreground">
            <div className="rounded-lg bg-primary/10 p-2">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">College ERP Portal</p>
              <p className="text-xs text-muted-foreground">Unified campus operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/demo">Demo</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Role-based ERP for students, faculty, and admins
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                One portal for academics, administration, and campus life
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Log in using your email or unique ID to access the right dashboard for your role.
                Students, faculty, and admins each get dedicated workflows.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/login">
                    Start Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/admin/dashboard">Admin Area</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-foreground">Quick Sign-in IDs</p>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                  <p className="font-medium text-foreground">Admin</p>
                  <p className="text-muted-foreground">ADMIN001 or admin@college.ac.in</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                  <p className="font-medium text-foreground">Faculty</p>
                  <p className="text-muted-foreground">FAC001, FAC002, FAC003 or faculty email</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                  <p className="font-medium text-foreground">Students</p>
                  <p className="text-muted-foreground">EN2024001 to EN2024005 or student email</p>
                </div>
                <p className="pt-1 text-xs text-muted-foreground">Seed password: `password123` (admin: `admin123`)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm transition-colors hover:bg-card"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mb-1 text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
