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
import { Send, TicketIcon } from "lucide-react";

export default function GrievancePage() {
  const [formData, setFormData] = useState({
    category: "",
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

    if (!formData.category || !formData.description) {
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
    };

    setSubmissions([newTicket, ...submissions]);
    setFormData({ category: "", description: "", anonymous: false });

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

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Grievance</CardTitle>
          <CardDescription>
            Your concerns will be reviewed and addressed promptly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your grievance in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    anonymous: checked as boolean,
                  })
                }
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Submit anonymously
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Grievance"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Submission History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Submissions</h2>
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TicketIcon className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {submission.id}
                        </span>
                      </div>
                      <h3 className="font-semibold">{submission.category}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {submission.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {submission.date}
                      </p>
                    </div>
                    <Badge
                      variant={
                        submission.status === "Resolved"
                          ? "secondary"
                          : submission.status === "In Progress"
                            ? "outline"
                            : "default"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No submissions yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Grievances will be acknowledged within 24 hours</p>
          <p>• Resolution time depends on the nature of the complaint</p>
          <p>• For urgent matters, contact the Dean of Students directly</p>
          <p>• All submissions are treated confidentially</p>
        </CardContent>
      </Card>
    </div>
  );
}
