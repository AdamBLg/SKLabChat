"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Apple, Globe, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/button";

export function LoginPanel() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app/chat";

  async function signIn(provider: "google" | "apple") {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur md:grid md:grid-cols-[1.1fr_0.9fr] md:p-10">
      <div className="flex flex-col justify-center gap-6">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-brand-100">PlayPals AI</p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Friends from Greek past for your companionship.</h1>
        </div>
        <p className="max-w-xl text-lg leading-8 text-slate-300">
          Sign in with Google or Apple. No app password is stored. After login, users can start a persistent SMS-style chat with our friends from the Greek past.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
        <h2 className="mb-2 text-2xl font-black">Welcome back</h2>
        <p className="mb-6 text-sm text-slate-400">OAuth is handled by Supabase Auth.</p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => signIn("google")} className="flex items-center justify-center gap-3 bg-white text-slate-950 hover:bg-slate-100">
            <Globe size={20} /> Continue with Google
          </Button>
          <Button onClick={() => signIn("apple")} className="flex items-center justify-center gap-3 bg-slate-950 text-white ring-1 ring-white/20 hover:bg-slate-900">
            <Apple size={20} /> Continue with Apple
          </Button>
          <Link href="/passcode" className="flex items-center justify-center gap-3 rounded-2xl bg-brand-600 px-4 py-3 text-center font-semibold hover:bg-brand-500">
            <KeyRound size={20} /> Use passcode / QR login
          </Link>
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">
          Passcode login is scaffolded for a future TV/desktop-style device authorization flow. Google and Apple OAuth work once configured in Supabase.
        </p>
      </div>
    </section>
  );
}
