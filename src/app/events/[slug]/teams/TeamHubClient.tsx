"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { createTeam, joinTeam } from "@/actions/teams";
import {
  Users,
  PlusCircle,
  KeyRound,
  Copy,
  Check,
  Send,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LogIn,
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { StatusBadge } from "@/components/StatusBadge";

interface TeamHubProps {
  event: any;
}

export function TeamHubClient({ event }: TeamHubProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [isPending, startTransition] = useTransition();

  // Modals & UI states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"my_team" | "create" | "join" | "all_teams">("my_team");
  
  // Forms
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Find user's current team in this event
  const currentUserId = session?.user?.id;
  const userTeam = event.teams?.find((t: any) =>
    t.members?.some((m: any) => m.userId === currentUserId)
  );

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    if (!teamName.trim()) {
      setErrorMsg("Please enter a team name.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const res = await createTeam(event.id, teamName.trim(), session.user.id);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to create team.");
      } else {
        setSuccessMsg(`Team "${teamName}" created successfully with code ${res.data?.joinCode}!`);
        setTeamName("");
        setActiveTab("my_team");
        router.refresh();
      }
    });
  };

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    if (!joinCode.trim()) {
      setErrorMsg("Please enter a join code.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const res = await joinTeam(joinCode.trim(), session.user.id);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to join team.");
      } else {
        setSuccessMsg(`Successfully joined team!`);
        setJoinCode("");
        setActiveTab("my_team");
        router.refresh();
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href={`/events/${event.slug}`} className="hover:text-white transition-colors">
          ← Back to {event.name}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Team Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Teams & Roster</h1>
          <p className="text-sm text-slate-400 mt-1">
            Form your squad, invite teammates using your join code, and view the roster.
          </p>
        </div>

        {/* Action button toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {!userTeam && (
            <>
              <button
                onClick={() => {
                  if (!session?.user) {
                    setShowAuthModal(true);
                  } else {
                    setActiveTab("create");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "create"
                    ? "bg-indigo-600 text-white shadow-glow"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Team</span>
              </button>

              <button
                onClick={() => {
                  if (!session?.user) {
                    setShowAuthModal(true);
                  } else {
                    setActiveTab("join");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "join"
                    ? "bg-cyan-600 text-white shadow-glow"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab("all_teams")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "all_teams"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-slate-900 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Teams ({event.teams?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
          <UserCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Non-authenticated banner */}
      {!sessionLoading && !session?.user && (
        <div className="mb-8 p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Sign in to Create or Join a Team</h3>
            <p className="text-xs text-slate-300">
              Receive a passwordless magic link to access your participant dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all flex items-center gap-2 shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Active User Team Card */}
      {userTeam && activeTab !== "all_teams" && (
        <div className="mb-10 rounded-3xl bg-slate-900/90 border border-indigo-500/40 p-6 sm:p-8 shadow-glow relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Your Active Team</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{userTeam.name}</h2>
            </div>

            {/* Join Code Box */}
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Join Code:
              </span>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-xl bg-slate-950 border border-indigo-500/40 font-mono text-lg font-bold text-cyan-300 tracking-wider">
                  {userTeam.joinCode}
                </div>
                <button
                  onClick={() => copyToClipboard(userTeam.joinCode)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  title="Copy Join Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500">
                Share this code with teammates so they can join.
              </span>
            </div>
          </div>

          {/* Roster & Members */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Team Roster ({userTeam.members?.length || 0} Members)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userTeam.members?.map((member: any, idx: number) => {
                const isYou = member.userId === currentUserId;
                return (
                  <div
                    key={member.userId}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      isYou
                        ? "bg-indigo-950/40 border-indigo-500/30"
                        : "bg-slate-950/70 border-white/10"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                      {member.user?.name?.[0]?.toUpperCase() ||
                        member.user?.email?.[0]?.toUpperCase() ||
                        "M"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {member.user?.name || member.user?.email?.split("@")[0]}
                        {isYou && <span className="ml-1.5 text-xs text-indigo-400 font-normal">(You)</span>}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {member.user?.email}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submission Action */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span>Submission Status: </span>
                {userTeam.submissions && userTeam.submissions.length > 0 ? (
                  <StatusBadge status={userTeam.submissions[0].status} className="ml-2" />
                ) : (
                  <span className="ml-2 text-slate-500 font-medium">Not started</span>
                )}
              </div>

              <Link
                href={`/events/${event.slug}/submit`}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Go to Submission Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Form Tab */}
      {activeTab === "create" && !userTeam && (
        <div className="mb-10 max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-glow">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <PlusCircle className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Create a New Team</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Pick a team name. A unique 6-character code will be generated for your teammates to join.
          </p>

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Team Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. CyberVanguard, NeuralNodes"
                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Team & Generate Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Join Team Form Tab */}
      {activeTab === "join" && !userTeam && (
        <div className="mb-10 max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-glow">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Join Existing Team</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Enter the 6-character join code provided by your team lead.
          </p>

          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Team Join Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="e.g. 7X9K2A"
                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Team</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* All Teams Directory */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Event Roster ({event.teams?.length || 0} Teams)
          </h2>
        </div>

        {event.teams && event.teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.teams.map((t: any) => {
              const submission = t.submissions?.[0];
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white line-clamp-1">{t.name}</h3>
                      {submission && <StatusBadge status={submission.status} />}
                    </div>

                    <div className="text-xs text-slate-400 mb-3">
                      <span>{t.members?.length || 0} {t.members?.length === 1 ? "member" : "members"}</span>
                    </div>

                    {/* Member names list */}
                    <div className="flex flex-wrap gap-1.5">
                      {t.members?.map((m: any) => (
                        <span
                          key={m.userId}
                          className="px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-xs text-slate-300"
                        >
                          {m.user?.name || m.user?.email?.split("@")[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-sm text-slate-400">
            No teams registered yet. Be the first to create one!
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default TeamHubClient;
