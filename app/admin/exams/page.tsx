"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Calendar as CalendarIcon, CheckCircle, Clock, Search, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Exam = {
  _id: string;
  examId: string;
  name: string;
  program: string;
  semester: number;
  startDate: string;
  endDate: string;
  status: string;
};

type ResultSummary = {
  id: string;
  examName: string;
  program: string;
  semester: number;
  publishedOn: string;
  passPercentage: number;
  status: string;
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ResultSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    program: "B.Tech",
    semester: "1",
    startDate: "",
    endDate: "",
    status: "Upcoming"
  });

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [examsRes, resultsRes] = await Promise.all([
        fetch("/api/admin/exams", { headers: getAuthHeaders() }),
        fetch("/api/admin/results", { headers: getAuthHeaders() })
      ]);
      const examsData = await examsRes.json();
      const resultsData = await resultsRes.json();

      if (examsData.success) setExams(examsData.data);
      if (resultsData.success) setResults(resultsData.data);
    } catch (error) {
      toast.error("Failed to fetch exam data");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Exam created");
        setIsModalOpen(false);
        fetchData();
        setFormData({ name: "", program: "B.Tech", semester: "1", startDate: "", endDate: "", status: "Upcoming" });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to create exam");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deleted");
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exam Management Engine</h1>
          <p className="text-muted-foreground">Schedule examinations, manage grading, and publish results</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" /> Create New Exam</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Examinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{exams.filter(e => e.status === "Upcoming" || e.status === "In Progress").length}</div>
            <p className="text-sm text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Results Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">3</div>
            <p className="text-sm text-muted-foreground mt-1">Subjects waiting for HOD approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{results.length > 0 ? `${(results.reduce((acc, r) => acc + r.passPercentage, 0) / results.length).toFixed(1)}%` : "N/A"}</div>
            <p className="text-sm text-muted-foreground mt-1">Historical average across all programs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="schedules">Exam Schedules</TabsTrigger>
          <TabsTrigger value="results">Results & Grading</TabsTrigger>
          <TabsTrigger value="admitCards">Admit Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Examination Schedules</CardTitle>
              <CardDescription>Manage upcoming and past examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search exams..." className="pl-9 rounded-xl" />
                </div>
              </div>
              
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No exams scheduled.
                        </TableCell>
                      </TableRow>
                    )}
                    {exams.map((exam) => (
                      <TableRow key={exam._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-secondary rounded-lg"><FileSpreadsheet className="h-4 w-4" /></div>
                            <div>
                              <p>{exam.name}</p>
                              <p className="text-xs text-muted-foreground">{exam.examId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {exam.program} • Sem {exam.semester}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {exam.startDate} - {exam.endDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          {exam.status === "Completed" && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 border-0"><CheckCircle className="h-3 w-3" /> Completed</Badge>}
                          {exam.status === "Upcoming" && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1 border-0"><Clock className="h-3 w-3" /> Upcoming</Badge>}
                          {exam.status === "Draft" && <Badge variant="outline" className="text-muted-foreground">Draft</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exam._id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Results Ledger</CardTitle>
              <CardDescription>Publish validated grades and manage scorecards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Published On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No results published yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.examName}</TableCell>
                        <TableCell>{result.program} • Sem {result.semester}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">{result.passPercentage}%</Badge>
                        </TableCell>
                        <TableCell>{result.publishedOn || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 border-0">
                            <CheckCircle className="h-3 w-3" /> {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View Matrix</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admitCards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admit Card Generation</CardTitle>
              <CardDescription>Generate admit cards and apply fee-blocking logic</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-secondary/50 p-4 rounded-full mb-4">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Generate Admit Cards</h3>
              <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                System will automatically check for attendance shortage {`(<75%)`} and pending fee dues before generating admit cards.
              </p>
              <Button>Start Generation Process</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>Schedule an examination cycle</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Exam Name</Label>
              <Input placeholder="End Semester Exam" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={formData.program} onValueChange={v => setFormData({ ...formData, program: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={formData.semester} onValueChange={v => setFormData({ ...formData, semester: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Schedule Exam</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
