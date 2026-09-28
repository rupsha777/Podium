import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getJudgesForEvent } from "@/actions/judging";
import { requireAdmin } from "@/lib/session";
import JudgeInviteForm from "./judge-invite-form";

export default async function JudgesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const check = await requireAdmin();
  if (!check.ok) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>{check.error}. Please sign in as an admin.</p>
      </main>
    );
  }

  const event = await db.query.events.findFirst({ where: eq(events.slug, slug) });
  if (!event) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>Event not found.</p>
      </main>
    );
  }

  const result = await getJudgesForEvent(event.id);
  const judges = result.success && result.data ? result.data : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Judges</h1>
      <JudgeInviteForm eventId={event.id} />

      <h2 className="mb-3 mt-8 text-xl font-semibold">Invited judges</h2>
      {judges.length === 0 ? (
        <p className="opacity-70">No judges yet.</p>
      ) : (
        <ul className="space-y-2">
          {judges.map((j) => (
            <li key={j.judgeId} className="rounded-lg border border-white/20 p-3">
              {j.email}{" "}
              <span className="opacity-60">({j.count} submissions assigned)</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}