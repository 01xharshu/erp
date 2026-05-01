"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Users, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockTransportData = [
  { id: "BUS-01", route: "City Center - Campus", driver: "Ramesh Kumar", capacity: 40, registered: 38, status: "Active" },
  { id: "BUS-02", route: "South Zone - Campus", driver: "Suresh Singh", capacity: 40, registered: 42, status: "Overbooked" },
  { id: "BUS-03", route: "North Hills - Campus", driver: "Mohan Das", capacity: 30, registered: 15, status: "Active" },
];

export default function AdminBusPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transport Registration</h1>
          <p className="text-muted-foreground">Manage bus routes, capacity, and student registrations</p>
        </div>
        <Button className="gap-2"><Bus className="h-4 w-4" /> Add New Route</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">95</div>
            <p className="text-sm text-muted-foreground mt-1">Across 3 active routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">110</div>
            <p className="text-sm text-muted-foreground mt-1">Total seats available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="h-8 w-8" /> 1 Route
            </div>
            <p className="text-sm text-muted-foreground mt-1">Operating over capacity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Bus Routes</CardTitle>
          <CardDescription>Monitor seat availability and driver assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input placeholder="Search route or bus ID..." className="max-w-md rounded-xl" />
          </div>
          
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus ID</TableHead>
                  <TableHead>Route Details</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransportData.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg"><Bus className="h-4 w-4" /></div>
                        {bus.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground"/> {bus.route}</span>
                    </TableCell>
                    <TableCell>{bus.driver}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className={bus.registered > bus.capacity ? "text-destructive font-bold" : ""}>
                          {bus.registered} / {bus.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bus.status === "Active" ? (
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Active</Badge>
                      ) : (
                        <Badge variant="destructive">{bus.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
