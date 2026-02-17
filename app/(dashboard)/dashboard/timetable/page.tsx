"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTimetable } from "@/lib/mockData";
import { Printer, ExternalLink } from "lucide-react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const daySlots = mockTimetable.filter((slot) => slot.day === selectedDay);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">
            Weekly class schedule and sessions
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="no-print">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block overflow-x-auto">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="p-3 text-left font-semibold text-sm">Period</th>
                  {days.map((day) => (
                    <th key={day} className="p-3 text-left font-semibold text-sm">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((period) => (
                  <tr key={period} className="border-b">
                    <td className="p-3 font-medium text-sm">Period {period}</td>
                    {days.map((day) => {
                      const slot = mockTimetable.find(
                        (s) => s.day === day && s.period === period
                      );
                      return (
                        <td
                          key={`${day}-${period}`}
                          className="p-3 text-sm"
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <p className="font-medium text-primary">
                                {slot.subject}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {slot.time}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Room: {slot.room}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {slot.teacher}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Day</label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {daySlots.length > 0 ? (
            daySlots.map((slot) => (
              <Card key={slot.joinLink} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{slot.subject}</CardTitle>
                      <CardDescription>{slot.time}</CardDescription>
                    </div>
                    <Badge>Period {slot.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Room</p>
                    <p className="font-medium">{slot.room}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Teacher</p>
                    <p className="font-medium">{slot.teacher}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full mt-2"
                  >
                    <a href={slot.joinLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Online Class
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No classes scheduled for this day</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Times are subject to changes. Check the portal regularly.</p>
          <p>• Online classes have a join link available.</p>
          <p>• Room numbers indicate physical class locations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
