import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionById } from "@/actions/submissions";
import { TrackBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import {
  Github,
  Globe,
  Video,
  Users,
  Calendar,
  Layers,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SubmissionDetailPageProps {
  params: Promise<{ slug: string; submissionId: string }>;
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { slug, submissionId } = await params;
  const result = await getSubmissionById(submissionId);

  if (!result.success || !result.data) {
    notFound();
  }

  const sub = result.data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link
          href={`/events/${slug}/gallery`}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project Gallery</span>
        </Link>
      </div>

      {/* Main Submission Header Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-glow relative overflow-hidden mb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Submission</span>
            </div>

            {sub.submittedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Submitted {formatDateTime(sub.submittedAt)}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {sub.title}
          </h1>

          {/* Team Info */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Team: <strong className="text-white">{sub.team?.name}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Members:</span>
              <div className="flex flex-wrap gap-1.5">
                {sub.team?.members?.map((m: any) => (
                  <span
                    key={m.userId}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium"
                  >
                    {m.user?.name || m.user?.email}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tracks */}
          {sub.submissionTracks && sub.submissionTracks.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {sub.submissionTracks.map(({ track }: any) => (
                <TrackBadge key={track.id} name={track.name} />
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="pt-4 flex flex-wrap gap-3">
            {sub.repoUrl && (
              <a
                href={sub.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-white/10 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {sub.demoUrl && (
              <a
                href={sub.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-glow-cyan transition-all flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>Launch Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-200" />
              </a>
            )}

            {sub.videoUrl && (
              <a
                href={sub.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Watch Video Pitch</span>
                <ExternalLink className="w-3.5 h-3.5 text-rose-200" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Description / Pitch Section */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Project Overview</h2>
        <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {sub.description || "No detailed description provided by the team."}
        </div>
      </div>
    </div>
  );
}
