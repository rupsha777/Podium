"use server";

import { db, schema } from "@/db";
import { events, tracks, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import crypto from "crypto";

export async function getEvents() {
  try {
    const allEvents = await db.query.events.findMany({
      orderBy: [desc(events.createdAt)],
      with: {
        tracks: true,
        teams: {
          with: {
            submissions: true,
          },
        },
      },
    });
    return { success: true, data: allEvents };
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message || "Failed to fetch events" };
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.slug, slug),
      with: {
        tracks: true,
        teams: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
            submissions: true,
          },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error: any) {
    console.error("Error fetching event by slug:", error);
    return { success: false, error: error.message || "Failed to fetch event" };
  }
}

export async function getEventById(id: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        tracks: true,
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error: any) {
    console.error("Error fetching event by id:", error);
    return { success: false, error: error.message || "Failed to fetch event" };
  }
}

export async function createEvent(formData: {
  name: string;
  slug?: string;
  description: string;
  submissionDeadline: string; // ISO date string
  tracksList: string[];
  userId?: string;
}) {
  try {
    const finalSlug = slugify(formData.slug?.trim() || formData.name);
    
    // Check slug collision
    const existing = await db.query.events.findFirst({
      where: eq(events.slug, finalSlug),
    });

    if (existing) {
      return { success: false, error: `Slug "${finalSlug}" is already taken. Please choose another.` };
    }

    const eventId = crypto.randomUUID();
    const deadlineDate = new Date(formData.submissionDeadline);

    if (isNaN(deadlineDate.getTime())) {
      return { success: false, error: "Invalid submission deadline date" };
    }

    await db.insert(events).values({
      id: eventId,
      name: formData.name.trim(),
      slug: finalSlug,
      description: formData.description.trim(),
      submissionDeadline: deadlineDate,
      createdBy: formData.userId || null,
    });

    // Insert tracks
    if (formData.tracksList && formData.tracksList.length > 0) {
      const validTracks = formData.tracksList
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      for (const trackName of validTracks) {
        await db.insert(tracks).values({
          id: crypto.randomUUID(),
          eventId: eventId,
          name: trackName,
        });
      }
    } else {
      // Default track if none provided
      await db.insert(tracks).values({
        id: crypto.randomUUID(),
        eventId: eventId,
        name: "General / Main Track",
      });
    }

    revalidatePath("/events");
    revalidatePath("/admin");
    return { success: true, data: { id: eventId, slug: finalSlug } };
  } catch (error: any) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function updateEvent(
  id: string,
  formData: {
    name: string;
    slug: string;
    description: string;
    submissionDeadline: string;
    tracksList: string[];
  }
) {
  try {
    const finalSlug = slugify(formData.slug);
    const deadlineDate = new Date(formData.submissionDeadline);

    if (isNaN(deadlineDate.getTime())) {
      return { success: false, error: "Invalid submission deadline date" };
    }

    // Check slug uniqueness excluding self
    const existing = await db.query.events.findFirst({
      where: eq(events.slug, finalSlug),
    });

    if (existing && existing.id !== id) {
      return { success: false, error: `Slug "${finalSlug}" is already used by another event.` };
    }

    await db
      .update(events)
      .set({
        name: formData.name.trim(),
        slug: finalSlug,
        description: formData.description.trim(),
        submissionDeadline: deadlineDate,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id));

    // Update tracks: Delete existing & re-insert
    if (formData.tracksList) {
      const validTracks = formData.tracksList
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Get existing tracks
      const currentTracks = await db.query.tracks.findMany({
        where: eq(tracks.eventId, id),
      });

      const currentNames = new Set(currentTracks.map((t) => t.name.toLowerCase()));
      
      for (const tName of validTracks) {
        if (!currentNames.has(tName.toLowerCase())) {
          await db.insert(tracks).values({
            id: crypto.randomUUID(),
            eventId: id,
            name: tName,
          });
        }
      }
    }

    revalidatePath(`/events/${finalSlug}`);
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath("/admin");
    return { success: true, data: { id, slug: finalSlug } };
  } catch (error: any) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message || "Failed to update event" };
  }
}
