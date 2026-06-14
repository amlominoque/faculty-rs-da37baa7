import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Search, ArrowUpDown } from "lucide-react";

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

const SAMPLE: Faculty[] = [
  { id: 1, name: "Dr. Maria Santos", semester: "1st Sem 2025-2026", rank: "Professor", status: "Permanent", field: "Computer Science", remarks: "Department Chair" },
  { id: 2, name: "Juan Dela Cruz", semester: "1st Sem 2025-2026", rank: "Instructor I", status: "Lecturer", field: "Applied Physics", remarks: "Part-time" },
  { id: 3, name: "Dr. Ana Reyes", semester: "1st Sem 2025-2026", rank: "Associate Professor", status: "Permanent", field: "Biochemistry", remarks: "On research load" },
  { id: 4, name: "Mark Villanueva", semester: "2nd Sem 2024-2025", rank: "Assistant Professor", status: "Permanent", field: "Computer Science", remarks: "" },
  { id: 5, name: "Liza Mendoza", semester: "1st Sem 2025-2026", rank: "Lecturer III", status: "Lecturer", field: "Biochemistry", remarks: "Visiting" },
  { id: 6, name: "Dr. Paolo Aquino", semester: "1st Sem 2025-2026", rank: "Professor", status: "Permanent", field: "Applied Physics", remarks: "" },
];

function Index() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [field, setField] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"name" | "rank">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = SAMPLE.filter((f) => {
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
  }, [query, status, field, sortKey, sortDir]);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b-4 border-accent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            University of the Philippines
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
            Faculty Record System
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Mathematical and Computing Sciences Unit
          </p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
    </div>
  );
}
