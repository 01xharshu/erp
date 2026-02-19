"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  GraduationCap,
  Briefcase,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Lock,
  Sparkles,
  Quote,
  BookOpen,
  Calendar,
  FileText,
  Calculator,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: GraduationCap, title: "Student Dashboard", desc: "Grades, attendance, assignments, timetable, fee status" },
  { icon: Briefcase, title: "Faculty Tools", desc: "Grade entry, attendance, feedback, reports" },
  { icon: Shield, title: "Admin Panel", desc: "User management, analytics, security & oversight" },
  { icon: BarChart3, title: "Analytics Engine", desc: "Real-time dashboards & predictive insights" },
  { icon: Users, title: "Communication Hub", desc: "Notices, messaging, grievance & events" },
  { icon: CheckCircle, title: "Automation", desc: "Fees, library, hostel & exam workflows" },
  { icon: BookOpen, title: "Course Management", desc: "Syllabus, resources & lesson planning" },
  { icon: Calendar, title: "Smart Scheduling", desc: "Timetable generation & conflict detection" },
];

const modes = [
  { icon: GraduationCap, title: "Student", desc: "Your academic life simplified", href: "/demo?mode=student", color: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/30 hover:border-blue-500/60" },
  { icon: Briefcase, title: "Faculty", desc: "Teach & evaluate effortlessly", href: "/demo?mode=faculty", color: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/30 hover:border-amber-500/60" },
  { icon: Shield, title: "Admin", desc: "Full institutional control", href: "/demo?mode=admin", color: "from-purple-500/10 to-violet-500/10", border: "border-purple-500/30 hover:border-purple-500/60" },
];

const testimonials = [
  { name: "Dr. Anjali Sharma", role: "Principal", quote: "Transformed our entire campus operations.", avatar: "/avatars/1.jpg" },
  { name: "Rahul Verma", role: "Final Year Student", quote: "One app for everything — love it!", avatar: "/avatars/2.jpg" },
  { name: "Prof. Vikram Singh", role: "HOD Mathematics", quote: "Grading & feedback became effortless.", avatar: "/avatars/3.jpg" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 dark:from-background dark:via-background dark:to-secondary/10 overflow-x-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20 dark:opacity-10"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95 dark:from-background/95 dark:via-background/85 dark:to-background/95" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 dark:bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">College ERP</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
          >
            <Lock className="w-4 h-4" />
            Secure • Modern • Complete
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            The Modern ERP for{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Educational Excellence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            One platform for students, faculty, and administrators — built for transparency, efficiency, and growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link href="/login">
              <Button size="xl" className="gap-2 text-lg px-10 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="xl" className="text-lg px-10">
                Live Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-border/40 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center items-center gap-12 text-muted-foreground text-sm">
          <div>Trusted by 50+ Institutions</div>
          <div>10,000+ Active Users</div>
          <div>99.9% Uptime</div>
          <div>24/7 Support</div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Everything you need to run a modern educational institution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-8 hover:shadow-xl transition-shadow border-border/40">
                  <f.icon className="w-12 h-12 text-primary mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                  <p className="text-muted-foreground">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 md:py-32 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Tailored for Every Role</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {modes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={mode.href}>
                  <Card className={`p-8 h-full border-2 ${mode.border} bg-gradient-to-br ${mode.color} hover:shadow-2xl transition-all rounded-2xl`}>
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-2xl bg-background/80 flex items-center justify-center text-primary border border-primary/20">
                        {mode.icon}
                      </div>
                      <h3 className="text-3xl font-bold">{mode.title}</h3>
                      <p className="text-lg text-muted-foreground">{mode.description}</p>
                      <Button variant="ghost" className="gap-2 text-primary">
                        Explore <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full">
                  <Quote className="w-10 h-10 text-primary/30 mb-6" />
                  <p className="text-lg italic mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-32 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground mt-4">Simple pricing for every institution size</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "₹4,999", desc: "Small colleges & schools", popular: false },
              { name: "Professional", price: "₹12,999", desc: "Medium institutions", popular: true },
              { name: "Enterprise", price: "Custom", desc: "Large universities", popular: false },
            ].map((plan, i) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "scale-105 shadow-2xl border-primary" : "border-border/40"} rounded-2xl overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pt-12 pb-8 text-center">
                  <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                  <p className="text-5xl font-extrabold mt-4">{plan.price}</p>
                  <p className="text-muted-foreground mt-2">{plan.desc}</p>
                </CardHeader>
                <CardContent className="pb-10 px-8">
                  <Button className="w-full py-7 text-lg" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-primary/5 to-background border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-bold">Ready to Transform Your Institution?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of colleges already using College ERP.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="2xl" className="text-xl px-12 py-8 gap-3">
              Start Free Trial <ArrowRight className="w-6 h-6" />
            </Button>
            <Button variant="outline" size="2xl" className="text-xl px-12 py-8">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} College ERP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}