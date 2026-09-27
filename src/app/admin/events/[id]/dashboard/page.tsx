import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminDashboardData } from "@/actions/admin";
import { formatDateTime, isDeadlinePassed } from "@/lib/utils";
import { StatusBadge, TrackBadge } from "@/components/StatusBadge";
import {
  ShieldCheck,
  Users,
  Trophy,
  FileEdit,
  Clock,
  ArrowLeft,
  Github,
  Globe,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventDashboardPage({ params }: DashboardPageProps) {
  const { id } = await params;
  const result = await getAdminDashboardData(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { event, teams, stats } = result.data;
  const isClosed = isDeadlinePassed(event.submissionDeadline);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Event Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {event.name} — Submissions & Teams
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status of all participating teams, draft states, and final submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Edit Event
          </Link>
          <Link
            href={`/events/${event.slug}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-1.5"
          >
            <span>Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-glow">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Teams</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.totalTeams}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.totalParticipants} builders</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow-glow">
          <div className="flex items-center justify-between text-emerald-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Submitted</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.submittedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ready for judging</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-glow">
          <div className="flex items-center justify-between text-amber-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Drafts</span>
            <FileEdit className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats.draftCount}</div>
          <div className="text-xs text-slate-500 mt-1">In progress</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-glow">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Unstarted</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-400">{stats.unstartedCount}</div>
          <div className="text-xs text-slate-500 mt-1">No submission yet</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow-glow">
          <div className="flex items-center justify-between text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Completion</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{stats.submissionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Submission rate</div>
        </div>
      </div>

      {/* Submissions & Teams Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-glow">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Teams & Submissions ({teams.length})</h2>
          <span className="text-xs text-slate-400 font-mono">
            Deadline: {formatDateTime(event.submissionDeadline)}
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No teams have registered for this event yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Team & Code</th>
                  <th className="py-4 px-6 font-semibold">Roster</th>
                  <th className="py-4 px-6 font-semibold">Project Title</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Tracks</th>
                  <th className="py-4 px-6 font-semibold">Submitted At</th>
                  <th className="py-4 px-6 font-semibold text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((team: any) => {
                  const sub = team.submissions?.[0];
                  return (
                    <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Team Name & Code */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{team.name}</span>
                          <span className="text-xs text-cyan-400 font-mono">
                            Code: {team.joinCode}
                          </span>
                        </div>
                      </td>

                      {/* Roster */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 max-w-[180px]">
                          <span className="text-xs text-slate-400">
                            {team.members?.length || 0} members
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {team.members?.slice(0, 3).map((m: any) => (
                              <span
                                key={m.userId}
                                className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 truncate max-w-[80px]"
                                title={m.user?.name || m.user?.email}
                              >
                                {m.user?.name || m.user?.email?.split("@")[0]}
                              </span>
                            ))}
                            {team.members?.length > 3 && (
                              <span className="text-[10px] text-slate-500">
                                +{team.members.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Project Title */}
                      <td className="py-4 px-6">
                        {sub ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-white line-clamp-1">
                              {sub.title}
                            </span>
                            {sub.description && (
                              <span className="text-xs text-slate-400 line-clamp-1">
                                {sub.description}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No submission</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {sub ? (
                          <StatusBadge status={sub.status} />
                        ) : (
                          <span className="text-xs text-slate-500">Unstarted</span>
                        )}
                      </td>

                      {/* Tracks */}
                      <td className="py-4 px-6">
                        {sub?.submissionTracks && sub.submissionTracks.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {sub.submissionTracks.map(({ track }: any) => (
                              <span
                                key={track.id}
                                className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20 text-[10px] text-indigo-300"
                              >
                                {track.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">
                        {sub?.submittedAt ? formatDateTime(sub.submittedAt) : "—"}
                      </td>

                      {/* Action Links */}
                      <td className="py-4 px-6 text-right">
                        {sub ? (
                          <div className="flex items-center justify-end gap-2">
                            {sub.repoUrl && (
                              <a
                                href={sub.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-white/10"
                                title="Repository"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {sub.demoUrl && (
                              <a
                                href={sub.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-white/10"
                                title="Live Demo"
                              >
                                <Globe className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {sub.videoUrl && (
                              <a
                                href={sub.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-950 text-rose-400 hover:text-rose-300 border border-white/10"
                                title="Pitch Video"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {sub.status === "submitted" && (
                              <Link
                                href={`/events/${event.slug}/gallery/${sub.id}`}
                                className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30"
                                title="View in Gallery"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
