"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockTimetable } from "@/lib/mockData";
import { Printer, LayoutGrid, Download } from "lucide-react";
import html2canvas from "html2canvas";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimetablePage() {
  const [activeDay, setActiveDay] = useState("Monday");
  const tableRef = useRef<HTMLTableElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Export table as high-resolution PNG
  const handleExportImage = async () => {
    if (!tableRef.current) return;

    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 3,               // Higher resolution (3x for crisp export)
        useCORS: true,
        backgroundColor: "#ffffff",  // Force white background
        logging: false,
        width: tableRef.current.offsetWidth,
        height: tableRef.current.offsetHeight,
        windowWidth: tableRef.current.scrollWidth,
        windowHeight: tableRef.current.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `timetable-full-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // 1.0 = highest quality
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-amber-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">
            Weekly class schedule and sessions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="no-print w-full sm:w-auto gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Timetable
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <LayoutGrid className="h-4 w-4" />
                Tabular View
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-7xl w-[95vw] h-[92vh] overflow-hidden rounded-xl border-border/70 bg-card/95 p-0 backdrop-blur-xl md:rounded-2xl">
              {/* Sticky header */}
              <DialogHeader className="sticky top-0 z-30 border-b border-border/70 bg-card/92 px-5 py-4 shadow-sm md:px-8 md:py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <DialogTitle className="text-xl md:text-2xl font-semibold">
                    Full Weekly Timetable
                  </DialogTitle>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="no-print gap-1.5 text-sm"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportImage}
                      className="gap-1.5 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Export PNG
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-auto bg-background/45 px-4 py-5 md:px-8 md:py-6">
                <div className="min-w-[850px] md:min-w-[1100px]">
                  <table
                    ref={tableRef}
                    className="w-full border-collapse text-sm"
                  >
                    <thead className="sticky top-0 z-20 bg-card/95 shadow-sm backdrop-blur">
                      <tr className="border-b">
                        <th className="sticky left-0 z-30 min-w-[110px] bg-card/95 p-3 text-left font-semibold md:min-w-[140px] md:p-4">
                          Period / Time
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="p-3 md:p-4 text-left font-semibold min-w-[160px] md:min-w-[220px]"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {[1, 2, 3, 4].map((period) => (
                        <tr
                          key={period}
                          className="border-b transition-colors hover:bg-muted/45"
                        >
                          <td className="sticky left-0 z-10 border-r bg-background/90 p-3 font-medium text-muted-foreground md:p-4">
                            Period {period}
                            <div className="text-xs mt-1 opacity-80">
                              09:00 – 10:00
                            </div>
                          </td>

                          {days.map((day) => {
                            const slot = mockTimetable.find(
                              (s) => s.day === day && s.period === period
                            );
                            return (
                              <td
                                key={`${day}-${period}`}
                                className="align-top border-l border-border/40 bg-transparent p-3 md:p-4"
                              >
                                {slot ? (
                                  <div className="space-y-2 min-h-[80px] flex flex-col justify-center">
                                    <p className="font-semibold text-primary leading-tight text-base">
                                      {slot.subject}
                                    </p>
                                    <div className="text-xs space-y-0.5 text-muted-foreground">
                                      <p>Time: {slot.time}</p>
                                      <p>Room: {slot.room}</p>
                                      <p>Teacher: {slot.teacher}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-xs text-muted-foreground/70 py-8">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/70 bg-card/92 px-5 py-3 text-center text-xs text-muted-foreground md:px-8 md:py-4 md:text-left">
                Timetable is subject to change • Last updated: {new Date().toLocaleDateString()}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Day tabs */}
      <Tabs value={activeDay} onValueChange={setActiveDay} className="space-y-6">
        <TabsList>
          {days.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => {
          const slotsForDay = mockTimetable.filter((slot) => slot.day === day);

          return (
            <TabsContent key={day} value={day} className="mt-6 space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-xl">
                    {day}
                    <Badge variant="outline">{slotsForDay.length} classes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {slotsForDay.length > 0 ? (
                    slotsForDay
                      .sort((a, b) => a.period - b.period)
                      .map((slot) => (
                        <Card
                          key={`${slot.period}-${day}`}
                          className="border border-border/50 transition-colors hover:border-primary/50"
                        >
                          <CardContent className="space-y-3 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-primary">{slot.subject}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Period {slot.period} • {slot.time}
                                </p>
                              </div>
                              <Badge variant="secondary" className="px-3 py-1 text-sm">
                                Room {slot.room}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Teacher: <span className="font-medium text-foreground">{slot.teacher}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="py-16 text-center text-lg text-muted-foreground">
                      No classes scheduled for {day}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Notes */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>• Tap tabs to switch days</p>
          <p>• Use &quot;Tabular View&quot; for full weekly grid (pinch to zoom, export PNG)</p>
          <p>• Timetable may change — check regularly</p>
        </CardContent>
      </Card>
    </div>
  );
}
