import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const BOT_TOKEN = requireEnv("BOT_TOKEN");
export const TEAM_CHAT_ID = requireEnv("TEAM_CHAT_ID");
export const TEAM_THREAD_ID = process.env.TEAM_THREAD_ID
  ? parseInt(process.env.TEAM_THREAD_ID, 10)
  : undefined;
export const GROQ_API_KEY = requireEnv("GROQ_API_KEY");

export const TEAM_MEMBER_IDS = new Set(
  (process.env.TEAM_MEMBER_IDS ?? "")
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))
);

export function isTeamMember(userId: number): boolean {
  return TEAM_MEMBER_IDS.has(userId);
}
