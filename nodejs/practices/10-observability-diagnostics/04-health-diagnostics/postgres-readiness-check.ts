type QueryRunner = { query(sql: string): Promise<unknown> };
export async function checkPostgresReadiness(database: QueryRunner): Promise<"ready" | "unavailable"> {
  try { await database.query("SELECT 1"); return "ready"; } catch { return "unavailable"; }
}
console.log(await checkPostgresReadiness({ query: async () => 1 }));
