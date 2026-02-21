"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Student = {
  _id: string;
  enrollmentNo: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  semester: number;
  cgpa: number;
};

type StudentForm = {
  enrollmentNo: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  department: string;
  semester: number;
  cgpa: number;
};

const initialForm: StudentForm = {
  enrollmentNo: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  phone: "",
  department: "",
  semester: 1,
  cgpa: 0,
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentForm>(initialForm);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

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
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      password: "",
      phone: student.phone,
      department: student.department,
      semester: student.semester,
      cgpa: student.cgpa,
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update student profile details. Enrollment No remains fixed."
                : "Enrollment No is auto-assigned in ENYYYY### format when created."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {editingId ? (
              <Input placeholder="Enrollment No" value={formData.enrollmentNo} readOnly className="bg-muted" />
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Enrollment No will be generated automatically.
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
            />
            {!editingId && (
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              />
            )}
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
            />
            <Input
              placeholder="Department"
              value={formData.department}
              onChange={(event) => setFormData({ ...formData, department: event.target.value })}
            />
            <Input
              type="number"
              min={1}
              placeholder="Semester"
              value={formData.semester}
              onChange={(event) => setFormData({ ...formData, semester: Number(event.target.value) || 1 })}
            />
            <Input
              type="number"
              min={0}
              max={10}
              step="0.1"
              placeholder="CGPA"
              value={formData.cgpa}
              onChange={(event) => setFormData({ ...formData, cgpa: Number(event.target.value) || 0 })}
            />

            <div className="col-span-full flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Update Student" : "Create Student"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                Cancel
              </Button>
            </div>
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
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Enrollment</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Department</th>
                  <th className="px-4 py-2 text-left font-medium">Semester</th>
                  <th className="px-4 py-2 text-left font-medium">CGPA</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-border transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3">{student.enrollmentNo}</td>
                    <td className="px-4 py-3">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                    <td className="px-4 py-3">{student.department}</td>
                    <td className="px-4 py-3">{student.semester}</td>
                    <td className="px-4 py-3">{student.cgpa.toFixed(2)}</td>
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

          {students.length === 0 && <div className="py-8 text-center text-muted-foreground">No students found.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
