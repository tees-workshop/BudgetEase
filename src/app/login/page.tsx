import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-[#68736C]">Loading sign in…</div>}><AuthForm mode="login" /></Suspense>;
}
