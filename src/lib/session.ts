import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  if (user.role !== "admin") {
    return { ok: false as const, error: "Admins only" };
  }
  return { ok: true as const, user };
}