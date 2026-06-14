import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faculty Records — Mathematical and Computing Sciences Unit" },
      {
        name: "description",
        content:
          "Manage and browse faculty records for the Mathematical and Computing Sciences Unit.",
      },
      { property: "og:title", content: "Faculty Records — MCSU" },
      {
        property: "og:description",
        content: "Search, filter, and manage faculty records.",
      },
    ],
  }),
  component: Index,
});

type Status = "Permanent" | "Lecturer";
type Field = "Biochemistry" | "Applied Physics" | "Computer Science";

interface Faculty {
  id: number;
  name: string;
  semester: string;
  rank: string;
  status: Status;
  field: Field;
  remarks: string;
}

const FIELDS: Field[] = ["Biochemistry", "Applied Physics", "Computer Science"];
const STATUSES: Status[] = ["Permanent", "Lecturer"];

const SAMPLE: Faculty[] = [
  { id: 1, name: "Dr. Maria Santos", semester: "1st Sem 2025-2026", rank: "Professor", status: "Permanent", field: "Computer Science", remarks: "Department Chair" },
  { id: 2, name: "Juan Dela Cruz", semester: "1st Sem 2025-2026", rank: "Instructor I", status: "Lecturer", field: "Applied Physics", remarks: "Part-time" },
  { id: 3, name: "Dr. Ana Reyes", semester: "1st Sem 2025-2026", rank: "Associate Professor", status: "Permanent", field: "Biochemistry", remarks: "On research load" },
  { id: 4, name: "Mark Villanueva", semester: "2nd Sem 2024-2025", rank: "Assistant Professor", status: "Permanent", field: "Computer Science", remarks: "" },
  { id: 5, name: "Liza Mendoza", semester: "1st Sem 2025-2026", rank: "Lecturer III", status: "Lecturer", field: "Biochemistry", remarks: "Visiting" },
  { id: 6, name: "Dr. Paolo Aquino", semester: "1st Sem 2025-2026", rank: "Professor", status: "Permanent", field: "Applied Physics", remarks: "" },
];

const STORAGE_KEY = "mcsu.faculty.records.v1";

const emptyForm = (): Omit<Faculty, "id"> => ({
  name: "",
  semester: "",
  rank: "",
  status: "Permanent",
  field: "Computer Science",
  remarks: "",
});

function Index() {
  const [records, setRecords] = useState<Faculty[]>(SAMPLE);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [field, setField] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"name" | "rank">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Faculty, "id">>(emptyForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = records.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (status !== "all" && f.status !== status) return false;
      if (field !== "all" && f.field !== field) return false;
      return true;
    });
    rows.sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey]);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [records, query, status, field, sortKey, sortDir]);

  const toggleSort = (key: "name" | "rank") => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const reset = () => {
    setQuery("");
    setStatus("all");
    setField("all");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      semester: f.semester,
      rank: f.rank,
      status: f.status,
      field: f.field,
      remarks: f.remarks,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rank.trim() || !form.semester.trim()) {
      toast.error("Name, rank, and semester are required.");
      return;
    }
    if (editingId === null) {
      const nextId = records.length ? Math.max(...records.map((r) => r.id)) + 1 : 1;
      setRecords([...records, { id: nextId, ...form }]);
      toast.success("Faculty added.");
    } else {
      setRecords(records.map((r) => (r.id === editingId ? { id: editingId, ...form } : r)));
      toast.success("Faculty updated.");
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId === null) return;
    setRecords(records.filter((r) => r.id !== deleteId));
    toast.success("Faculty removed.");
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b-4 border-accent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                University of the Philippines
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold truncate">
                Faculty Record System
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Mathematical and Computing Sciences Unit
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Faculty
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        <section className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Search
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search faculty by name…"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Field
              </label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger className="mt-1 w-full sm:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Applied Physics">Applied Physics</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </section>

        <section className="bg-card border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <h2 className="font-semibold text-foreground">
              Faculty Records
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/5">
                  <TableHead>
                    <button
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary"
                    >
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort("rank")}
                      className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary"
                    >
                      Rank <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No faculty records match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                      <TableCell>{f.rank}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            f.status === "Permanent"
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary"
                              : "bg-accent text-accent-foreground hover:bg-accent"
                          }
                        >
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.field}</TableCell>
                      <TableCell className="text-muted-foreground">{f.semester}</TableCell>
                      <TableCell className="text-muted-foreground">{f.remarks || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(f)}
                            aria-label={`Edit ${f.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(f.id)}
                            aria-label={`Delete ${f.name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-center text-xs text-muted-foreground">
        © Mathematical and Computing Sciences Unit
      </footer>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "Add Faculty" : "Edit Faculty"}
            </DialogTitle>
            <DialogDescription>
              {editingId === null
                ? "Enter the faculty member's information."
                : "Update the faculty member's information."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Faculty Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dr. Maria Santos"
                required
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rank">Rank</Label>
                <Input
                  id="rank"
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  placeholder="e.g. Assistant Professor"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  placeholder="e.g. 1st Sem 2025-2026"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as Status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Field</Label>
                <Select
                  value={form.field}
                  onValueChange={(v) => setForm({ ...form, field: v as Field })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Optional notes"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingId === null ? "Add Faculty" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete faculty record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
