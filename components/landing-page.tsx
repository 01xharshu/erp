"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Briefcase,
  Shield,
  GraduationCap,
  BarChart3,
  Users,
  CheckCircle,
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Student Portal",
      description: "Access grades, assignments, attendance and more",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Faculty Management",
      description: "Manage courses, grades, and student feedback",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Admin Dashboard",
      description: "Complete institutional control and analytics",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "Real-time insights and performance metrics",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration",
      description: "Seamless communication across all users",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Attendance Tracking",
      description: "Automated and integrated attendance system",
    },
  ];

  const modes = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Student",
      description: "View your dashboard, grades, attendance, and more",
      href: "/demo?mode=student",
      color: "from-blue-500/20 to-blue-600/20 border-blue-500/50",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Faculty",
      description: "Manage courses, grades, and student interactions",
      href: "/demo?mode=faculty",
      color: "from-amber-500/20 to-amber-600/20 border-amber-500/50",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Admin",
      description: "Full system control and analytics",
      href: "/demo?mode=admin",
      color: "from-purple-500/20 to-purple-600/20 border-purple-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-lg">College ERP</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <CheckCircle className="w-4 h-4" />
              Explore the complete platform
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-balance">
            Unified College
            <span className="block text-primary">Management System</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A comprehensive platform designed for students, faculty, and administrators. 
            Streamline operations, enhance collaboration, and drive academic excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started
              </Button>
            </Link>
            <Link href="/demo?mode=student">
              <Button variant="outline" size="lg" className="gap-2">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Explore by Role</h3>
          <p className="text-muted-foreground">
            See what each role can accomplish with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <Link key={mode.title} href={mode.href}>
              <Card className={`p-8 border-2 bg-gradient-to-br ${mode.color} hover:shadow-lg transition-shadow cursor-pointer h-full`}>
                <div className="space-y-4">
                  <div className="text-primary">{mode.icon}</div>
                  <h4 className="font-bold text-lg">{mode.title}</h4>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                  <div className="pt-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      Explore
                      <span>→</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
          <p className="text-muted-foreground">
            Everything you need to manage an educational institution
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 border-border/40 hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="text-primary">{feature.icon}</div>
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            College ERP System © 2024. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
