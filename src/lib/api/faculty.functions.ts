import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";
import type { FacultyInput, FacultyRecord } from "../supabase";

const facultyInputSchema = z.object({
  name: z.string().min(1),
  semester: z.string().min(1),
  rank: z.string().min(1),
  status: z.enum(["Permanent", "Lecturer"]),
  field: z.enum(["Biochemistry", "Applied Physics", "Computer Science"]),
  remarks: z.string(),
});

const idSchema = z.object({
  id: z.number().int().positive(),
});

const updateFacultySchema = idSchema.extend({
  record: facultyInputSchema,
});

type SupabaseRequestOptions = RequestInit & {
  query?: string;
};

function getSupabaseServerConfig() {
  const config = getServerConfig();
  const restUrl = config.supabaseRestUrl?.replace(/\/$/, "");
  const apiKey = config.supabaseServiceRoleKey;
  const tableName = config.supabaseFacultyTable ?? "faculty_records";

  if (!restUrl || !apiKey) {
    throw new Error(
      "Supabase server config is missing SUPABASE_REST_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { restUrl, apiKey, tableName };
}

async function supabaseRequest<T>({ query = "", ...init }: SupabaseRequestOptions = {}) {
  const { restUrl, apiKey, tableName } = getSupabaseServerConfig();
  const response = await fetch(`${restUrl}/${encodeURIComponent(tableName)}${query}`, {
    ...init,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const listFacultyRecords = createServerFn({ method: "GET" }).handler(async () => {
  return supabaseRequest<FacultyRecord[]>({
    query: "?select=*&order=name.asc",
  });
});

export const createFacultyRecord = createServerFn({ method: "POST" })
  .validator(facultyInputSchema)
  .handler(async ({ data }) => {
    const [created] = await supabaseRequest<FacultyRecord[]>({
      query: "?select=*",
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(data satisfies FacultyInput),
    });

    if (!created) throw new Error("Supabase did not return the created faculty record.");
    return created;
  });

export const updateFacultyRecord = createServerFn({ method: "POST" })
  .validator(updateFacultySchema)
  .handler(async ({ data }) => {
    const [updated] = await supabaseRequest<FacultyRecord[]>({
      query: `?id=eq.${encodeURIComponent(data.id)}&select=*`,
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(data.record),
    });

    if (!updated) throw new Error("Supabase did not return the updated faculty record.");
    return updated;
  });

export const deleteFacultyRecord = createServerFn({ method: "POST" })
  .validator(idSchema)
  .handler(async ({ data }) => {
    await supabaseRequest<void>({
      query: `?id=eq.${encodeURIComponent(data.id)}`,
      method: "DELETE",
    });

    return { ok: true };
  });
