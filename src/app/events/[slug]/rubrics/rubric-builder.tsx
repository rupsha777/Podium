// src/app/events/[slug]/rubrics/rubric-builder.tsx
"use client";

import { useState, useTransition } from "react";
import { createRubric, addCriterion, deleteCriterion } from "@/actions/rubrics";

type Criterion = {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
};

type Rubric = {
  id: string;
  name: string;
  criteria: Criterion[];
};

export function RubricBuilder({
  eventSlug,
  initialRubrics,
}: {
  eventSlug: string;
  initialRubrics: Rubric[];
}) {
  const [rubrics, setRubrics] = useState<Rubric[]>(initialRubrics);
  const [newRubricName, setNewRubricName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateRubric() {
    if (!newRubricName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createRubric(eventSlug, newRubricName.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to create rubric");
        return;
      }
      setRubrics((prev) => [...prev, { ...result.data!, criteria: [] }]);
      setNewRubricName("");
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="New rubric name (e.g. General Judging)"
          value={newRubricName}
          onChange={(e) => setNewRubricName(e.target.value)}
        />
        <button
          onClick={handleCreateRubric}
          disabled={isPending}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          Add rubric
        </button>
      </div>

      {rubrics.map((rubric) => (
        <RubricCard
          key={rubric.id}
          rubric={rubric}
          onCriterionAdded={(criterion) =>
            setRubrics((prev) =>
              prev.map((r) =>
                r.id === rubric.id
                  ? { ...r, criteria: [...r.criteria, criterion] }
                  : r
              )
            )
          }
          onCriterionDeleted={(criterionId) =>
            setRubrics((prev) =>
              prev.map((r) =>
                r.id === rubric.id
                  ? {
                      ...r,
                      criteria: r.criteria.filter((c) => c.id !== criterionId),
                    }
                  : r
              )
            )
          }
        />
      ))}
    </div>
  );
}

function RubricCard({
  rubric,
  onCriterionAdded,
  onCriterionDeleted,
}: {
  rubric: Rubric;
  onCriterionAdded: (c: Criterion) => void;
  onCriterionDeleted: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(1);
  const [maxScore, setMaxScore] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addCriterion(rubric.id, {
        name: name.trim(),
        weight,
        maxScore,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to add criterion");
        return;
      }
      onCriterionAdded(result.data!);
      setName("");
      setWeight(1);
      setMaxScore(10);
    });
  }

  function handleDelete(criterionId: string) {
    startTransition(async () => {
      const result = await deleteCriterion(criterionId);
      if (result.success) {
        onCriterionDeleted(criterionId);
      }
    });
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-medium text-lg mb-3">{rubric.name}</h2>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <ul className="mb-4 divide-y">
        {rubric.criteria.map((c) => (
          <li key={c.id} className="flex justify-between items-center py-2">
            <span>
              {c.name}{" "}
              <span className="text-gray-500 text-sm">
                (weight {c.weight}, max {c.maxScore})
              </span>
            </span>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
        {rubric.criteria.length === 0 && (
          <li className="text-gray-400 text-sm py-2">No criteria yet.</li>
        )}
      </ul>

      <div className="flex gap-2 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500">Criterion name</label>
          <input
            className="border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Weight</label>
          <input
            type="number"
            step="0.1"
            className="border rounded px-2 py-1 w-20"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Max score</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="bg-gray-800 text-white rounded px-3 py-1.5 disabled:opacity-50"
        >
          Add criterion
        </button>
      </div>
    </div>
  );
}