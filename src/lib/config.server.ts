import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client - values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined - always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here - they ship to the browser.

type RuntimeEnv = Record<string, string | undefined>;

function readServerEnv(name: string) {
  return process.env[name] ?? (import.meta.env as RuntimeEnv)[name];
}

export function getServerConfig() {
  return {
    nodeEnv: readServerEnv("NODE_ENV"),
    supabaseRestUrl: readServerEnv("SUPABASE_REST_URL"),
    supabaseFacultyTable: readServerEnv("SUPABASE_FACULTY_TABLE"),
    supabaseServiceRoleKey: readServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
