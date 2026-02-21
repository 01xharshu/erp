"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Faculty = {
  _id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string;
};

type FacultyForm = {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string;
};

const initialForm: FacultyForm = {
  employeeId: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  phone: "",
  department: "",
  designation: "Lecturer",
  specialization: "",
};

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FacultyForm>(initialForm);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faculty", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setFaculty(data.data as Faculty[]);
      } else {
        toast.error(data.message || "Failed to fetch faculty");
      }
    } catch (error) {
      console.error("[v0] Error fetching faculty:", error);
      toast.error("Failed to fetch faculty");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchFaculty();
  }, [fetchFaculty]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (member: Faculty) => {
    setFormData({
      employeeId: member.employeeId,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      password: "",
      phone: member.phone,
      department: member.department,
      designation: member.designation,
      specialization: member.specialization,
    });
    setEditingId(member._id);
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
      toast.error("Password is required for new faculty");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/admin/faculty", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to save faculty");
        return;
      }

      toast.success(payload.message || (editingId ? "Faculty updated" : "Faculty created"));
      await fetchFaculty();
      closeModal();
    } catch (error) {
      console.error("[v0] Error submitting form:", error);
      toast.error("Failed to save faculty");
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;

    try {
      const response = await fetch(`/api/admin/faculty?employeeId=${employeeId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to delete faculty");
        return;
      }

      toast.success("Faculty deleted");
      await fetchFaculty();
    } catch (error) {
      console.error("[v0] Error deleting faculty:", error);
      toast.error("Failed to delete faculty");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty</h1>
          <p className="mt-2 text-muted-foreground">Manage faculty accounts and information</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update faculty profile details. Employee ID remains fixed."
                : "Employee ID is auto-assigned in FAC### format when created."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {editingId ? (
              <Input placeholder="Employee ID" value={formData.employeeId} readOnly className="bg-muted" />
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Employee ID will be generated automatically.
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
              placeholder="Designation"
              value={formData.designation}
              onChange={(event) => setFormData({ ...formData, designation: event.target.value })}
            />
            <Input
              placeholder="Specialization"
              value={formData.specialization}
              onChange={(event) => setFormData({ ...formData, specialization: event.target.value })}
            />

            <div className="col-span-full flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Update Faculty" : "Create Faculty"}
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
                  <th className="px-4 py-2 text-left font-medium">Employee ID</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Department</th>
                  <th className="px-4 py-2 text-left font-medium">Designation</th>
                  <th className="px-4 py-2 text-left font-medium">Specialization</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((member) => (
                  <tr key={member._id} className="border-b border-border transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3">{member.employeeId}</td>
                    <td className="px-4 py-3">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                    <td className="px-4 py-3">{member.department}</td>
                    <td className="px-4 py-3">{member.designation}</td>
                    <td className="px-4 py-3">{member.specialization}</td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(member)}
                        className="inline-block rounded-lg p-1 transition-colors hover:bg-secondary"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.employeeId)}
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

          {faculty.length === 0 && <div className="py-8 text-center text-muted-foreground">No faculty found.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
