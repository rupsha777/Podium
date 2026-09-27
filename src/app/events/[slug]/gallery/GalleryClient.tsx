"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmissionCard } from "@/components/SubmissionCard";
import { Trophy, Search, Layers, Sparkles, Filter } from "lucide-react";

interface GalleryClientProps {
  event: any;
  submissions: any[];
}

export function GalleryClient({ event, submissions }: GalleryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all");

  // Filter submissions by search query & track
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.team?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack =
      selectedTrackId === "all" ||
      sub.submissionTracks?.some((st: any) => st.track?.id === selectedTrackId || st.trackId === selectedTrackId);

    return matchesSearch && matchesTrack;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href={`/events/${event.slug}`} className="hover:text-white transition-colors">
          ← Back to {event.name}
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-amber-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>Public Showcase</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Gallery</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse all submitted projects, explore demos, and review codebases.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{submissions.length} Projects Live</span>
        </div>
      </div>

      {/* Search and Track Filters */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, teams, tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Tracks Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedTrackId("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTrackId === "all"
                ? "bg-indigo-600 text-white shadow-glow"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            All Tracks
          </button>

          {event.tracks?.map((track: any) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTrackId === track.id
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/50 border border-white/10">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Submitted Projects Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery || selectedTrackId !== "all"
              ? "No projects match your search criteria. Try adjusting filters."
              : "No teams have submitted their final projects yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              eventSlug={event.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
