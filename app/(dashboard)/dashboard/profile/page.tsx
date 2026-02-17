"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStudentData } from "@/lib/auth";
import { mockStudent } from "@/lib/mockData";
import { Edit2, Download, FileText, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    const data = getStudentData();
    setStudentData(data || mockStudent);
    setEditData(data || mockStudent);
  }, []);

  if (!studentData) return null;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.success("Profile updated successfully!");
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleDownloadDocument = (docType: string) => {
    toast.success(`Downloading ${docType}...`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "default"}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={studentData.photoURL} />
              <AvatarFallback className="text-lg">
                {studentData.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{studentData.name}</h2>
              <p className="text-muted-foreground mt-1">{studentData.program}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{studentData.department}</Badge>
                <Badge variant="outline">
                  Year {studentData.year}, Sem {studentData.semester}
                </Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {studentData.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {studentData.phone}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="academic">Academic Information</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={editData?.name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editData?.email}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editData?.phone}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={editData?.dateOfBirth}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={editData?.address}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{studentData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{studentData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">{studentData.dateOfBirth}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{studentData.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guardian Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Guardian Name</p>
                  <p className="font-medium">{studentData.guardianName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{studentData.guardianPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">{studentData.program}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{studentData.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment No.</p>
                  <p className="font-medium">{studentData.enrollmentNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll No.</p>
                  <p className="font-medium">{studentData.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Year</p>
                  <p className="font-medium">Year {studentData.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Semester</p>
                  <p className="font-medium">Semester {studentData.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{studentData.admissionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {new Date(studentData.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Generate and download official documents for admission or hostel purposes
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Digital ID Card</CardTitle>
                <CardDescription>
                  Your official digital identity card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownloadDocument("Digital ID Card")}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download ID Card
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bonafide Certificate</CardTitle>
                <CardDescription>
                  For scholarship or official purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownloadDocument("Bonafide Certificate")}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Bonafide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Migration/TC Form</CardTitle>
                <CardDescription>
                  Transfer Certificate request form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2" variant="outline">
                      <FileText className="h-4 w-4" />
                      Request Form
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Migration/TC Request</DialogTitle>
                      <DialogDescription>
                        Fill the form to request a transfer certificate
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reason for Transfer</Label>
                        <Input placeholder="Enter reason..." />
                      </div>
                      <Button className="w-full">Submit Request</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admit Card</CardTitle>
                <CardDescription>
                  For semester examinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownloadDocument("Admit Card")}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Admit Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
