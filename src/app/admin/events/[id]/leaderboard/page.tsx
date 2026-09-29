import { getLeaderboard } from "@/actions/judging";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;
  const result = await getLeaderboard(eventId);

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>{result.error}</p>
      </main>
    );
  }

  const rows = result.data;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Leaderboard</h1>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/20">
          <tr>
            <th className="py-2 pr-4">Rank</th>
            <th className="py-2 pr-4">Project</th>
            <th className="py-2 pr-4">Avg Score</th>
            <th className="py-2 pr-4">Judged</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.submissionId} className="border-b border-white/10">
              <td className="py-2 pr-4 font-bold">{i + 1}</td>
              <td className="py-2 pr-4">{r.title}</td>
              <td className="py-2 pr-4">
                {r.avgScore !== null ? `${r.avgScore.toFixed(1)}%` : "Not yet scored"}
              </td>
              <td className="py-2 pr-4">
                {r.judgesScored}/{r.judgesAssigned}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}