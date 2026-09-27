"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { createEvent, updateEvent } from "@/actions/events";
import { slugify } from "@/lib/utils";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";

interface EventFormClientProps {
  isEditing: boolean;
  initialData?: any;
}

export function EventFormClient({ isEditing, initialData }: EventFormClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Format initial ISO date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (d?: string | Date) => {
    if (!d) {
      // Default to 72 hours from now
      const defaultDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
      return defaultDate.toISOString().slice(0, 16);
    }
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [deadline, setDeadline] = useState(formatForInput(initialData?.submissionDeadline));
  const [tracksList, setTracksList] = useState<string[]>(
    initialData?.tracks?.map((t: any) => t.name) || [
      "AI & Machine Learning",
      "Open Innovation",
      "Web3 & Decentralized",
    ]
  );
  const [newTrackName, setNewTrackName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  const addTrack = () => {
    if (!newTrackName.trim()) return;
    if (tracksList.includes(newTrackName.trim())) return;
    setTracksList([...tracksList, newTrackName.trim()]);
    setNewTrackName("");
  };

  const removeTrack = (indexToRemove: number) => {
    setTracksList(tracksList.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Event name is required.");
      return;
    }

    if (!deadline) {
      setErrorMessage("Submission deadline is required.");
      return;
    }

    const isoDeadline = new Date(deadline).toISOString();

    startTransition(async () => {
      if (isEditing && initialData?.id) {
        const res = await updateEvent(initialData.id, {
          name,
          slug: slug || slugify(name),
          description,
          submissionDeadline: isoDeadline,
          tracksList,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Failed to update event.");
        } else {
          router.push("/admin");
          router.refresh();
        }
      } else {
        const res = await createEvent({
          name,
          slug: slug || slugify(name),
          description,
          submissionDeadline: isoDeadline,
          tracksList,
          userId: session?.user?.id,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Failed to create event.");
        } else {
          router.push("/admin");
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Event Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {isEditing ? `Edit Event: ${initialData?.name}` : "Create a New Hackathon"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure event details, submission deadline locks, and sponsor prize tracks.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-glow space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Event Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Odyssey AI Hackathon 2026"
              className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              URL Slug <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-slate-500 font-mono">/events/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="odyssey-ai-2026"
                className="w-full pl-20 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Description & Prompt
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the hackathon theme, rules, prizes, and instructions for builders..."
            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submission Deadline */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Submission Deadline (Auto-Lock Timestamp)</span>
            <span className="text-rose-400">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full sm:w-80 px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Submissions will automatically lock server-side when this deadline is reached.
          </p>
        </div>

        {/* Prize Tracks Manager */}
        <div className="pt-4 border-t border-white/10">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Prize Tracks</span>
          </label>

          {/* Add Track Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTrack();
                }
              }}
              placeholder="e.g. Best Developer Tool, Best Social Impact"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={addTrack}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Track</span>
            </button>
          </div>

          {/* List of Tracks */}
          <div className="flex flex-wrap gap-2">
            {tracksList.map((track, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-200 text-xs font-medium"
              >
                <span>{track}</span>
                <button
                  type="button"
                  onClick={() => removeTrack(idx)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Save Changes" : "Create Event"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
