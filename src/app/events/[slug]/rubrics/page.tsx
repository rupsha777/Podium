// src/app/events/[slug]/rubrics/page.tsx

import { getRubricsForEvent } from "@/actions/rubrics";
import { RubricBuilder } from "./rubric-builder";

export default async function RubricsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getRubricsForEvent(slug);

  if (!result.success) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-500">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Judging Rubrics</h1>
      <RubricBuilder eventSlug={slug} initialRubrics={result.data ?? []} />
    </div>
  );
}