import Link from "next/link";
import { getEvents } from "@/actions/events";
import { formatDateTime, isDeadlinePassed } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  PlusCircle,
  Edit,
  LayoutDashboard,
  ExternalLink,
  Calendar,
  Users,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHubPage() {
  const check = await requireAdmin();
  if (!check.ok) {
    redirect("/");
  }

  const result = await getEvents();
  const events = result.success && result.data ? result.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Organizer Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your hackathons, configure deadlines, customize tracks, and inspect submissions.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Events Table / Cards */}
      {events.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-white/10">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Events Created Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Get started by creating your first hackathon event.
          </p>
          <Link
            href="/admin/events/new"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-glow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Event Name & Slug</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Submission Deadline</th>
                  <th className="py-4 px-6 font-semibold">Teams</th>
                  <th className="py-4 px-6 font-semibold">Submissions</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => {
                  const isClosed = isDeadlinePassed(event.submissionDeadline);
                  const totalTeams = event.teams?.length || 0;
                  const totalSubmissions =
                    event.teams?.reduce(
                      (acc, t) =>
                        acc + (t.submissions?.filter((s) => s.status === "submitted").length || 0),
                      0
                    ) || 0;

                  return (
                    <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{event.name}</span>
                          <span className="text-xs text-slate-400 font-mono">/{event.slug}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={isClosed ? "closed" : "open"} />
                      </td>

                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                        {formatDateTime(event.submissionDeadline)}
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{totalTeams}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{totalSubmissions}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/events/${event.id}/dashboard`}
                            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                            title="Submissions & Teams Dashboard"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Event Settings"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/events/${event.slug}`}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Public Event Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}