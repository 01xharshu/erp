"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockNotices } from "@/lib/mockData";
import { Calendar, MapPin, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </h2>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            View Calendar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="p-0 border-none">
              <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/20 via-ring/10 to-transparent">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-primary/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/20 backdrop-blur-md border-white/20 text-foreground saturate-[1.2]">
                    {event.type}
                  </Badge>
                </div>
              </div>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold leading-tight hover:text-primary transition-colors cursor-pointer tracking-tight">
                      {event.title}
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                        <div className="p-1 rounded-md bg-primary/10 text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                        <div className="p-1 rounded-md bg-secondary/80 text-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        {event.venue}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-foreground border-white/20 backdrop-blur-sm" variant="outline">
                    Register Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* College Notices */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mt-8 flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          Official Announcements
        </h2>
        <div className="grid gap-4">
          {mockNotices.map((notice) => (
            <Card key={notice.id} className="p-0 group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className={`w-1.5 shrink-0 ${
                    notice.priority === "High" 
                      ? "bg-gradient-to-b from-destructive to-destructive/60" 
                      : "bg-gradient-to-b from-primary to-primary/60"
                  }`} />
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={notice.priority === "High" ? "destructive" : "secondary"}
                          className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold"
                        >
                          {notice.priority}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
                          Posted on {notice.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{notice.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground/90 font-medium">
                        {notice.content}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
