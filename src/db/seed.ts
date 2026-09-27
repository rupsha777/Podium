import { db } from "./index";
import { users, events, tracks, teams, teamMembers, submissions, submissionTracks } from "./schema";
import crypto from "crypto";

async function seed() {
  console.log("🌱 Starting Podium DB Seed...");

  // 1. Create Users
  const adminId = "usr_admin_01";
  const user1Id = "usr_alice_02";
  const user2Id = "usr_bob_03";
  const user3Id = "usr_charlie_04";

  await db
    .insert(users)
    .values([
      {
        id: adminId,
        email: "admin@podium.build",
        name: "Alex Rivera (Admin)",
        role: "admin",
        emailVerified: true,
      },
      {
        id: user1Id,
        email: "alice@hacker.io",
        name: "Alice Vance",
        role: "participant",
        emailVerified: true,
      },
      {
        id: user2Id,
        email: "bob@builder.dev",
        name: "Bob Stone",
        role: "participant",
        emailVerified: true,
      },
      {
        id: user3Id,
        email: "charlie@coder.net",
        name: "Charlie Hayes",
        role: "participant",
        emailVerified: true,
      },
    ])
    .onConflictDoNothing();

  // 2. Create Events
  const event1Id = "evt_odyssey_2026";
  const deadline1 = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours in future

  await db
    .insert(events)
    .values([
      {
        id: event1Id,
        name: "Odyssey Global AI Hackathon 2026",
        slug: "odyssey-ai-2026",
        description:
          "Build autonomous agents, developer tooling, and decentralized intelligence in 72 hours. Top projects win compute credits and ecosystem grants.",
        submissionDeadline: deadline1,
        createdBy: adminId,
      },
    ])
    .onConflictDoNothing();

  // 3. Create Tracks
  const track1Id = "trk_ai_agents";
  const track2Id = "trk_dev_tools";
  const track3Id = "trk_open_inno";

  await db
    .insert(tracks)
    .values([
      {
        id: track1Id,
        eventId: event1Id,
        name: "Autonomous AI Agents",
        description: "Projects leveraging multi-agent workflows and autonomous reasoning.",
      },
      {
        id: track2Id,
        eventId: event1Id,
        name: "Developer Tooling & DX",
        description: "CLI tools, testing harnesses, and dev productivity multipliers.",
      },
      {
        id: track3Id,
        eventId: event1Id,
        name: "Open Innovation",
        description: "Unconventional, high-impact prototypes pushing boundary limits.",
      },
    ])
    .onConflictDoNothing();

  // 4. Create Teams
  const team1Id = "team_neural_frontier";
  const team2Id = "team_quantum_mesh";

  await db
    .insert(teams)
    .values([
      {
        id: team1Id,
        eventId: event1Id,
        name: "NeuralFrontier",
        joinCode: "NF2026",
      },
      {
        id: team2Id,
        eventId: event1Id,
        name: "QuantumMesh",
        joinCode: "QM9944",
      },
    ])
    .onConflictDoNothing();

  // 5. Team Members
  await db
    .insert(teamMembers)
    .values([
      { teamId: team1Id, userId: user1Id },
      { teamId: team1Id, userId: user2Id },
      { teamId: team2Id, userId: user3Id },
    ])
    .onConflictDoNothing();

  // 6. Submissions
  const sub1Id = "sub_agentic_flow";
  const sub2Id = "sub_mesh_router";

  await db
    .insert(submissions)
    .values([
      {
        id: sub1Id,
        teamId: team1Id,
        eventId: event1Id,
        title: "AgentFlow — Self-Healing CI/CD Pipeline Orchestrator",
        description:
          "AgentFlow autonomously detects failing test suites, analyzes stack traces using deep reasoning models, and automatically opens verified pull requests with regression suites.",
        repoUrl: "https://github.com/example/agentflow",
        demoUrl: "https://agentflow.dev",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "submitted",
        submittedAt: new Date(Date.now() - 3600000), // submitted 1 hour ago
      },
      {
        id: sub2Id,
        teamId: team2Id,
        eventId: event1Id,
        title: "MeshRouter — Zero-Latency Peer Consensus",
        description:
          "Drafting our peer network mesh layer for edge data validation across distributed clusters.",
        repoUrl: "https://github.com/example/meshrouter",
        demoUrl: "https://meshrouter.preview.app",
        status: "draft",
      },
    ])
    .onConflictDoNothing();

  // 7. Submission Tracks
  await db
    .insert(submissionTracks)
    .values([
      { submissionId: sub1Id, trackId: track1Id },
      { submissionId: sub1Id, trackId: track2Id },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
