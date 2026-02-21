"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Database,
  ExternalLink,
  GraduationCap,
  Library,
  LockKeyhole,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Bot,
  Layers,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { NucleusArchitecture } from "@/components/nucleus-architecture";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });

type RoleKey = "student" | "faculty" | "admin";

interface RolePreview {
  label: string;
  headline: string;
  summary: string;
  loginHint: string;
  password: string;
  modules: Array<{ name: string; icon: LucideIcon }>;
  kpis: Array<{ label: string; value: string }>;
}

const rolePreviewMap: Record<RoleKey, RolePreview> = {
  student: {
    label: "Student",
    headline: "Track classes, attendance, dues, and results from one focused workspace.",
    summary: "Built for daily student rhythm with quick actions, alerts, and clear academic visibility.",
    loginHint: "EN2024001 to EN2024005 or student email",
    password: "password123",
    modules: [
      { name: "Subjects", icon: BookOpen },
      { name: "Timetable", icon: CalendarDays },
      { name: "Attendance", icon: ShieldCheck },
      { name: "Fees", icon: CreditCard },
    ],
    kpis: [
      { label: "Daily View", value: "Real-time" },
      { label: "Assignment Flow", value: "Structured" },
      { label: "Fee Status", value: "Live" },
    ],
  },
  faculty: {
    label: "Faculty",
    headline: "Operate classes, attendance, and student context with minimal friction.",
    summary: "A faster academic control surface for lectures, logs, and operational updates.",
    loginHint: "FAC001, FAC002, FAC003 or faculty email",
    password: "password123",
    modules: [
      { name: "Schedule", icon: CalendarDays },
      { name: "Attendance", icon: ShieldCheck },
      { name: "Students", icon: Users },
      { name: "Assignments", icon: Sparkles },
    ],
    kpis: [
      { label: "Attendance Marking", value: "Fast" },
      { label: "Class Planning", value: "Daily" },
      { label: "Academic Signals", value: "Actionable" },
    ],
  },
  admin: {
    label: "Admin",
    headline: "Manage users, fees, and institution workflows from one command center.",
    summary: "Everything required to run operations, governance, and accountability across roles.",
    loginHint: "ADMIN001 / admin@college.ac.in",
    password: "admin123",
    modules: [
      { name: "Students", icon: Users },
      { name: "Faculty", icon: UserCog },
      { name: "Fees", icon: CreditCard },
      { name: "Operations", icon: Layers },
    ],
    kpis: [
      { label: "User Lifecycle", value: "Managed" },
      { label: "Fee Visibility", value: "Consolidated" },
      { label: "System Health", value: "Continuous" },
    ],
  },
};

const heroStats = [
  { label: "Core Modules", value: "10+" },
  { label: "Role Dashboards", value: "3" },
  { label: "Access Mode", value: "24x7" },
];

const moduleRail = [
  { name: "Subjects", icon: BookOpen },
  { name: "Timetable", icon: CalendarDays },
  { name: "Attendance", icon: ShieldCheck },
  { name: "Assignments", icon: Sparkles },
  { name: "Fees", icon: CreditCard },
  { name: "Library", icon: Library },
  { name: "Events", icon: Megaphone },
  { name: "AI Assistant", icon: Bot },
  { name: "Workflow", icon: Workflow },
];

const onboardingFlow = [
  {
    step: "01",
    title: "Seed & Login",
    description: "Initialize sample data and login using email or unique role ID.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Role Allocation",
    description: "Admins create and manage faculty/student users with controlled permissions.",
    icon: UserCog,
  },
  {
    step: "03",
    title: "Daily Operations",
    description: "Run attendance, timetable, assignments, and fee workflows in role dashboards.",
    icon: Workflow,
  },
  {
    step: "04",
    title: "Visibility & Support",
    description: "Use analytics + in-app assistant for day-to-day questions and status checks.",
    icon: Bot,
  },
];

const trustPillars = [
  {
    title: "Role-Based Access",
    description: "Each role sees only relevant data and actions for safer day-to-day operations.",
    icon: LockKeyhole,
  },
  {
    title: "Structured Data Layer",
    description: "Attendance, timetable, fees, and user records are persisted for predictable workflows.",
    icon: Database,
  },
  {
    title: "Operational Reliability",
    description: "Clear dashboard states, payment tracking, and status modules keep execution consistent.",
    icon: BadgeCheck,
  },
];

const faqs = [
  {
    question: "Can users login with both email and ID?",
    answer:
      "Yes. Login supports email or unique role ID (student enrollment number, faculty ID, or admin ID) with password verification.",
  },
  {
    question: "Can admin create new faculty and students?",
    answer:
      "Yes. Admin dashboards include user creation and management flows for faculty and students with role-specific access.",
  },
  {
    question: "Does fee payment update the ledger automatically?",
    answer:
      "Yes. The Razorpay-style demo checkout updates fee records and immediately reflects changes in dashboard summaries.",
  },
  {
    question: "Is chatbot access restricted to database context?",
    answer:
      "Yes. Assistant responses are generated from app data collections such as timetable, attendance, student records, and fees.",
  },
];

const creators = [
  {
    name: "Harsh",
    fullName: "Harsh Mishra",
    role: "Team lead",
    imageUrl: "https://pbs.twimg.com/profile_images/2016517780863102976/m-zQIYYI_400x400.jpg",
    href: "https://github.com/01xharshu",
  },
  {
    name: "Divyansh",
    fullName: "Divyansh Srivastav",
    role: "Member",
    imageUrl: "https://pbs.twimg.com/profile_images/1823346928597282817/rTfLHc2x_400x400.jpg",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const roleButtonClass = (role: RoleKey, activeRole: RoleKey): string => {
  const active = role === activeRole;
  if (!active) {
    return "text-muted-foreground hover:bg-muted/70 hover:text-foreground";
  }
  if (role === "student") return "bg-emerald-600 text-white shadow-sm";
  if (role === "faculty") return "bg-sky-600 text-white shadow-sm";
  return "bg-amber-600 text-white shadow-sm";
};

function CreatorTag({
  name,
  fullName,
  role,
  imageUrl,
  href,
}: {
  name: string;
  fullName: string;
  role: string;
  imageUrl: string;
  href?: string;
}) {
  const triggerClass =
    "inline-flex cursor-pointer items-center rounded-md px-1.5 py-0.5 font-semibold text-foreground underline-offset-4 transition hover:text-emerald-700 hover:underline dark:hover:text-emerald-300";

  return (
    <span className="group relative inline-flex items-center">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={triggerClass}>
          {name}
        </a>
      ) : (
        <span className={triggerClass} tabIndex={0}>
          {name}
        </span>
      )}

      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-[min(90vw,18rem)] -translate-x-1/2 translate-y-1 scale-95 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
        <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.55),rgba(14,165,233,0.52),rgba(245,158,11,0.45))] p-[1px] shadow-[0_28px_60px_-28px_rgba(2,6,23,0.8)]">
          <div className="relative overflow-hidden rounded-[15px] border border-white/50 bg-background/90 px-3 py-3 backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/85">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-sky-400/20 blur-2xl" />

            <div className="relative flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/45 via-sky-500/40 to-amber-400/45 p-[1.5px]">
                <div
                  className="h-full w-full rounded-[10px] border border-white/40 bg-cover bg-center"
                  style={{ backgroundImage: `url('${imageUrl}')` }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight">{fullName}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
                <span className="mt-1.5 inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  VERIFIED PROFILE
                </span>
              </div>
            </div>

            <div className="relative mt-3 flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-2.5 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {role} · {name}
              </span>
              {href ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">Team Member</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </span>
  );
}

export function LandingPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>("student");
  const [spotlight, setSpotlight] = useState({ x: 50, y: 45 });

  const activePreview = useMemo(() => rolePreviewMap[activeRole], [activeRole]);

  return (
    <div className={cn("relative min-h-screen overflow-hidden", spaceGrotesk.className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.20),transparent_38%),radial-gradient(circle_at_86%_14%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_40%_88%,rgba(245,158,11,0.20),transparent_36%),linear-gradient(180deg,#f7fafc_0%,#f8faf5_45%,#fbf7ef_100%)] dark:bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.22),transparent_38%),radial-gradient(circle_at_86%_14%,rgba(14,165,233,0.22),transparent_35%),radial-gradient(circle_at_40%_88%,rgba(245,158,11,0.2),transparent_36%),linear-gradient(180deg,#05080d_0%,#080d12_55%,#0f0e0a_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.09)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-2 text-emerald-700 dark:text-emerald-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{BRAND.name}</p>
              <p className="text-xs text-muted-foreground">{BRAND.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="outline">
              <Link href="/demo">Demo</Link>
            </Button>
            <Button asChild size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
              <Link href="/login">
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-16">
          <motion.div initial="hidden" animate="show" variants={reveal} transition={{ duration: 0.45 }} className="space-y-6">
            <Badge className="w-fit border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" variant="secondary">
              Next-generation campus platform
            </Badge>

            <h1 className={cn("text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl", dmSerif.className)}>
              Designed like a modern product,
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-amber-600 bg-clip-text text-transparent">
                built for real college operations.
              </span>
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Replace scattered workflows with one elegant system for student lifecycle, faculty operations, fee tracking,
              and institution governance.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                <Link href="/login">
                  Launch Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/demo">See Live Demo</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {heroStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08, duration: 0.3 }}
                >
                  <Card className="border-border/70 bg-background/65 shadow-sm backdrop-blur">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold">{item.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={reveal} transition={{ duration: 0.45, delay: 0.12 }}>
            <Card
              className="group relative overflow-hidden border-border/75 bg-background/75 shadow-xl backdrop-blur-xl"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setSpotlight({ x, y });
              }}
              onMouseLeave={() => setSpotlight({ x: 50, y: 45 })}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70 transition duration-500"
                style={{
                  background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(16,185,129,0.26), rgba(14,165,233,0.15) 24%, transparent 58%)`,
                }}
              />

              <CardHeader className="relative border-b border-border/60 pb-4">
                <CardTitle className="text-lg">Interactive Role Studio</CardTitle>
                <CardDescription>Switch personas to preview experience and credentials.</CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4 p-5">
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-muted/30 p-1">
                  {(["student", "faculty", "admin"] as RoleKey[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setActiveRole(role)}
                      className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition", roleButtonClass(role, activeRole))}
                    >
                      {rolePreviewMap[role].label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{activePreview.headline}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{activePreview.summary}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {activePreview.kpis.map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border border-border/70 bg-background/80 p-3">
                          <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                          <p className="mt-1 text-sm font-semibold">{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Login Preview</p>
                      <p className="mt-2 text-sm">{activePreview.loginHint}</p>
                      <p className="text-sm">
                        Password: <span className="font-semibold">{activePreview.password}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activePreview.modules.map((module) => {
                        const Icon = module.icon;
                        return (
                          <span
                            key={module.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-xs"
                          >
                            <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            {module.name}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
          >
            <NucleusArchitecture className="w-full" />
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
            className="mb-5"
          >
            <h2 className={cn("text-3xl tracking-tight", dmSerif.className)}>Product-Level Visual Experience</h2>
            <p className="text-sm text-muted-foreground">Not a template. A focused interface designed for execution.</p>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.04 }}
            >
              <Card className="overflow-hidden border-border/70 bg-background/70">
                <CardHeader>
                  <CardTitle>Module Ecosystem</CardTitle>
                  <CardDescription>Continuous workflow from academics to administration.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30 p-3">
                    <motion.div
                      className="flex w-max gap-2"
                      animate={{ x: [0, -520] }}
                      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                      {[...moduleRail, ...moduleRail].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={`${item.name}-${index}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium"
                          >
                            <Icon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                            {item.name}
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="grid gap-4"
            >
              {[
                "Email or Unique ID based authentication",
                "Admin-managed user provisioning",
                "Razorpay-style fee payment demo flow",
                "Role-aware AI assistant on dashboards",
              ].map((feature) => (
                <Card key={feature} className="border-border/70 bg-background/75">
                  <CardContent className="flex items-start gap-3 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm">{feature}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
            className="mb-5"
          >
            <h2 className={cn("text-3xl tracking-tight", dmSerif.className)}>How {BRAND.name} Runs In Practice</h2>
            <p className="text-sm text-muted-foreground">A practical rollout flow for teams, not just a UI showcase.</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {onboardingFlow.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full border-border/70 bg-background/75">
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wide text-muted-foreground">Step {item.step}</span>
                        <span className="rounded-lg border border-border/70 bg-background/80 p-2">
                          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full border-border/70 bg-background/75">
                <CardHeader>
                  <CardTitle>Trust, Security & Governance</CardTitle>
                  <CardDescription>
                    Designed for institutional workflows where data boundaries and role controls matter.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trustPillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div key={pillar.title} className="rounded-xl border border-border/70 bg-muted/30 p-3">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          {pillar.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: 0.04 }}
            >
              <Card className="h-full border-border/70 bg-background/75">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Key product behavior and setup details most teams ask first.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={faq.question} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-amber-500/10">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">Ready to run {BRAND.name} like a modern SaaS product?</p>
                  <p className="text-sm text-muted-foreground">Use seeded credentials and start from live modules immediately.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                    <Link href="/login">
                      Open Login
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/demo">Open Demo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-center text-sm text-muted-foreground">
            Made by{" "}
            <CreatorTag
              name={creators[0].name}
              fullName={creators[0].fullName}
              role={creators[0].role}
              imageUrl={creators[0].imageUrl}
              href={creators[0].href}
            />{" "}
            and{" "}
            <CreatorTag
              name={creators[1].name}
              fullName={creators[1].fullName}
              role={creators[1].role}
              imageUrl={creators[1].imageUrl}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
