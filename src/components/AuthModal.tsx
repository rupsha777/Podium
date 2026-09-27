"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowRight, X, ShieldAlert } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultEmail = "", onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"participant" | "admin" | "judge">("participant");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await signIn.magicLink({
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        callbackURL: typeof window !== "undefined" ? window.location.href : "/",
      });

      if (res?.error) {
        setStatus("error");
        setErrorMessage(res.error.message || "Failed to send magic link");
      } else {
        setStatus("sent");
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetName: string, presetRole: "participant" | "admin") => {
    setEmail(presetEmail);
    setName(presetName);
    setRole(presetRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "sent" ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Magic Link Dispatched!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We sent a verification link to <span className="font-semibold text-indigo-300">{email}</span>.
            </p>
            <div className="p-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-slate-400 text-left">
              <span className="font-semibold text-slate-200">💡 Local / Demo Environment:</span>
              <p className="mt-1">
                Check your server console terminal or test mailbox to click the generated link.
              </p>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Passwordless Access</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign In with Magic Link</h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your email to receive a secure 1-click login link.
            </p>

            {status === "error" && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Fillers */}
            <div className="mt-4 p-3 bg-slate-950/50 border border-white/5 rounded-xl">
              <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <span>Quick demo presets:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPresetUser("admin@podium.build", "Alex Rivera (Admin)", "admin")}
                  className="px-2.5 py-1.5 text-xs text-left bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/20 rounded-lg transition-colors truncate"
                >
                  👑 Admin User
                </button>
                <button
                  type="button"
                  onClick={() => setPresetUser("hacker@podium.build", "Sam Chen (Hacker)", "participant")}
                  className="px-2.5 py-1.5 text-xs text-left bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-lg transition-colors truncate"
                >
                  🚀 Participant
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Name <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Sign-In Link</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
