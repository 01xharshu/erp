"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Student {
  _id: string;
  enrollmentNo: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  semester: number;
  cgpa: number;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    enrollmentNo: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    department: "",
    semester: 1,
    cgpa: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error("[v0] Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.enrollmentNo || !formData.email || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/students", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Student updated" : "Student created");
        fetchStudents();
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error);
      toast.error("Failed to save student");
    }
  };

  const handleDelete = async (enrollmentNo: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const res = await fetch(`/api/admin/students?enrollmentNo=${enrollmentNo}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Student deleted");
        fetchStudents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("[v0] Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleEdit = (student: Student) => {
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
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      enrollmentNo: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
      department: "",
      semester: 1,
      cgpa: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-2">
            Manage student accounts and information
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>
              {editingId ? "Edit Student" : "Add New Student"}
            </CardTitle>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-secondary rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Enrollment No"
                value={formData.enrollmentNo}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentNo: e.target.value })
                }
                disabled={!!editingId}
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              {!editingId && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              )}
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Input
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Semester"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: parseInt(e.target.value) })
                }
              />
              <Input
                type="number"
                step="0.1"
                placeholder="CGPA"
                value={formData.cgpa}
                onChange={(e) =>
                  setFormData({ ...formData, cgpa: parseFloat(e.target.value) })
                }
              />

              <div className="col-span-full flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <th className="text-left py-2 px-4 font-medium">Enrollment</th>
                  <th className="text-left py-2 px-4 font-medium">Name</th>
                  <th className="text-left py-2 px-4 font-medium">Email</th>
                  <th className="text-left py-2 px-4 font-medium">Department</th>
                  <th className="text-left py-2 px-4 font-medium">Semester</th>
                  <th className="text-left py-2 px-4 font-medium">CGPA</th>
                  <th className="text-right py-2 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">{student.enrollmentNo}</td>
                    <td className="py-3 px-4">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {student.email}
                    </td>
                    <td className="py-3 px-4">{student.department}</td>
                    <td className="py-3 px-4">{student.semester}</td>
                    <td className="py-3 px-4">{student.cgpa.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="inline-block p-1 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.enrollmentNo)}
                        className="inline-block p-1 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
