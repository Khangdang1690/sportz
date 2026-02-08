import { db } from "./db.js";
import { players } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  console.log("--- CRUD Demo ---\n");

  // CREATE
  console.log("1. Creating players...");
  const inserted = await db.insert(players).values([
    { name: "LeBron James", sport: "Basketball", team: "Lakers", jerseyNumber: 23 },
    { name: "Lionel Messi", sport: "Football", team: "Inter Miami", jerseyNumber: 10 },
  ]).returning();
  console.log("Inserted:", inserted);

  // READ
  console.log("\n2. Reading all players...");
  const allPlayers = await db.select().from(players);
  console.log("All players:", allPlayers);

  // UPDATE
  console.log("\n3. Updating LeBron's team...");
  const updated = await db.update(players)
    .set({ team: "Cavaliers" })
    .where(eq(players.name, "LeBron James"))
    .returning();
  console.log("Updated:", updated);

  // DELETE
  console.log("\n4. Deleting Messi...");
  const deleted = await db.delete(players)
    .where(eq(players.name, "Lionel Messi"))
    .returning();
  console.log("Deleted:", deleted);

  // Final state
  console.log("\n5. Final state of players table:");
  const remaining = await db.select().from(players);
  console.log("Remaining:", remaining);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
