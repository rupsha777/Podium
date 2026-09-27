import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug } from "@/actions/events";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusBadge, TrackBadge } from "@/components/StatusBadge";
import { formatDateTime, isDeadlinePassed } from "@/lib/utils";
import {
  Users,
  Send,
  Trophy,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const event = result.data;
  const isClosed = isDeadlinePassed(event.submissionDeadline);
  const totalTeams = event.teams?.length || 0;
  const totalSubmissions =
    event.teams?.reduce(
      (acc, t) => acc + (t.submissions?.filter((s) => s.status === "submitted").length || 0),
      0
    ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Event Header Banner */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-glow relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={isClosed ? "closed" : "open"} />
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deadline: {formatDateTime(event.submissionDeadline)}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {event.name}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {event.description || "Welcome to the hackathon! Form a team, build your prototype, and submit before deadline."}
            </p>

            {/* Quick Event Nav Tabs */}
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href={`/events/${event.slug}/teams`}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-white/10 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Teams & Roster ({totalTeams})</span>
              </Link>

              <Link
                href={`/events/${event.slug}/submit`}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Project</span>
              </Link>

              <Link
                href={`/events/${event.slug}/gallery`}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Submissions Gallery ({totalSubmissions})</span>
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end shrink-0">
            <CountdownTimer deadline={event.submissionDeadline} />
          </div>
        </div>
      </div>

      {/* Main Grid: Tracks and Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tracks & Guidelines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracks Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Layers className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white tracking-tight">Prize Tracks</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Submissions can opt-in to one or multiple tracks during project submission.
            </p>

            {event.tracks && event.tracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-white/10 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">{track.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">
                      {track.description || "General prize track category for outstanding submissions."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 text-center text-sm text-slate-500">
                No prize tracks configured yet.
              </div>
            )}
          </div>

          {/* Rules & Submission Guide */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Submission Guidelines</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Every submission must belong to a registered team for this hackathon.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>You can save your progress as a <strong>Draft</strong> at any time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Submitting locks your project for judging once confirmed.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  Editing automatically locks at{" "}
                  <strong className="text-white">{formatDateTime(event.submissionDeadline)}</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right 1 Col: Quick Step-by-Step */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <h3 className="text-base font-bold text-white mb-4">Participant Checklist</h3>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Form or Join a Team</span>
                </div>
                <p className="text-xs text-slate-400 pl-7">
                  Create a team to get a join code or enter your teammate's code.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    href={`/events/${event.slug}/teams`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Go to Team Hub →
                  </Link>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Build & Draft Submission</span>
                </div>
                <p className="text-xs text-slate-400 pl-7">
                  Provide your GitHub repo, demo URL, video pitch, and select tracks.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    href={`/events/${event.slug}/submit`}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Open Submission Form →
                  </Link>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Final Submit & Gallery</span>
                </div>
                <p className="text-xs text-slate-400 pl-7">
                  Review and submit before the deadline to appear in the public gallery.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    href={`/events/${event.slug}/gallery`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    View Gallery →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
