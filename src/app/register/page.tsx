import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-[#68736C]">Loading account form…</div>}><AuthForm mode="register" /></Suspense>;
}
