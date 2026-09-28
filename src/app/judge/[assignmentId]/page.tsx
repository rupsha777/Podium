import Link from "next/link";
import { getAssignmentForScoring } from "@/actions/judging";
import ScoreForm from "./score-form";

export default async function ScorePage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const result = await getAssignmentForScoring(assignmentId);

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>{result.error}</p>
        <Link href="/judge" className="underline">Back to dashboard</Link>
      </main>
    );
  }

  const { submission, rubrics, scores } = result.data;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/judge" className="text-sm underline opacity-70">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{submission.title}</h1>
      {submission.description && <p className="mt-2 opacity-80">{submission.description}</p>}

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {submission.repoUrl && (
          <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="underline">Repo</a>
        )}
        {submission.demoUrl && (
          <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="underline">Demo</a>
        )}
        {submission.videoUrl && (
          <a href={submission.videoUrl} target="_blank" rel="noreferrer" className="underline">Video</a>
        )}
      </div>

      <ScoreForm
        assignmentId={assignmentId}
        rubrics={rubrics.map((r) => ({
          id: r.id,
          name: r.name,
          criteria: r.criteria.map((c) => ({
            id: c.id,
            name: c.name,
            weight: c.weight,
            maxScore: c.maxScore,
          })),
        }))}
        existing={scores}
      />
    </main>
  );
}