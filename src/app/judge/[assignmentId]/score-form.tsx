"use client";

import { useState } from "react";
import { saveScores } from "@/actions/judging";

type Criterion = { id: string; name: string; weight: number; maxScore: number };
type Rubric = { id: string; name: string; criteria: Criterion[] };
type Existing = { criterionId: string; value: number; notes: string | null };

export default function ScoreForm({
  assignmentId,
  rubrics,
  existing,
}: {
  assignmentId: string;
  rubrics: Rubric[];
  existing: Existing[];
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(existing.map((s) => [s.criterionId, String(s.value)]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(existing.map((s) => [s.criterionId, s.notes ?? ""]))
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const allCriteria = rubrics.flatMap((r) => r.criteria);

  async function handleSave() {
    setMessage("");
    const entries = [];
    for (const c of allCriteria) {
      const raw = values[c.id];
      if (raw === undefined || raw === "") continue;
      const num = Number(raw);
      if (!Number.isInteger(num) || num < 0 || num > c.maxScore) {
        setMessage(`"${c.name}" must be a whole number from 0 to ${c.maxScore}`);
        return;
      }
      entries.push({ criterionId: c.id, value: num, notes: notes[c.id] || undefined });
    }
    if (entries.length === 0) {
      setMessage("Enter at least one score");
      return;
    }

    setBusy(true);
    const res = await saveScores(assignmentId, entries);
    setMessage(res.success ? "Scores saved." : ("error" in res && res.error) || "Could not save");
    setBusy(false);
  }

  if (allCriteria.length === 0) {
    return <p className="mt-8 opacity-70">No rubric criteria have been set for this event yet.</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      {rubrics.map((r) => (
        <section key={r.id} className="rounded-lg border border-white/20 p-4">
          <h2 className="mb-4 text-xl font-semibold">{r.name}</h2>
          {r.criteria.length === 0 && <p className="opacity-70">No criteria yet.</p>}
          {r.criteria.map((c) => (
            <div key={c.id} className="mb-4">
              <label className="block font-medium">
                {c.name}{" "}
                <span className="text-sm opacity-60">(weight {c.weight}, max {c.maxScore})</span>
              </label>
              <input
                type="number"
                min={0}
                max={c.maxScore}
                value={values[c.id] ?? ""}
                onChange={(e) => setValues({ ...values, [c.id]: e.target.value })}
                className="mt-1 w-24 rounded-lg bg-white px-3 py-2 text-black"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={notes[c.id] ?? ""}
                onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                className="ml-3 w-64 rounded-lg bg-white px-3 py-2 text-black"
              />
            </div>
          ))}
        </section>
      ))}

      <button
        onClick={handleSave}
        disabled={busy}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save scores"}
      </button>
      {message && <p className="text-sm opacity-80">{message}</p>}
    </div>
  );
}