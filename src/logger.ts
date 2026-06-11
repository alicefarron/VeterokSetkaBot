import { appendFileSync } from "fs";
import { join } from "path";

const LOG_FILE = join(process.cwd(), "gossip.log");

export function logSender(gossipId: string, userId: number, username: string | undefined, firstName: string, text: string): void {
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    gossipId,
    userId,
    username: username ?? null,
    firstName,
    text,
  });
  appendFileSync(LOG_FILE, entry + "\n", "utf8");
}
