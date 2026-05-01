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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [meta, setMeta] = useState<{ 
    departments: string[], 
    designations: string[], 
    specializations: string[] 
  }>({
    departments: [],
    designations: [],
    specializations: []
  });

  // ─── Filter State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");
  const [filterSpecialization, setFilterSpecialization] = useState("all");

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const q = searchQuery.toLowerCase();
      if (q && !f.firstName.toLowerCase().includes(q) && !f.lastName.toLowerCase().includes(q) && !f.employeeId.toLowerCase().includes(q) && !f.email.toLowerCase().includes(q)) return false;
      if (filterDept !== "all" && f.department !== filterDept) return false;
      if (filterDesignation !== "all" && f.designation !== filterDesignation) return false;
      if (filterSpecialization !== "all" && f.specialization !== filterSpecialization) return false;
      return true;
    });
  }, [faculty, searchQuery, filterDept, filterDesignation, filterSpecialization]);

  // Modal for adding new meta options
  const [isAddMetaOpen, setIsAddMetaOpen] = useState(false);
  const [metaUpdateType, setMetaUpdateType] = useState<'departments' | 'designations' | 'specializations'>('departments');
  const [newMetaValue, setNewMetaValue] = useState("");

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/metadata", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setMeta({
          departments: data.data.departments || [],
          designations: data.data.designations || [],
          specializations: data.data.specializations || []
        });
      }
    } catch (e) {
      console.error("Failed to fetch meta", e);
    }
  }, [getAuthHeaders]);

  const searchParams = useSearchParams();
  
  useEffect(() => {
    void fetchMeta();
    if (searchParams?.get("action") === "add") {
      setIsModalOpen(true);
    }
  }, [fetchMeta, searchParams]);

  const updateRemoteMeta = async (updates: any) => {
    try {
      await fetch("/api/admin/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates)
      });
      await fetchMeta();
    } catch (err) {
      console.error("Meta update failed", err);
    }
  };

  const handleAddMeta = async () => {
    if (!newMetaValue.trim()) return;
    const newList = [...(meta[metaUpdateType] || []), newMetaValue.trim()].sort();
    await updateRemoteMeta({ [metaUpdateType]: newList });
    setNewMetaValue("");
    setIsAddMetaOpen(false);
  };

  const handleDeleteMeta = async (type: any, val: string) => {
    if (!confirm(`Remove "${val}" from system?`)) return;
    const newList = (meta[type as keyof typeof meta] || []).filter(i => i !== val);
    await updateRemoteMeta({ [type]: newList });
  };

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
    <>
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
                ? "Update faculty profile details. Leave password blank to keep current credential."
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
            <Input
              type="password"
              placeholder={editingId ? "New Password (Leave blank to keep current)" : "Password"}
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
            {/* Department Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(val) => {
                  if (val === "__ADD_NEW__") { setMetaUpdateType('departments'); setIsAddMetaOpen(true); }
                  else if (val.startsWith("__DELETE__")) handleDeleteMeta('departments', val.replace("__DELETE__", ""));
                  else setFormData({ ...formData, department: val });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {(meta.departments || []).map(d => (
                    <div key={d} className="flex items-center justify-between group px-1">
                      <SelectItem value={d} className="flex-1">{d}</SelectItem>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteMeta('departments', d); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500">
                        <Trash2 className="h-3 w-3"/>
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold">+ Add New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Designation Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs">Designation</Label>
              <Select 
                value={formData.designation} 
                onValueChange={(val) => {
                  if (val === "__ADD_NEW__") { setMetaUpdateType('designations'); setIsAddMetaOpen(true); }
                  else if (val.startsWith("__DELETE__")) handleDeleteMeta('designations', val.replace("__DELETE__", ""));
                  else setFormData({ ...formData, designation: val });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  {(meta.designations || []).map(d => (
                    <div key={d} className="flex items-center justify-between group px-1">
                      <SelectItem value={d} className="flex-1">{d}</SelectItem>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteMeta('designations', d); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500">
                        <Trash2 className="h-3 w-3"/>
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold">+ Add New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialization Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs">Specialization</Label>
              <Select 
                value={formData.specialization} 
                onValueChange={(val) => {
                  if (val === "__ADD_NEW__") { setMetaUpdateType('specializations'); setIsAddMetaOpen(true); }
                  else if (val.startsWith("__DELETE__")) handleDeleteMeta('specializations', val.replace("__DELETE__", ""));
                  else setFormData({ ...formData, specialization: val });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent>
                  {(meta.specializations || []).map(s => (
                    <div key={s} className="flex items-center justify-between group px-1">
                      <SelectItem value={s} className="flex-1">{s}</SelectItem>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteMeta('specializations', s); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500">
                        <Trash2 className="h-3 w-3"/>
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold">+ Add New</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
        <CardContent className="space-y-4">
          {/* ─── Filter Bar ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Search name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-2 md:col-span-1 rounded-xl"
            />
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {[...new Set(faculty.map(f => f.department).filter(Boolean))].sort().map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDesignation} onValueChange={setFilterDesignation}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Designation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {[...new Set(faculty.map(f => f.designation).filter(Boolean))].sort().map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Specialization" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {[...new Set(faculty.map(f => f.specialization).filter(Boolean))].sort().map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filterDept !== "all" || filterDesignation !== "all" || filterSpecialization !== "all" || searchQuery) && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{filteredFaculty.length} result{filteredFaculty.length !== 1 ? "s" : ""}</p>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSearchQuery(""); setFilterDept("all"); setFilterDesignation("all"); setFilterSpecialization("all"); }}>Clear Filters</Button>
            </div>
          )}

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
                {filteredFaculty.map((member) => (
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

          {filteredFaculty.length === 0 && <div className="py-8 text-center text-muted-foreground">No faculty match the current filters.</div>}
        </CardContent>
      </Card>
    </div>

      {/* Add Meta Option Dialog */}
      <Dialog open={isAddMetaOpen} onOpenChange={setIsAddMetaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {metaUpdateType.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Enter the name of the new {metaUpdateType.slice(0, -1)} to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder={`New ${metaUpdateType.slice(0, -1)} name...`}
              value={newMetaValue}
              onChange={(e) => setNewMetaValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMeta()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddMetaOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMeta}>Add Option</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
