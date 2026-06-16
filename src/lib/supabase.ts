export type FacultyStatus = "Permanent" | "Lecturer";
export type FacultyField = "Biochemistry" | "Applied Physics" | "Computer Science";

export interface FacultyRecord {
  id: number;
  name: string;
  semester: string;
  rank: string;
  status: FacultyStatus;
  field: FacultyField;
  remarks: string;
}

export type FacultyInput = Omit<FacultyRecord, "id">;
