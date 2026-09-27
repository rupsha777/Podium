"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { saveOrUpdateSubmission } from "@/actions/submissions";
import { isDeadlinePassed, formatDateTime } from "@/lib/utils";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusBadge } from "@/components/StatusBadge";
import { AuthModal } from "@/components/AuthModal";
import {
  Send,
  Save,
  Lock,
  Github,
  Globe,
  Video,
  AlertCircle,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

interface SubmissionFormClientProps {
  event: any;
}

export function SubmissionFormClient({ event }: SubmissionFormClientProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [isPending, startTransition] = useTransition();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Check user team in this event
  const currentUserId = session?.user?.id;
  const userTeam = event.teams?.find((t: any) =>
    t.members?.some((m: any) => m.userId === currentUserId)
  );

  const existingSubmission = userTeam?.submissions?.[0];

  // Form State
  const [title, setTitle] = useState(existingSubmission?.title || "");
  const [description, setDescription] = useState(existingSubmission?.description || "");
  const [repoUrl, setRepoUrl] = useState(existingSubmission?.repoUrl || "");
  const [demoUrl, setDemoUrl] = useState(existingSubmission?.demoUrl || "");
  const [videoUrl, setVideoUrl] = useState(existingSubmission?.videoUrl || "");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Update existing state if team loaded
  useEffect(() => {
    if (existingSubmission) {
      setTitle(existingSubmission.title || "");
      setDescription(existingSubmission.description || "");
      setRepoUrl(existingSubmission.repoUrl || "");
      setDemoUrl(existingSubmission.demoUrl || "");
      setVideoUrl(existingSubmission.videoUrl || "");
      if (existingSubmission.submissionTracks) {
        setSelectedTracks(existingSubmission.submissionTracks.map((st: any) => st.trackId || st.track?.id));
      }
    }
  }, [existingSubmission]);

  const isExpired = isDeadlinePassed(event.submissionDeadline);
  const isSubmitted = existingSubmission?.status === "submitted";
  const isLocked = isExpired || isSubmitted;

  const handleTrackToggle = (trackId: string) => {
    if (isLocked) return;
    setSelectedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleSave = (targetStatus: "draft" | "submitted") => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    if (!userTeam) {
      setStatusMessage({
        type: "error",
        text: "You must create or join a team before submitting a project.",
      });
      return;
    }

    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a project title." });
      return;
    }

    if (targetStatus === "submitted" && !repoUrl.trim() && !demoUrl.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please provide at least a GitHub repository or Live Demo URL for final submission.",
      });
      return;
    }

    setStatusMessage(null);

    startTransition(async () => {
      const res = await saveOrUpdateSubmission({
        eventId: event.id,
        teamId: userTeam.id,
        userId: session.user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        trackIds: selectedTracks,
        status: targetStatus,
      });

      if (!res.success) {
        setStatusMessage({ type: "error", text: res.error || "Failed to save submission." });
      } else {
        setStatusMessage({
          type: "success",
          text:
            targetStatus === "submitted"
              ? "🚀 Project submitted successfully! It is now locked and visible in the public gallery."
              : "💾 Draft saved successfully.",
        });
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href={`/events/${event.slug}`} className="hover:text-white transition-colors">
          ← Back to {event.name}
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-1">
            <Send className="w-4 h-4" />
            <span>Submission Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Submission</h1>
          <p className="text-sm text-slate-400 mt-1">
            Submit your hackathon project for judging and track awards.
          </p>
        </div>

        <CountdownTimer deadline={event.submissionDeadline} compact />
      </div>

      {/* Lock Notice if applicable */}
      {isExpired && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <Lock className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold">Submission Deadline Passed:</span> Submissions are now
            strictly locked. Edits can no longer be saved.
          </div>
        </div>
      )}

      {isSubmitted && !isExpired && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <span className="font-bold">Project Submitted & Locked for Judging.</span> View your
              project in the{" "}
              <Link
                href={`/events/${event.slug}/gallery`}
                className="underline font-semibold hover:text-white"
              >
                Public Gallery
              </Link>
              .
            </div>
          </div>
          <StatusBadge status="submitted" />
        </div>
      )}

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Must belong to a team notice */}
      {!sessionLoading && session?.user && !userTeam && (
        <div className="mb-8 p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Team Required to Submit</span>
            </h3>
            <p className="text-xs text-slate-300">
              All submissions are tied to a team. Please create or join a team first.
            </p>
          </div>
          <Link
            href={`/events/${event.slug}/teams`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all shrink-0"
          >
            Go to Team Hub →
          </Link>
        </div>
      )}

      {/* Submission Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-glow space-y-6">
        {/* Team banner if user has team */}
        {userTeam && (
          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>
                Submitting on behalf of team: <strong className="text-white">{userTeam.name}</strong>
              </span>
            </div>
            <span className="text-slate-400">({userTeam.members?.length || 1} builders)</span>
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-5">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Autonomous Fleet Coordinator"
              className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Project Description & Pitch
            </label>
            <textarea
              rows={5}
              disabled={isLocked}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does, the problem it solves, how you built it, and challenges you ran into..."
              className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub Repository</span>
              </label>
              <input
                type="url"
                disabled={isLocked}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Demo URL</span>
              </label>
              <input
                type="url"
                disabled={isLocked}
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.vercel.app"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>Video Pitch URL</span>
              </label>
              <input
                type="url"
                disabled={isLocked}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Prize Track Selection (Multi-select) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Select Prize Tracks (Multi-Select)</span>
            </label>

            {event.tracks && event.tracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.tracks.map((track: any) => {
                  const isChecked = selectedTracks.includes(track.id);
                  return (
                    <label
                      key={track.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-950/50 border-indigo-500/50 text-white"
                          : "bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20"
                      } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        disabled={isLocked}
                        checked={isChecked}
                        onChange={() => handleTrackToggle(track.id)}
                        className="mt-0.5 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{track.name}</span>
                        {track.description && (
                          <span className="text-xs text-slate-400 mt-0.5">
                            {track.description}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500">No specific prize tracks for this event.</div>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {isLocked
                ? "Editing is locked for this submission."
                : "Drafts can be modified until final submission or deadline."}
            </span>
          </div>

          {!isLocked && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isPending || !userTeam}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave("submitted")}
                disabled={isPending || !userTeam}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Final Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
