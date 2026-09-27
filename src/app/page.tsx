import Link from "next/link";
import { getEvents } from "@/actions/events";
import {
  Trophy,
  Users,
  Send,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Code2,
} from "lucide-react";
import { formatDateTime, isDeadlinePassed } from "@/lib/utils";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getEvents();
  const eventsList = result.success && result.data ? result.data : [];
  const activeEvent = eventsList.find((e) => !isDeadlinePassed(e.submissionDeadline)) || eventsList[0];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/5">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6 shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Source • Self-Hostable • 72h Hackathon Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Where breakthrough ideas take the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
              Podium
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The modern participant & submission hub for hackathons. Form teams with instant join
            codes, select prize tracks, submit before the deadline lock, and showcase your work.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/events"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-base shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>Explore Hackathons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/events/new"
              className="px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 font-semibold text-base transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Create an Event</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {eventsList.length}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Active Events
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
                {eventsList.reduce((acc, e) => acc + (e.teams?.length || 0), 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Teams Registered
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400">
                {eventsList.reduce(
                  (acc, e) =>
                    acc +
                    (e.teams?.reduce(
                      (subAcc, t) =>
                        subAcc +
                        (t.submissions?.filter((s) => s.status === "submitted").length || 0),
                      0
                    ) || 0),
                  0
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Submissions
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Docker Up & Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hackathon Spotlight */}
      {activeEvent && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Spotlight Event
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Featured Hackathon
              </h2>
            </div>
            <Link
              href={`/events/${activeEvent.slug}`}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 md:p-10 shadow-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge
                    status={isDeadlinePassed(activeEvent.submissionDeadline) ? "closed" : "open"}
                  />
                  <span className="text-xs text-slate-400">
                    Deadline: {formatDateTime(activeEvent.submissionDeadline)}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {activeEvent.name}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {activeEvent.description || "Join the competition, build your project, and submit for prizes."}
                </p>

                {activeEvent.tracks && activeEvent.tracks.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Prize Tracks:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeEvent.tracks.map((track) => (
                        <span
                          key={track.id}
                          className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs font-medium text-indigo-300"
                        >
                          {track.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${activeEvent.slug}/submit`}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Project</span>
                  </Link>

                  <Link
                    href={`/events/${activeEvent.slug}/teams`}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-white/10 text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Manage Team</span>
                  </Link>

                  <Link
                    href={`/events/${activeEvent.slug}/gallery`}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Project Gallery</span>
                  </Link>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <CountdownTimer deadline={activeEvent.submissionDeadline} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Architecture Cards */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Participant Experience
          </h2>
          <p className="text-3xl font-bold text-white mt-1">Built for speed, clarity, and fairness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Team Formation</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Create a team to generate a unique 6-character join code. Teammates can join instantly with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Server-Enforced Deadlines</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Drafts are autosaved. Once submitted or when the deadline timestamp hits, editing locks server-side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Prize Tracks & Public Gallery</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Tag submissions into multiple sponsor tracks. Automatically showcased in an interactive public gallery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
