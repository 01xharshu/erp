"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, TicketIcon, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GrievancePage() {
  const [formData, setFormData] = useState({
    category: "",
    title: "",           // ← Added for Input usage
    description: "",
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([
    {
      id: "GRV001",
      category: "Academics",
      date: "2024-12-10",
      status: "Resolved",
      description: "Grade discrepancy in assignment",
    },
    {
      id: "GRV002",
      category: "Hostel",
      date: "2024-12-08",
      status: "In Progress",
      description: "Room maintenance issue",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.title.trim() || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTicket = {
      id: `GRV${String(submissions.length + 1).padStart(3, "0")}`,
      category: formData.category,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      description: formData.description,
      title: formData.title,  // ← Now used in new submission
    };

    setSubmissions([newTicket, ...submissions]);
    setFormData({ category: "", title: "", description: "", anonymous: false });

    toast.success("Grievance submitted successfully! Ticket ID: " + newTicket.id);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Grievance / Feedback</h1>
        <p className="text-muted-foreground">
          Submit complaints or feedback anonymously to the administration
        </p>
      </div>

      {/* Submission Form & Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0 border-none shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Send className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Submit New Grievance</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-muted-foreground/80">
                Your concerns are handled with strict confidentiality and priority.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-primary/80 ml-1">Category</Label>
                    <Select
                      value={formData.category || undefined}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/30 focus:border-primary/40 backdrop-blur-sm transition-all hover:bg-white/10">
                        <SelectValue placeholder="Select type of issue" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-card/95 backdrop-blur-xl">
                        <SelectItem value="Academics">Academics</SelectItem>
                        <SelectItem value="Hostel">Hostel</SelectItem>
                        <SelectItem value="Fees">Fees / Payments</SelectItem>
                        <SelectItem value="Facilities">Facilities</SelectItem>
                        <SelectItem value="Harassment">Harassment / Bullying</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-primary/80 ml-1">Subject</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Room leakage in Block C"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/30 focus:border-primary/40 backdrop-blur-sm transition-all hover:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-primary/80 ml-1">Details</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide specific details to help us resolve the issue faster..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[160px] bg-white/5 border-white/10 rounded-2xl focus:ring-primary/30 focus:border-primary/40 backdrop-blur-sm transition-all hover:bg-white/10 p-4 resize-none"
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
                  <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}>
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymous}
                      onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked as boolean })}
                      className="rounded-md border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      Submit this report anonymously
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto min-w-[180px] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Bot className="h-16 w-16 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                <Bot className="h-4 w-4" />
                Resolution Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground/90 space-y-4 font-medium relative z-10">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
                <p>Grievances are officially acknowledged within <span className="text-foreground font-bold italic">24 hours</span>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
                <p>Resolution time varies based on complexity and <span className="text-foreground font-bold italic">severity</span>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
                <p>All submissions are handled with <span className="text-foreground font-bold italic">maximum confidentiality</span>.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5 shadow-none group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 uppercase tracking-widest leading-none">
                <TicketIcon className="h-4 w-4" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground font-medium space-y-2">
              <p>For urgent matters like safety or harassment, please call the 24/7 helpline immediately.</p>
              <p className="text-amber-700 font-bold text-sm tracking-tight">+91 1800-COLLEGE-ERP</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Submissions</h2>
          <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-xs bg-white/5 border-white/10 uppercase tracking-wider">
            {submissions.length} Total
          </Badge>
        </div>
        
        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-0 border-white/10 group hover:-translate-y-1 transition-all">
                <CardContent className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
                          <TicketIcon className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-muted-foreground tracking-widest">#{submission.id}</span>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                          submission.status === "Resolved" 
                            ? "bg-green-500/10 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.15)]" 
                            : submission.status === "In Progress"
                              ? "bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                              : "bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        )}
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{submission.category}</h3>
                      <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2 font-medium leading-relaxed">
                        {submission.description}
                      </p>
                    </div>
                    
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                        {submission.date}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest text-primary/70 hover:text-primary hover:bg-primary/5">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-white/10 bg-transparent">
            <CardContent className="py-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                <TicketIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No grievances submitted yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}