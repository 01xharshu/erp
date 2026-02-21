"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";

interface Faculty {
  _id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string;
}

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    department: "",
    designation: "Lecturer",
    specialization: "",
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/faculty", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setFaculty(data.data);
      } else {
        toast.error(data.message || "Failed to fetch faculty");
      }
    } catch (error) {
      console.error("[v0] Error fetching faculty:", error);
      toast.error("Failed to fetch faculty");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.email || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/faculty", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Faculty updated" : "Faculty created");
        fetchFaculty();
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error);
      toast.error("Failed to save faculty");
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;

    try {
      const res = await fetch(`/api/admin/faculty?employeeId=${employeeId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Faculty deleted");
        fetchFaculty();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("[v0] Error deleting faculty:", error);
      toast.error("Failed to delete faculty");
    }
  };

  const handleEdit = (fac: Faculty) => {
    setFormData({
      employeeId: fac.employeeId,
      email: fac.email,
      firstName: fac.firstName,
      lastName: fac.lastName,
      password: "",
      phone: fac.phone,
      department: fac.department,
      designation: fac.designation,
      specialization: fac.specialization,
    });
    setEditingId(fac._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
      department: "",
      designation: "Lecturer",
      specialization: "",
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
          <h1 className="text-3xl font-bold text-foreground">Faculty</h1>
          <p className="text-muted-foreground mt-2">
            Manage faculty accounts and information
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
          Add Faculty
        </Button>
      </div>

      {showForm && (
        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>
              {editingId ? "Edit Faculty" : "Add New Faculty"}
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
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
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
                placeholder="Designation"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
              <Input
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
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
          <CardTitle>All Faculty</CardTitle>
          <CardDescription>
            {faculty.length} faculty member{faculty.length !== 1 ? "s" : ""} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-medium">Employee ID</th>
                  <th className="text-left py-2 px-4 font-medium">Name</th>
                  <th className="text-left py-2 px-4 font-medium">Email</th>
                  <th className="text-left py-2 px-4 font-medium">Department</th>
                  <th className="text-left py-2 px-4 font-medium">Designation</th>
                  <th className="text-left py-2 px-4 font-medium">Specialization</th>
                  <th className="text-right py-2 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((fac) => (
                  <tr
                    key={fac._id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">{fac.employeeId}</td>
                    <td className="py-3 px-4">
                      {fac.firstName} {fac.lastName}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {fac.email}
                    </td>
                    <td className="py-3 px-4">{fac.department}</td>
                    <td className="py-3 px-4">{fac.designation}</td>
                    <td className="py-3 px-4">{fac.specialization}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(fac)}
                        className="inline-block p-1 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(fac.employeeId)}
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

          {faculty.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No faculty found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
