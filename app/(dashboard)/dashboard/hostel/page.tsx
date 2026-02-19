"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HostelPage() {
  const hostelData = {
    allocated: true,
    roomNo: "A-301",
    block: "Block A",
    floor: "3rd Floor",
    bed: "Bed 1",
    roommates: [
      { name: "Rohan Singh", enrollmentNo: "EN2024002" },
      { name: "Priya Sharma", enrollmentNo: "EN2024003" },
    ],
    messStatus: "Active",
    messCharge: "₹3,000/month",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Hostel Management</h1>
        <p className="text-muted-foreground">
          Hostel room allocation and mess management
        </p>
      </div>

      {hostelData.allocated ? (
        <>
          {/* Room Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Room Number</p>
                  <p className="font-bold text-lg">{hostelData.roomNo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {hostelData.block}, {hostelData.floor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bed Number</p>
                  <p className="font-medium">{hostelData.bed}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mess Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge>{hostelData.messStatus}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Charge</p>
                  <p className="font-medium">{hostelData.messCharge}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roommates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roommates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hostelData.roommates.map((mate) => (
                  <div key={mate.enrollmentNo} className="flex items-center justify-between pb-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{mate.name}</p>
                      <p className="text-xs text-muted-foreground">{mate.enrollmentNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No hostel allocation yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
