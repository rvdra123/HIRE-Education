import "server-only";
import { database, initDatabase } from "@/lib/opportunities/db";
import { openaiClient } from "./client";
export async function queueFile(id: string) {
  await initDatabase();
  await database().execute({
    sql: "INSERT OR IGNORE INTO deletion_queue(file_id,created_at) VALUES(?,?)",
    args: [id, new Date().toISOString()],
  });
}
export async function removeFile(id: string) {
  try {
    await openaiClient().files.delete(id, { timeout: 8000 });
    await database().execute({
      sql: "DELETE FROM deletion_queue WHERE file_id=?",
      args: [id],
    });
    return true;
  } catch (e) {
    if (e && typeof e === "object" && "status" in e && e.status === 404) {
      await database().execute({
        sql: "DELETE FROM deletion_queue WHERE file_id=?",
        args: [id],
      });
      return true;
    }
    return false;
  }
}
export async function cleanupFiles() {
  if (!process.env.OPENAI_API_KEY) return;
  await initDatabase();
  const result = await database().execute(
    "SELECT file_id FROM deletion_queue ORDER BY created_at LIMIT 20",
  );
  for (let i = 0; i < result.rows.length; i += 5)
    await Promise.all(
      result.rows.slice(i, i + 5).map((row) => removeFile(String(row.file_id))),
    );
}
