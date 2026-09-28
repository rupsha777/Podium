"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin, requireJudge } from "@/lib/session";

const { users, submissions, judgeAssignments, scores } = schema;

// Admin: invite a judge by email and assign them to every submission in the event
export async function inviteJudge(eventId: string, email: string) {
  const check = await requireAdmin();
  if (!check.ok) return { success: false, error: check.error };

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@")) {
    return { success: false, error: "Enter a valid email" };
  }

  try {
    let [judge] = await db.select().from(users).where(eq(users.email, cleanEmail));

    if (!judge) {
      [judge] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "judge",
        })
        .returning();
    } else if (judge.role === "participant") {
      await db.update(users).set({ role: "judge" }).where(eq(users.id, judge.id));
    }

    const eventSubmissions = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(eq(submissions.eventId, eventId));

    const existing = await db
      .select({ submissionId: judgeAssignments.submissionId })
      .from(judgeAssignments)
      .where(
        and(eq(judgeAssignments.eventId, eventId), eq(judgeAssignments.judgeId, judge.id))
      );
    const alreadyAssigned = new Set(existing.map((e) => e.submissionId));

    const toAdd = eventSubmissions
      .filter((s) => !alreadyAssigned.has(s.id))
      .map((s) => ({
        id: crypto.randomUUID(),
        eventId,
        judgeId: judge.id,
        submissionId: s.id,
      }));

    if (toAdd.length > 0) await db.insert(judgeAssignments).values(toAdd);

    return { success: true, data: { judgeId: judge.id, assigned: toAdd.length } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not invite judge" };
  }
}

// Judge: list my assigned submissions
export async function getMyAssignments() {
  const check = await requireJudge();
  if (!check.ok) return { success: false, error: check.error };

  try {
    const rows = await db
      .select({
        assignmentId: judgeAssignments.id,
        eventId: judgeAssignments.eventId,
        submission: submissions,
      })
      .from(judgeAssignments)
      .innerJoin(submissions, eq(judgeAssignments.submissionId, submissions.id))
      .where(eq(judgeAssignments.judgeId, check.user.id));

    return { success: true, data: rows };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not load assignments" };
  }
}

// Judge: save scores for one assignment (replaces earlier scores)
export async function saveScores(
  assignmentId: string,
  entries: { criterionId: string; value: number; notes?: string }[]
) {
  const check = await requireJudge();
  if (!check.ok) return { success: false, error: check.error };

  if (entries.some((e) => !Number.isInteger(e.value))) {
    return { success: false, error: "Scores must be whole numbers" };
  }

  try {
    const [mine] = await db
      .select()
      .from(judgeAssignments)
      .where(
        and(
          eq(judgeAssignments.id, assignmentId),
          eq(judgeAssignments.judgeId, check.user.id)
        )
      );
    if (!mine) return { success: false, error: "Not your assignment" };

    await db.transaction(async (tx) => {
      await tx.delete(scores).where(eq(scores.judgeAssignmentId, assignmentId));
      if (entries.length > 0) {
        await tx.insert(scores).values(
          entries.map((e) => ({
            id: crypto.randomUUID(),
            judgeAssignmentId: assignmentId,
            criterionId: e.criterionId,
            value: e.value,
            notes: e.notes ?? null,
          }))
        );
      }
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not save scores" };
  }
}