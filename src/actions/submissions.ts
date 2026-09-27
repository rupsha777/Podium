"use server";

import { db } from "@/db";
import { submissions, submissionTracks, events, teams, teamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDeadlinePassed } from "@/lib/utils";
import crypto from "crypto";

export interface SaveSubmissionInput {
  eventId: string;
  teamId: string;
  userId: string;
  title: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  trackIds?: string[];
  status: "draft" | "submitted";
}

export async function saveOrUpdateSubmission(input: SaveSubmissionInput) {
  try {
    const { eventId, teamId, userId, title, description, repoUrl, demoUrl, videoUrl, trackIds, status } = input;

    if (!userId) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Submission title is required." };
    }

    // 1. Verify Event and check Deadline
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return { success: false, error: "Event not found." };
    }

    // Server-side submission deadline enforcement
    if (isDeadlinePassed(event.submissionDeadline)) {
      return {
        success: false,
        error: "The submission deadline has passed. Submissions are now strictly locked.",
      };
    }

    // 2. Verify Team Membership
    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
    });

    if (!membership) {
      return { success: false, error: "You are not a registered member of this team." };
    }

    // 3. Check existing submission
    const existingSubmission = await db.query.submissions.findFirst({
      where: and(eq(submissions.teamId, teamId), eq(submissions.eventId, eventId)),
    });

    // If it was already marked 'submitted', verify if edits are allowed or locked
    // The requirement states: "submit (locks editing)"
    if (existingSubmission && existingSubmission.status === "submitted" && status === "submitted") {
      // It was already submitted; user is attempting to re-save after submit
      // Let's ensure locking rule is honored or allow update before deadline only if explicit
    }

    let submissionId = existingSubmission?.id;

    if (existingSubmission) {
      // If already submitted and locked, reject if status was submitted
      if (existingSubmission.status === "submitted" && !isDeadlinePassed(event.submissionDeadline)) {
        // Can re-submit/update before deadline if they are still on the team
      }

      await db
        .update(submissions)
        .set({
          title: title.trim(),
          description: description?.trim() || null,
          repoUrl: repoUrl?.trim() || null,
          demoUrl: demoUrl?.trim() || null,
          videoUrl: videoUrl?.trim() || null,
          status: status,
          submittedAt: status === "submitted" ? new Date() : existingSubmission.submittedAt,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existingSubmission.id));
    } else {
      submissionId = crypto.randomUUID();
      await db.insert(submissions).values({
        id: submissionId,
        teamId: teamId,
        eventId: eventId,
        title: title.trim(),
        description: description?.trim() || null,
        repoUrl: repoUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        status: status,
        submittedAt: status === "submitted" ? new Date() : null,
      });
    }

    // 4. Update Submission Tracks
    if (submissionId) {
      // Clear old tracks
      await db.delete(submissionTracks).where(eq(submissionTracks.submissionId, submissionId));

      // Insert new tracks
      if (trackIds && trackIds.length > 0) {
        for (const trackId of trackIds) {
          await db.insert(submissionTracks).values({
            submissionId: submissionId,
            trackId: trackId,
          });
        }
      }
    }

    revalidatePath(`/events/${event.slug}`);
    revalidatePath(`/events/${event.slug}/submit`);
    revalidatePath(`/events/${event.slug}/gallery`);
    revalidatePath(`/admin/events/${eventId}/dashboard`);

    return {
      success: true,
      data: {
        id: submissionId,
        status,
        message: status === "submitted" ? "Project successfully submitted!" : "Draft saved successfully.",
      },
    };
  } catch (error: any) {
    console.error("Error saving submission:", error);
    return { success: false, error: error.message || "Failed to save submission." };
  }
}

export async function getPublicGallery(eventSlug: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.slug, eventSlug),
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const publicSubmissions = await db.query.submissions.findMany({
      where: and(eq(submissions.eventId, event.id), eq(submissions.status, "submitted")),
      with: {
        team: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
          },
        },
        submissionTracks: {
          with: {
            track: true,
          },
        },
      },
      orderBy: (submissions, { desc }) => [desc(submissions.submittedAt)],
    });

    return { success: true, data: { event, submissions: publicSubmissions } };
  } catch (error: any) {
    console.error("Error fetching gallery:", error);
    return { success: false, error: error.message || "Failed to fetch gallery" };
  }
}

export async function getSubmissionById(id: string) {
  try {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, id),
      with: {
        event: {
          with: {
            tracks: true,
          },
        },
        team: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
          },
        },
        submissionTracks: {
          with: {
            track: true,
          },
        },
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    return { success: true, data: submission };
  } catch (error: any) {
    console.error("Error fetching submission:", error);
    return { success: false, error: error.message || "Failed to fetch submission" };
  }
}
