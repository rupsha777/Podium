import Link from "next/link";
import { getMyAssignments } from "@/actions/judging";
import { getCurrentUser } from "@/lib/session";

export default async function JudgeDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>Please sign in to see your assignments.</p>
      </main>
    );
  }

  const result = await getMyAssignments();
  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>{result.error}</p>
      </main>
    );
  }

  const items = result.data;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">My judging assignments</h1>
      {items.length === 0 ? (
        <p className="opacity-70">Nothing assigned to you yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.assignmentId} className="rounded-lg border border-white/20 p-4">
              <h2 className="text-lg font-semibold">{item.submission.title}</h2>
              {item.submission.description && (
                <p className="mt-1 text-sm opacity-70">{item.submission.description}</p>
              )}
              <Link
                href={`/judge/${item.assignmentId}`}
                className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white"
              >
                Score this project
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}