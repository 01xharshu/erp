"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, LayoutGrid, Plus, X, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";
import { TimetableDay, TimetableSlot } from "@/lib/db-models";
import { cn } from "@/lib/utils";

type Faculty = { employeeId: string; firstName: string; lastName: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_PERIODS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM"
];

const normalizeSchedule = (dbSchedule: TimetableDay[], currentPeriods: string[]): TimetableDay[] => {
  return DAYS.map(day => {
    const existingDay = dbSchedule?.find(d => d.day === day);
    const slots = currentPeriods.map(time => {
      const existingSlot = existingDay?.slots.find(s => s.time === time);
      return existingSlot || { time, subject: "", facultyId: "", room: "" };
    });
    return { day, slots };
  });
};

const compactSchedule = (fullSchedule: TimetableDay[]): TimetableDay[] => {
  return fullSchedule.map(dayObj => ({
    day: dayObj.day,
    slots: dayObj.slots.filter(s => s.subject.trim() !== "")
  })).filter(dayObj => dayObj.slots.length > 0);
};

export default function TimetableManagement() {
  const [program, setProgram] = useState("B.Tech");

  // Dynamic Dropdowns state
  const [semestersList, setSemestersList] = useState<string[]>([]);
  const [sectionsList, setSectionsList] = useState<string[]>([]);
  const [programsList, setProgramsList] = useState<string[]>([]);

  const [semester, setSemester] = useState<string>("1");
  const [section, setSection] = useState("A");

  const [isLoading, setIsLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  const [periods, setPeriods] = useState<string[]>(DEFAULT_PERIODS);
  const [schedule, setSchedule] = useState<TimetableDay[]>([]);

  // Modals state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isPeriodsModalOpen, setIsPeriodsModalOpen] = useState(false);
  const [editingPeriods, setEditingPeriods] = useState<string[]>([]);

  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [slotData, setSlotData] = useState<TimetableSlot>({ time: "", subject: "", facultyId: "", room: "" });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<'semester' | 'section' | 'program'>('semester');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'semester' | 'section' | 'program', value: string } | null>(null);
  const [newValue, setNewValue] = useState("");

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/admin/metadata", { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
          setSemestersList(data.data.semesters);
          setSectionsList(data.data.sections);
          setProgramsList(data.data.programs);
        }
      } catch (err) {
        console.error("Meta fetch failed", err);
      }
    };
    fetchMeta();
  }, [getAuthHeaders]);

  const updateRemoteMeta = async (updates: any) => {
    try {
      await fetch("/api/admin/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Meta update failed", err);
    }
  };

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faculty", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setFacultyList(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch faculty", e);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchFaculty();
  }, [fetchFaculty]);

  const handleProgramChange = (val: string) => {
    const sVal = String(val);
    if (sVal === "__ADD_NEW__") {
      setNewType('program');
      setIsAddModalOpen(true);
      setNewValue("");
    } else if (sVal.startsWith("__DELETE__")) {
      const progToDelete = sVal.replace("__DELETE__", "");
      setDeleteTarget({ type: 'program', value: progToDelete });
      setIsDeleteConfirmOpen(true);
    } else {
      setProgram(sVal);
    }
  };

  const handleSemesterChange = (val: string) => {
    const sVal = String(val);
    if (sVal === "__ADD_NEW__") {
      setNewType('semester');
      setIsAddModalOpen(true);
      setNewValue("");
    } else if (sVal.startsWith("__DELETE__")) {
      const semToDelete = sVal.replace("__DELETE__", "");
      setDeleteTarget({ type: 'semester', value: semToDelete });
      setIsDeleteConfirmOpen(true);
    } else {
      setSemester(sVal);
    }
  };

  const handleSectionChange = (val: string) => {
    const sVal = String(val);
    if (sVal === "__ADD_NEW__") {
      setNewType('section');
      setIsAddModalOpen(true);
      setNewValue("");
    } else if (sVal.startsWith("__DELETE__")) {
      const secToDelete = sVal.replace("__DELETE__", "");
      setDeleteTarget({ type: 'section', value: secToDelete });
      setIsDeleteConfirmOpen(true);
    } else {
      setSection(sVal);
    }
  };


  const confirmAdd = async () => {
    if (!newValue.trim()) return;
    if (newType === "semester") {
      const num = parseInt(newValue);
      if (!isNaN(num) && !semestersList.includes(String(num))) {
        const newList = [...semestersList, String(num)].sort((a, b) => Number(a) - Number(b));
        setSemestersList(newList);
        await updateRemoteMeta({ semesters: newList });
      }
    } else if (newType === "program") {
      const val = newValue.trim();
      if (!programsList.includes(val)) {
        const newList = [...programsList, val].sort();
        setProgramsList(newList);
        await updateRemoteMeta({ programs: newList });
      }
    } else {
      const val = newValue.toUpperCase();
      if (!sectionsList.includes(val)) {
        const newList = [...sectionsList, val].sort();
        setSectionsList(newList);
        await updateRemoteMeta({ sections: newList });
      }
    }
    setIsAddModalOpen(false);
    setNewValue("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "semester") {
      const newList = semestersList.filter(s => s.toString() !== deleteTarget.value);
      setSemestersList(newList);
      await updateRemoteMeta({ semesters: newList });
      if (semester === deleteTarget.value) setSemester(newList[0]?.toString() || "");
    } else if (deleteTarget.type === "program") {
      const newList = programsList.filter(p => p !== deleteTarget.value);
      setProgramsList(newList);
      await updateRemoteMeta({ programs: newList });
      if (program === deleteTarget.value) setProgram(newList[0] || "");
    } else {
      const newList = sectionsList.filter(s => s !== deleteTarget.value);
      setSectionsList(newList);
      await updateRemoteMeta({ sections: newList });
      if (section === deleteTarget.value) setSection(newList[0] || "");
    }
    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
    toast.success(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} removed successfully`);
  };

  const handleLoadTimetable = async () => {
    if (!program || !semester || !section) {
      toast.error("Please select Program, Semester and Section");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ program, semester, section });
      const res = await fetch(`/api/admin/timetable?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();

      if (data.success && data.data.length > 0) {
        const loadedTimetable = data.data[0];
        const loadedPeriods = loadedTimetable.periods && loadedTimetable.periods.length > 0
          ? loadedTimetable.periods
          : DEFAULT_PERIODS;
        setPeriods(loadedPeriods);
        setSchedule(normalizeSchedule(loadedTimetable.schedule, loadedPeriods));
        toast.success("Timetable loaded");
      } else {
        setPeriods(DEFAULT_PERIODS);
        setSchedule(normalizeSchedule([], DEFAULT_PERIODS));
        toast.success("No existing timetable found. Start creating one.");
      }
    } catch (err) {
      toast.error("Failed to load timetable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTimetable = async () => {
    try {
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          program,
          semester,
          section,
          periods,
          schedule: compactSchedule(schedule)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to save timetable");
    }
  };

  // Grid slot handlers
  const openSlotModal = (dayIdx: number, slotIdx: number) => {
    setActiveDayIdx(dayIdx);
    setActiveSlotIdx(slotIdx);
    setSlotData({ ...schedule[dayIdx].slots[slotIdx] });
    setIsSlotModalOpen(true);
  };

  const saveSlot = () => {
    if (!slotData.subject || !slotData.facultyId) {
      toast.error("Subject and Faculty are required");
      return;
    }
    if (activeDayIdx === null || activeSlotIdx === null) return;

    const newSchedule = [...schedule];
    newSchedule[activeDayIdx].slots[activeSlotIdx] = slotData;
    setSchedule(newSchedule);
    setIsSlotModalOpen(false);
  };

  const clearSlot = () => {
    if (activeDayIdx === null || activeSlotIdx === null) return;
    const newSchedule = [...schedule];
    newSchedule[activeDayIdx].slots[activeSlotIdx] = { time: periods[activeSlotIdx], subject: "", facultyId: "", room: "" };
    setSchedule(newSchedule);
    setIsSlotModalOpen(false);
  };

  // Periods Management Handlers
  const openPeriodsModal = () => {
    setEditingPeriods([...periods]);
    setIsPeriodsModalOpen(true);
  };

  const updatePeriodName = (idx: number, val: string) => {
    const newP = [...editingPeriods];
    newP[idx] = val;
    setEditingPeriods(newP);
  };

  const addPeriod = () => setEditingPeriods([...editingPeriods, "New Time Slot"]);

  const removePeriod = (idx: number) => {
    setEditingPeriods(editingPeriods.filter((_, i) => i !== idx));
  };

  const savePeriods = () => {
    if (editingPeriods.length === 0) {
      toast.error("You must have at least one period");
      return;
    }
    setPeriods(editingPeriods);
    // Align current schedule mapping to new periods
    const reMappedSchedule = DAYS.map(day => {
      const existingDay = schedule.find(d => d.day === day);
      const slots = editingPeriods.map((time, idx) => {
        // Try to keep by index first so assignments don't totally break if admin just renames the time slot
        if (existingDay && existingDay.slots[idx]) {
          return { ...existingDay.slots[idx], time };
        }
        return { time, subject: "", facultyId: "", room: "" };
      });
      return { day, slots };
    });
    setSchedule(reMappedSchedule);
    setIsPeriodsModalOpen(false);
    toast.success("Periods structure updated. Don't forget to save the timetable.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable Manager</h1>
          <p className="mt-2 text-muted-foreground">Manage and assign class schedules via Grid View</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5" /> Class Selection</CardTitle>
          <CardDescription>Select the class to view or edit its timetable grid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program / Course</Label>
              <Select value={program} onValueChange={handleProgramChange}>
                <SelectTrigger className="rounded-xl border-border/50 bg-background/50">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  {programsList.map(p => (
                    <div key={p} className="flex items-center justify-between group px-1">
                      <SelectItem value={p} className="flex-1">{p}</SelectItem>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'program', value: p }); setIsDeleteConfirmOpen(true); }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold bg-primary/5 cursor-pointer mt-1">+ Add New Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={semester} onValueChange={handleSemesterChange}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b border-border mb-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground px-2">Select or Manage</p>
                  </div>
                  {semestersList.map(s => (
                    <div key={s} className="flex items-center justify-between group px-1">
                      <SelectItem value={String(s)} className="flex-1">{s}</SelectItem>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSemesterChange(`__DELETE__${s}`); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all mr-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold bg-primary/5 cursor-pointer mt-1">+ Add New Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={section} onValueChange={handleSectionChange}>
                <SelectTrigger className="rounded-xl uppercase"><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b border-border mb-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground px-2">Select or Manage</p>
                  </div>
                  {sectionsList.map(s => (
                    <div key={s} className="flex items-center justify-between group px-1">
                      <SelectItem value={s} className="flex-1 uppercase">{s}</SelectItem>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSectionChange(`__DELETE__${s}`); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all mr-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <SelectItem value="__ADD_NEW__" className="text-primary font-bold bg-primary/5 cursor-pointer mt-1">+ Add New Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLoadTimetable} disabled={isLoading} className="rounded-xl w-full">
              {isLoading ? "Loading..." : "Load Timetable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {schedule.length > 0 && (
        <Card className="overflow-hidden border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-secondary/10 border-b gap-4">
            <div>
              <CardTitle className="text-xl">Weekly Grid Editor</CardTitle>
              <CardDescription className="font-semibold text-primary/80 mt-1">{program} • Sem {semester} • Sec {section}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openPeriodsModal} className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" /> Edit Periods
              </Button>
              <Button onClick={handleSaveTimetable} className="gap-2 rounded-xl">
                <Save className="h-4 w-4" /> Save Timetable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[1000px]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="p-4 border-b border-border/50 text-left font-semibold w-36 border-r">Period / Time</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-4 border-b border-border/50 text-left font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((periodLabel, periodIdx) => (
                    <tr key={periodIdx} className="border-b border-border/50 transition-colors hover:bg-muted/10">
                      <td className="p-4 border-r border-border/50 font-medium text-muted-foreground align-top bg-card/50 min-w-[140px]">
                        <div className="font-bold text-foreground mb-1">Period {periodIdx + 1}</div>
                        <div className="text-xs opacity-80 whitespace-pre-wrap leading-tight">{periodLabel.replace(" - ", "\n- ")}</div>
                      </td>
                      {schedule.map((dayData, dayIdx) => {
                        const slot = dayData.slots[periodIdx];
                        const isFilled = slot && slot.subject.trim() !== "";

                        return (
                          <td
                            key={`${dayData.day}-${periodIdx}`}
                            className="p-3 border-r border-border/20 last:border-r-0 align-top cursor-pointer group hover:bg-primary/[0.04] transition-colors relative"
                            onClick={() => openSlotModal(dayIdx, periodIdx)}
                          >
                            {isFilled ? (
                              <div className="space-y-1.5 h-full rounded-xl bg-card border border-border/60 p-3 shadow-sm group-hover:border-primary/40 relative overflow-hidden flex flex-col justify-center min-h-[90px]">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center text-muted-foreground hover:text-foreground">
                                    <Plus className="w-3 h-3" />
                                  </div>
                                </div>
                                <p className="font-bold text-primary leading-tight text-sm line-clamp-2 pr-4">{slot.subject}</p>
                                <div className="text-[11px] font-medium text-muted-foreground space-y-0.5">
                                  <p className="flex items-center gap-1.5 truncate">
                                    <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
                                    {facultyList.find(f => f.employeeId === slot.facultyId)?.firstName || slot.facultyId}
                                  </p>
                                  {slot.room && (
                                    <p className="flex items-center gap-1.5 truncate">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                                      Room {slot.room}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[90px] border border-dashed border-border/40 rounded-xl flex items-center justify-center text-muted-foreground/40 group-hover:text-primary/60 group-hover:border-primary/40 group-hover:bg-primary/[0.02] transition-all">
                                <span className="flex items-center gap-2 font-medium text-xs">
                                  <Plus className="w-3 h-3" /> Add
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/20 text-xs text-muted-foreground flex justify-between items-center border-t border-border/50">
              <p>Click any cell to add or edit a class for that specific period.</p>
              <p>Empty cells will be completely ignored when saving.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Edit Modal */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeDayIdx !== null && activeSlotIdx !== null && schedule[activeDayIdx]?.slots[activeSlotIdx]?.subject ? "Edit" : "Assign"} Class
            </DialogTitle>
            <DialogDescription>
              {activeDayIdx !== null && schedule[activeDayIdx]?.day} • Period {activeSlotIdx !== null ? activeSlotIdx + 1 : ""} ({activeSlotIdx !== null ? periods[activeSlotIdx] : ""})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="e.g. Advanced Mathematics" className="rounded-xl" value={slotData.subject} onChange={e => setSlotData({ ...slotData, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Faculty</Label>
              <Select value={slotData.facultyId} onValueChange={v => setSlotData({ ...slotData, facultyId: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Faculty Member" /></SelectTrigger>
                <SelectContent>
                  {facultyList.map(f => (
                    <SelectItem key={f.employeeId} value={f.employeeId}>{f.firstName} {f.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room / Lab (Optional)</Label>
              <Input placeholder="e.g. Room 101" className="rounded-xl" value={slotData.room} onChange={e => setSlotData({ ...slotData, room: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="sm:justify-between items-center flex-row">
            <Button variant="ghost" size="sm" onClick={clearSlot} className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-2 rounded-lg">
              <X className="w-4 h-4 mr-2" /> Clear Slot
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsSlotModalOpen(false)}>Cancel</Button>
              <Button className="rounded-xl" onClick={saveSlot}>Save Assignment</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Periods Editor Modal */}
      <Dialog open={isPeriodsModalOpen} onOpenChange={setIsPeriodsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Periods</DialogTitle>
            <DialogDescription>Edit timing slots or add/remove rows. By default there are 6 periods.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {editingPeriods.map((ep, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="px-3 py-2 bg-secondary/50 rounded-lg text-xs font-bold w-20 text-center shrink-0">Per {i + 1}</div>
                <Input value={ep} onChange={(e) => updatePeriodName(i, e.target.value)} className="rounded-lg font-medium" />
                <Button variant="ghost" size="icon" onClick={() => removePeriod(i)} className="text-destructive hover:text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addPeriod} className="mt-2 text-primary border-primary/20 hover:bg-primary/5 border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Period Row
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPeriodsModalOpen(false)}>Cancel</Button>
            <Button onClick={savePeriods}>Save Periods</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Unified Add Modal (Semester/Section/Program) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New {newType.charAt(0).toUpperCase() + newType.slice(1)}</DialogTitle>
            <DialogDescription>Enter the identifier for the new {newType}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newValue">{newType.charAt(0).toUpperCase() + newType.slice(1)} Name/Number</Label>
            <Input
              id="newValue"
              placeholder={`e.g. ${newType === 'semester' ? '9' : newType === 'section' ? 'D' : 'MS-Data'}`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className={cn("mt-2 rounded-xl", newType === 'section' && "uppercase")}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add {newType.charAt(0).toUpperCase() + newType.slice(1)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              Precautionary Warning
            </DialogTitle>
            <DialogDescription className="font-medium text-foreground">
              Are you sure you want to remove {deleteTarget?.type} <span className="font-bold underline">"{deleteTarget?.value}"</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 text-sm text-destructive font-medium">
            This will remove the option from the list. It will not delete existing timetables for this {deleteTarget?.type}, but they may become harder to access from the selector.
          </div>
          <DialogFooter className="mt-2">
            <Button variant="ghost" onClick={() => { setIsDeleteConfirmOpen(false); setDeleteTarget(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Remove it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
