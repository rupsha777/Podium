"use server";

import { db } from "@/db";
import { teams, teamMembers, users, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateJoinCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createTeam(eventId: string, teamName: string, userId: string) {
  try {
    if (!teamName || teamName.trim().length === 0) {
      return { success: false, error: "Team name is required" };
    }

    if (!userId) {
      return { success: false, error: "User is not authenticated" };
    }

    // Check if user is already in a team for this event
    const existingMembership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      with: {
        team: true,
      },
    });

    if (existingMembership && existingMembership.team.eventId === eventId) {
      return {
        success: false,
        error: `You are already a member of team "${existingMembership.team.name}" in this hackathon.`,
      };
    }

    // Generate unique join code
    let joinCode = generateJoinCode(6);
    let codeExists = await db.query.teams.findFirst({
      where: eq(teams.joinCode, joinCode),
    });

    while (codeExists) {
      joinCode = generateJoinCode(6);
      codeExists = await db.query.teams.findFirst({
        where: eq(teams.joinCode, joinCode),
      });
    }

    const teamId = crypto.randomUUID();

    // 1. Create team
    await db.insert(teams).values({
      id: teamId,
      eventId: eventId,
      name: teamName.trim(),
      joinCode: joinCode,
    });

    // 2. Add creator to team_members
    await db.insert(teamMembers).values({
      teamId: teamId,
      userId: userId,
    });

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (event) {
      revalidatePath(`/events/${event.slug}`);
      revalidatePath(`/events/${event.slug}/teams`);
      revalidatePath(`/events/${event.slug}/submit`);
    }

    return { success: true, data: { teamId, joinCode, teamName: teamName.trim() } };
  } catch (error: any) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message || "Failed to create team" };
  }
}

export async function joinTeam(joinCode: string, userId: string) {
  try {
    const cleanCode = joinCode.trim().toUpperCase();

    if (!cleanCode) {
      return { success: false, error: "Join code is required" };
    }

    if (!userId) {
      return { success: false, error: "User is not authenticated" };
    }

    // Find team by join code
    const targetTeam = await db.query.teams.findFirst({
      where: eq(teams.joinCode, cleanCode),
      with: {
        event: true,
        members: true,
      },
    });

    if (!targetTeam) {
      return { success: false, error: "Invalid join code. No matching team found." };
    }

    // Check if user is already in this team
    const alreadyInTeam = targetTeam.members.some((m) => m.userId === userId);
    if (alreadyInTeam) {
      return { success: true, data: { teamId: targetTeam.id, eventSlug: targetTeam.event.slug } };
    }

    // Check if user is in another team for the same event
    const existingMembership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      with: {
        team: true,
      },
    });

    if (existingMembership && existingMembership.team.eventId === targetTeam.eventId) {
      return {
        success: false,
        error: `You are already on team "${existingMembership.team.name}" in this event. Leave that team first to join a new one.`,
      };
    }

    // Add user to team_members
    await db.insert(teamMembers).values({
      teamId: targetTeam.id,
      userId: userId,
    });

    revalidatePath(`/events/${targetTeam.event.slug}`);
    revalidatePath(`/events/${targetTeam.event.slug}/teams`);
    revalidatePath(`/events/${targetTeam.event.slug}/submit`);

    return {
      success: true,
      data: {
        teamId: targetTeam.id,
        teamName: targetTeam.name,
        eventSlug: targetTeam.event.slug,
      },
    };
  } catch (error: any) {
    console.error("Error joining team:", error);
    return { success: false, error: error.message || "Failed to join team" };
  }
}

export async function getUserTeamForEvent(eventId: string, userId: string) {
  try {
    if (!userId) return { success: true, data: null };

    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      with: {
        team: {
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
        },
      },
    });

    if (membership && membership.team.eventId === eventId) {
      return { success: true, data: membership.team };
    }

    return { success: true, data: null };
  } catch (error: any) {
    console.error("Error getting user team:", error);
    return { success: false, error: error.message };
  }
}

export async function getEventTeams(eventId: string) {
  try {
    const allTeams = await db.query.teams.findMany({
      where: eq(teams.eventId, eventId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        submissions: true,
      },
    });

    return { success: true, data: allTeams };
  } catch (error: any) {
    console.error("Error fetching event teams:", error);
    return { success: false, error: error.message };
  }
}
