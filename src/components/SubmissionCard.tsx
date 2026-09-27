import Link from "next/link";
import { Github, Globe, Video, Users, ArrowUpRight, Award } from "lucide-react";
import { TrackBadge } from "./StatusBadge";

interface SubmissionCardProps {
  submission: {
    id: string;
    title: string;
    description: string | null;
    repoUrl: string | null;
    demoUrl: string | null;
    videoUrl: string | null;
    submittedAt: Date | string | null;
    team: {
      name: string;
      members: {
        user: {
          id: string;
          name: string | null;
          email: string;
        };
      }[];
    };
    submissionTracks: {
      track: {
        id: string;
        name: string;
      };
    }[];
  };
  eventSlug: string;
}

export function SubmissionCard({ submission, eventSlug }: SubmissionCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/50 p-5 md:p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <div>
        {/* Header: Title & Direct Link */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            href={`/events/${eventSlug}/gallery/${submission.id}`}
            className="group-hover:text-indigo-300 transition-colors"
          >
            <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
              {submission.title}
            </h3>
          </Link>
          <Link
            href={`/events/${eventSlug}/gallery/${submission.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-white/10 group-hover:border-indigo-500/40 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Team & Members */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">{submission.team.name}</span>
          <span>•</span>
          <span>{submission.team.members.length} {submission.team.members.length === 1 ? "builder" : "builders"}</span>
        </div>

        {/* Description Excerpt */}
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {submission.description || "No project description provided."}
        </p>

        {/* Tracks */}
        {submission.submissionTracks && submission.submissionTracks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {submission.submissionTracks.map(({ track }) => (
              <TrackBadge key={track.id} name={track.name} />
            ))}
          </div>
        )}
      </div>

      {/* Footer / Links */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {submission.repoUrl && (
            <a
              href={submission.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Code</span>
            </a>
          )}
          {submission.demoUrl && (
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Live Demo"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo</span>
            </a>
          )}
          {submission.videoUrl && (
            <a
              href={submission.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Video Pitch"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Video</span>
            </a>
          )}
        </div>

        <Link
          href={`/events/${eventSlug}/gallery/${submission.id}`}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
