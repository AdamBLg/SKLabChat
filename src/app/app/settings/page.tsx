import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, content_rating")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="mt-2 text-slate-300">Set profile preferences. New users default to PG-13.</p>
        <SettingsForm
          defaultDisplayName={profile?.display_name ?? user?.user_metadata?.full_name ?? ""}
          defaultAdultMode={profile?.content_rating === "adult"}
        />
      </div>
    </main>
  );
}
