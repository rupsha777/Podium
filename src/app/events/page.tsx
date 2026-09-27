import Link from "next/link";
import { getEvents } from "@/actions/events";
import { formatDateTime, isDeadlinePassed } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Layers, Calendar, Users, Trophy, ArrowRight, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const result = await getEvents();
  const events = result.success && result.data ? result.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hackathons & Events</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover hackathons, assemble your team, and submit your project before the deadline.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host New Event</span>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-white/10">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Events Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            No hackathons have been created yet. Be the first to create an event!
          </p>
          <Link
            href="/admin/events/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isClosed = isDeadlinePassed(event.submissionDeadline);
            const teamCount = event.teams?.length || 0;
            const submittedCount =
              event.teams?.reduce(
                (acc, t) =>
                  acc + (t.submissions?.filter((s) => s.status === "submitted").length || 0),
                0
              ) || 0;

            return (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <StatusBadge status={isClosed ? "closed" : "open"} />
                    <span className="text-xs text-slate-400 font-mono">
                      {event.tracks?.length || 0} Tracks
                    </span>
                  </div>

                  <Link href={`/events/${event.slug}`}>
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight line-clamp-1">
                      {event.name}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                    {event.description || "No description provided."}
                  </p>

                  {/* Tracks */}
                  {event.tracks && event.tracks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {event.tracks.slice(0, 3).map((track) => (
                        <span
                          key={track.id}
                          className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20 text-[11px] text-indigo-300"
                        >
                          {track.name}
                        </span>
                      ))}
                      {event.tracks.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-400">
                          +{event.tracks.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formatDateTime(event.submissionDeadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{teamCount} Teams</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{submittedCount} Submissions</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-950 group-hover:bg-indigo-600 group-hover:text-white text-slate-300 border border-white/10 group-hover:border-indigo-500 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Enter Hackathon</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
