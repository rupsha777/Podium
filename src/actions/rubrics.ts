"use server";
// src/actions/rubrics.ts

import { db } from "@/db";
import { rubrics, criteria, events } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

// ----------------------------------------------------
// READ: get all rubrics (with criteria) for an event
// ----------------------------------------------------
export async function getRubricsForEvent(eventSlug: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.slug, eventSlug),
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const eventRubrics = await db.query.rubrics.findMany({
      where: eq(rubrics.eventId, event.id),
      orderBy: [asc(rubrics.createdAt)],
      with: {
        criteria: true,
      },
    });

    return { success: true, data: eventRubrics };
  } catch (error: any) {
    console.error("Error fetching rubrics:", error);
    return { success: false, error: error.message || "Failed to fetch rubrics" };
  }
}

// ----------------------------------------------------
// CREATE: a new rubric for an event (admin only)
// ----------------------------------------------------
export async function createRubric(eventSlug: string, name: string) {
  const check = await requireAdmin();
  if (!check.ok) return { success: false, error: check.error };

  try {
    if (!name?.trim()) {
      return { success: false, error: "Rubric name is required" };
    }

    const event = await db.query.events.findFirst({
      where: eq(events.slug, eventSlug),
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const rubricId = crypto.randomUUID();

    await db.insert(rubrics).values({
      id: rubricId,
      eventId: event.id,
      name: name.trim(),
    });

    return { success: true, data: { id: rubricId, eventId: event.id, name: name.trim() } };
  } catch (error: any) {
    console.error("Error creating rubric:", error);
    return { success: false, error: error.message || "Failed to create rubric" };
  }
}

// ----------------------------------------------------
// CREATE: add a criterion to a rubric (admin only)
// ----------------------------------------------------
export async function addCriterion(
  rubricId: string,
  data: { name: string; weight: number; maxScore: number }
) {
  const check = await requireAdmin();
  if (!check.ok) return { success: false, error: check.error };

  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Criterion name is required" };
    }

    const criterionId = crypto.randomUUID();

    await db.insert(criteria).values({
      id: criterionId,
      rubricId,
      name: data.name.trim(),
      weight: data.weight,
      maxScore: data.maxScore,
    });

    return {
      success: true,
      data: { id: criterionId, rubricId, name: data.name.trim(), weight: data.weight, maxScore: data.maxScore },
    };
  } catch (error: any) {
    console.error("Error adding criterion:", error);
    return { success: false, error: error.message || "Failed to add criterion" };
  }
}

// ----------------------------------------------------
// DELETE: remove a criterion (admin only)
// ----------------------------------------------------
export async function deleteCriterion(criterionId: string) {
  const check = await requireAdmin();
  if (!check.ok) return { success: false, error: check.error };

  try {
    await db.delete(criteria).where(eq(criteria.id, criterionId));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting criterion:", error);
    return { success: false, error: error.message || "Failed to delete criterion" };
  }
}