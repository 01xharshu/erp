"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, User as UserIcon, Phone as PhoneIcon, Book, Home } from "lucide-react";

type Student = {
  _id: string;
  enrollmentNo: string;
  rollNo?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  program?: string;
  semester: number;
  year?: number;
  section?: string;
  cgpa: number;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  admissionDate?: string;
};

type StudentForm = {
  enrollmentNo: string;
  rollNo: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  department: string;
  program: string;
  semester: number;
  year: number;
  section: string;
  cgpa: number;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
};

const initialForm: StudentForm = {
  enrollmentNo: "",
  rollNo: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  phone: "",
  department: "",
  program: "",
  semester: 1,
  year: 1,
  section: "",
  cgpa: 0,
  dateOfBirth: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  admissionDate: new Date().toISOString().split("T")[0],
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentForm>(initialForm);
  const [meta, setMeta] = useState<{ semesters: number[], sections: string[], programs: string[] }>({
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    sections: ["A", "B", "C"],
    programs: ["B.Tech", "BCA", "MCA"]
  });

  // ─── Filter State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterCgpa, setFilterCgpa] = useState("all");

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.toLowerCase();
      if (q && !s.firstName.toLowerCase().includes(q) && !s.lastName.toLowerCase().includes(q) && !s.enrollmentNo.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      if (filterDept !== "all" && s.department !== filterDept) return false;
      if (filterSemester !== "all" && String(s.semester) !== filterSemester) return false;
      if (filterSection !== "all" && s.section !== filterSection) return false;
      if (filterCgpa !== "all") {
        if (filterCgpa === "9+" && s.cgpa < 9) return false;
        if (filterCgpa === "8-9" && (s.cgpa < 8 || s.cgpa >= 9)) return false;
        if (filterCgpa === "7-8" && (s.cgpa < 7 || s.cgpa >= 8)) return false;
        if (filterCgpa === "6-7" && (s.cgpa < 6 || s.cgpa >= 7)) return false;
        if (filterCgpa === "<6" && s.cgpa >= 6) return false;
      }
      return true;
    });
  }, [students, searchQuery, filterDept, filterSemester, filterSection, filterCgpa]);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/metadata", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setMeta(data.data);
    } catch (e) {
      console.error("Meta fetch failed", e);
    }
  }, [getAuthHeaders]);

  const searchParams = useSearchParams();
  
  useEffect(() => {
    void fetchMeta();
    if (searchParams?.get("action") === "add") {
      setIsModalOpen(true);
    }
  }, [fetchMeta, searchParams]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/students", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data as Student[]);
      } else {
        toast.error(data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("[v0] Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setFormData({
      enrollmentNo: student.enrollmentNo,
      rollNo: student.rollNo || "",
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      password: "",
      phone: student.phone,
      department: student.department || "",
      program: student.program || "",
      semester: student.semester || 1,
      year: student.year || 1,
      section: student.section || "",
      cgpa: student.cgpa || 0,
      dateOfBirth: student.dateOfBirth || "",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      admissionDate: student.admissionDate || "",
    });
    setEditingId(student._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!editingId && !formData.password.trim()) {
      toast.error("Password is required for new student");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/admin/students", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to save student");
        return;
      }

      toast.success(payload.message || (editingId ? "Student updated" : "Student created"));
      await fetchStudents();
      closeModal();
    } catch (error) {
      console.error("[v0] Error submitting form:", error);
      toast.error("Failed to save student");
    }
  };

  const handleDelete = async (enrollmentNo: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`/api/admin/students?enrollmentNo=${enrollmentNo}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to delete student");
        return;
      }

      toast.success("Student deleted");
      await fetchStudents();
    } catch (error) {
      console.error("[v0] Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="mt-2 text-muted-foreground">Manage student accounts and information</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
          
          <DialogHeader className="p-6 pb-2 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {editingId ? "Edit Student Profile" : "Enrol New Student"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Modify existing student records and credentials."
                    : "Fill in the comprehensive details to onboard a new student."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative">
            <Tabs defaultValue="personal" className="w-full">
              <div className="px-6 border-b border-border/50">
                <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 h-12 gap-2">
                    <UserIcon className="h-4 w-4" /> Personal
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 h-12 gap-2">
                    <Book className="h-4 w-4" /> Academic
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 h-12 gap-2">
                    <Home className="h-4 w-4" /> Guardian & Contact
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[60vh] px-6 py-6">
                <TabsContent value="personal" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@university.com"
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(event) => setFormData({ ...formData, dateOfBirth: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{editingId ? "Change Password" : "Login Password"}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={editingId ? "•••••••• (leave blank to keep)" : "••••••••"}
                        value={formData.password}
                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Enrollment Number</Label>
                      {editingId ? (
                        <Input value={formData.enrollmentNo} readOnly className="bg-muted rounded-xl opacity-70" />
                      ) : (
                        <div className="h-10 flex items-center px-4 rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                          Auto-generated on creation
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Class Roll Number</Label>
                      <Input
                        id="rollNo"
                        placeholder="e.g. 101"
                        value={formData.rollNo}
                        onChange={(event) => setFormData({ ...formData, rollNo: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(val) => setFormData({ ...formData, department: val })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program / Course</Label>
                      <Select 
                        value={formData.program} 
                        onValueChange={(val) => setFormData({ ...formData, program: val })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="M.Tech">M.Tech</SelectItem>
                          <SelectItem value="BCA">BCA</SelectItem>
                          {meta.programs.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Semester Field */}
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={formData.semester.toString()}
                        onValueChange={(val) => {
                          const sem = parseInt(val);
                          setFormData({ 
                            ...formData, 
                            semester: sem,
                            year: Math.ceil(sem / 2) // Auto-calculate academic year
                          });
                        }}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {meta.semesters.map((s) => (
                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Section Field */}
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Select
                        value={formData.section}
                        onValueChange={(val) => setFormData({ ...formData, section: val })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {meta.sections.map((sec) => (
                            <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Academic Year (Read-only as it follows Semester) */}
                    <div className="space-y-2">
                      <Label htmlFor="year">Academic Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        readOnly
                        className="rounded-xl bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cgpa">Current CGPA</Label>
                      <Input
                        id="cgpa"
                        type="number"
                        min={0}
                        max={10}
                        step="0.01"
                        value={formData.cgpa}
                        onChange={(event) => setFormData({ ...formData, cgpa: Number(event.target.value) || 0 })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Admission Date</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={formData.admissionDate}
                        onChange={(event) => setFormData({ ...formData, admissionDate: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Permanent Address</Label>
                      <Input
                        id="address"
                        placeholder="Full residential address..."
                        value={formData.address}
                        onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">Father&apos;s / Guardian&apos;s Name</Label>
                      <Input
                        id="guardianName"
                        placeholder="Mr. Robert Doe"
                        value={formData.guardianName}
                        onChange={(event) => setFormData({ ...formData, guardianName: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianPhone">Guardian&apos;s Contact</Label>
                      <Input
                        id="guardianPhone"
                        placeholder="+1 (555) 111-2222"
                        value={formData.guardianPhone}
                        onChange={(event) => setFormData({ ...formData, guardianPhone: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
              
              <DialogFooter className="p-6 bg-secondary/10 border-t border-border/50 gap-2">
                <Button type="button" variant="ghost" className="rounded-xl" onClick={closeModal}>
                  Discard Changes
                </Button>
                <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  {editingId ? "Update Student Profile" : "Finalize Enrollment"}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {students.length} student{students.length !== 1 ? "s" : ""} in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ─── Filter Bar ─── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Input
              placeholder="Search name or enrollment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-2 md:col-span-1 rounded-xl"
            />
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {[...new Set(students.map(s => s.department).filter(Boolean))].sort().map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[...new Set(students.map(s => s.semester))].sort((a, b) => a - b).map(s => (
                  <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {[...new Set(students.map(s => s.section).filter(Boolean))].sort().map(s => (
                  <SelectItem key={s!} value={s!}>Section {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCgpa} onValueChange={setFilterCgpa}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="CGPA Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CGPA</SelectItem>
                <SelectItem value="9+">9.0+ (Outstanding)</SelectItem>
                <SelectItem value="8-9">8.0 – 9.0</SelectItem>
                <SelectItem value="7-8">7.0 – 8.0</SelectItem>
                <SelectItem value="6-7">6.0 – 7.0</SelectItem>
                <SelectItem value="<6">Below 6.0 (At Risk)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filterDept !== "all" || filterSemester !== "all" || filterSection !== "all" || filterCgpa !== "all" || searchQuery ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{filteredStudents.length} result{filteredStudents.length !== 1 ? "s" : ""}</p>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSearchQuery(""); setFilterDept("all"); setFilterSemester("all"); setFilterSection("all"); setFilterCgpa("all"); }}>Clear Filters</Button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Enrollment</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Department</th>
                  <th className="px-4 py-2 text-left font-medium">Semester</th>
                  <th className="px-4 py-2 text-left font-medium">Section</th>
                  <th className="px-4 py-2 text-left font-medium">CGPA</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-border transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3">{student.enrollmentNo}</td>
                    <td className="px-4 py-3">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                    <td className="px-4 py-3">{student.department}</td>
                    <td className="px-4 py-3">{student.semester}</td>
                    <td className="px-4 py-3">{student.section || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={student.cgpa < 6 ? "text-red-500 font-bold" : ""}>{student.cgpa.toFixed(2)}</span>
                    </td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(student)}
                        className="inline-block rounded-lg p-1 transition-colors hover:bg-secondary"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.enrollmentNo)}
                        className="inline-block rounded-lg p-1 transition-colors hover:bg-secondary"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && <div className="py-8 text-center text-muted-foreground">No students match the current filters.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
