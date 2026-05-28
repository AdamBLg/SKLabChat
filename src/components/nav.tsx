import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { User } from "lucide-react";

export async function AppNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", data.user!.id)
    .maybeSingle();

  const avatarUrl = profile?.avatar_url || data.user?.user_metadata?.avatar_url;

  return (
    <nav className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur">
      <Link href="/app/chat" className="text-lg font-black tracking-tight">PlayPals AI</Link>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <Link href="/app/characters" className="rounded-xl px-3 py-2 hover:bg-white/10">Chat</Link>
        <Link href="/app/characters" className="rounded-xl px-3 py-2 hover:bg-white/10">Characters</Link>
        <Link href="/app/settings" className="rounded-xl px-3 py-2 hover:bg-white/10">Settings</Link>
        <Link href="/app/help" className="rounded-xl px-3 py-2 hover:bg-white/10">Help</Link>
        <span className="hidden max-w-40 truncate md:inline">{data.user?.email}</span>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border border-white/20"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <User size={16} />
          </div>
        )}
        <form action={signOut}>
          <button className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20">Sign out</button>
        </form>
      </div>
    </nav>
  );
}
