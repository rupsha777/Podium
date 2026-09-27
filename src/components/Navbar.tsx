"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import {
  Trophy,
  Layers,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  LogIn,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-glow flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                Podium
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-indigo-400">
                Hackathon Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/events") && !isActive("/admin")
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Events</span>
              </div>
            </Link>

            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/admin")
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Admin Hub</span>
              </div>
            </Link>
          </nav>

          {/* Auth & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              <div className="w-24 h-8 bg-slate-800/60 animate-pulse rounded-lg" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold text-slate-950">
                    {session.user.name?.[0]?.toUpperCase() ||
                      session.user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                      {session.user.name || session.user.email.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {(session.user as any).role || "participant"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Magic Link</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Events</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Hub</span>
            </Link>

            <div className="pt-3 border-t border-white/10">
              {session?.user ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Signed in as {session.user.email}</div>
                  <button
                    onClick={async () => {
                      await signOut();
                      window.location.reload();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Magic Link</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
