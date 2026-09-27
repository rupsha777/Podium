"use server";

import { db } from "@/db";
import { events, teams, submissions, users, tracks, teamMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAdminDashboardData(eventId: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        tracks: true,
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Fetch all teams for the event with members and submissions
    const eventTeams = await db.query.teams.findMany({
      where: eq(teams.eventId, eventId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        submissions: {
          with: {
            submissionTracks: {
              with: {
                track: true,
              },
            },
          },
        },
      },
      orderBy: [desc(teams.createdAt)],
    });

    // Summary statistics
    const totalTeams = eventTeams.length;
    const totalParticipants = eventTeams.reduce((acc, t) => acc + t.members.length, 0);
    const submittedCount = eventTeams.filter((t) =>
      t.submissions.some((s) => s.status === "submitted")
    ).length;
    const draftCount = eventTeams.filter(
      (t) =>
        t.submissions.length > 0 &&
        !t.submissions.some((s) => s.status === "submitted")
    ).length;
    const unstartedCount = eventTeams.filter((t) => t.submissions.length === 0).length;

    return {
      success: true,
      data: {
        event,
        teams: eventTeams,
        stats: {
          totalTeams,
          totalParticipants,
          submittedCount,
          draftCount,
          unstartedCount,
          submissionRate:
            totalTeams > 0 ? Math.round((submittedCount / totalTeams) * 100) : 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin dashboard data:", error);
    return { success: false, error: error.message || "Failed to load dashboard data" };
  }
}
