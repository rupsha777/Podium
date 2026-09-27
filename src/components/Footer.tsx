import { Trophy, Heart, Github, Terminal } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Podium</span>
            <span className="text-xs text-slate-500 block">
              Open-source hackathon submission & judging platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/events" className="hover:text-white transition-colors">
            All Events
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Admin Hub
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Docker Ready</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <span>Single repo • Zero Redis • Self-hostable</span>
        </div>
      </div>
    </footer>
  );
}
