"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteJudge } from "@/actions/judging";

export default function JudgeInviteForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleInvite() {
    setBusy(true);
    setMessage("");
    const res = await inviteJudge(eventId, email);
    if (res.success && "data" in res && res.data) {
      setMessage(`Judge added. ${res.data.assigned} new submissions assigned.`);
      setEmail("");
      router.refresh();
    } else {
      setMessage(("error" in res && res.error) || "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="judge@example.com"
          className="flex-1 rounded-lg bg-white px-4 py-3 text-black"
        />
        <button
          onClick={handleInvite}
          disabled={busy || !email}
          className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {busy ? "Adding..." : "Add judge"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm opacity-80">{message}</p>}
    </div>
  );
}