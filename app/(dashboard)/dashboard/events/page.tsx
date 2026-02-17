"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockNotices } from "@/lib/mockData";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Annual Fest 2024",
      date: "2024-12-20",
      venue: "Main Campus Ground",
      type: "Festival",
    },
    {
      id: 2,
      title: "Technical Seminar - AI & ML",
      date: "2024-12-15",
      venue: "Auditorium A",
      type: "Seminar",
    },
    {
      id: 3,
      title: "Sports Day",
      date: "2024-12-25",
      venue: "Sports Complex",
      type: "Sports",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Events & Notices</h1>
        <p className="text-muted-foreground">
          Stay updated with college events and announcements
        </p>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} • {event.venue}
                    </p>
                    <Badge variant="outline" className="mt-2">{event.type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Notices */}
      <div>
        <h2 className="text-lg font-semibold mb-4">College Notices</h2>
        <div className="space-y-3">
          {mockNotices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notice.date}
                    </p>
                    <p className="text-sm mt-2">{notice.content}</p>
                  </div>
                  <Badge
                    variant={notice.priority === "High" ? "destructive" : "secondary"}
                  >
                    {notice.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
