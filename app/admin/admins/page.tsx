"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Admin = {
  _id: string;
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type AdminForm = {
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
};

const initialForm: AdminForm = {
  adminId: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  phone: "",
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminForm>(initialForm);

  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/admins", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setAdmins(data.data as Admin[]);
    } catch (error) {
      toast.error("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const resetForm = () => { setFormData(initialForm); setEditingId(null); };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (admin: Admin) => {
    setFormData({
      adminId: admin.adminId,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      password: "",
      phone: admin.phone,
    });
    setEditingId(admin.adminId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.adminId) {
      toast.error("Required fields missing");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/admins", {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Admin updated" : "Admin created");
        fetchAdmins();
        setIsModalOpen(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Error saving admin");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    try {
      const res = await fetch(`/api/admin/admins?adminId=${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin removed");
        fetchAdmins();
      }
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Management Console...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
          <p className="mt-2 text-muted-foreground font-medium">Configure platform administrators and permissions</p>
        </div>
        <Button onClick={openCreateModal} className="rounded-full px-6 gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Admin" : "Add New Admin"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update account details and credentials." : "Create a new administrative account."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
            <Input
              placeholder="Admin ID (e.g. ADM001)"
              value={formData.adminId}
              readOnly={!!editingId}
              className={editingId ? "bg-muted" : ""}
              onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email Business"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <Input
              type="password"
              placeholder={editingId ? "New Password (Optional)" : "Password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              placeholder="Business Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <div className="col-span-full flex gap-3 mt-4">
              <Button type="submit" className="flex-1 rounded-full">
                {editingId ? "Save Changes" : "Create Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="rounded-[32px] overflow-hidden border-border/50">
        <CardHeader>
          <CardTitle>System Administrators</CardTitle>
          <CardDescription>{admins.length} active administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Admin ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Full Name</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.adminId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-primary">{admin.adminId}</td>
                    <td className="px-4 py-4 font-medium">{admin.firstName} {admin.lastName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{admin.email}</td>
                    <td className="px-4 py-4 text-right space-x-2">
                       <Button variant="ghost" size="icon" onClick={() => openEditModal(admin)} className="rounded-full">
                         <Edit2 className="h-4 w-4 text-blue-500" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(admin.adminId)} className="rounded-full">
                         <Trash2 className="h-4 w-4 text-red-500" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
