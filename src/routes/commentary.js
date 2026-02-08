import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { commentary } from "../db/schema.js";
import { db } from "../db/db.js";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid match ID.", details: paramsParsed.error.issues });
  }

  const queryParsed = listCommentaryQuerySchema.safeParse(req.query);

  if (!queryParsed.success) {
    return res.status(400).json({ error: "Invalid query.", details: queryParsed.error.issues });
  }

  const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, paramsParsed.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: "Failed to list commentary." });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid match ID.", details: paramsParsed.error.issues });
  }

  const bodyParsed = createCommentarySchema.safeParse(req.body);

  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Invalid payload.", details: bodyParsed.error.issues });
  }

  try {
    const [entry] = await db.insert(commentary).values({
      matchId: paramsParsed.data.id,
      minutes: bodyParsed.data.minutes,
      sequence: bodyParsed.data.sequence,
      period: bodyParsed.data.period,
      eventType: bodyParsed.data.eventType,
      actor: bodyParsed.data.actor,
      team: bodyParsed.data.team,
      message: bodyParsed.data.message,
      metadata: bodyParsed.data.metadata ?? null,
      tags: bodyParsed.data.tags ? JSON.stringify(bodyParsed.data.tags) : null,
    }).returning();

    res.status(201).json({ data: entry });
  } catch (e) {
    res.status(500).json({ error: "Failed to create commentary.", details: JSON.stringify(e) });
  }
});
