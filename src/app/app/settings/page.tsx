import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, phone, city, country, content_rating")
    .eq("id", user!.id)
    .maybeSingle();

  const provider = user?.app_metadata?.provider ?? "unknown";
  const email = user?.email ?? "—";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="mt-2 text-slate-300">Set profile preferences. New users default to PG-13.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Account</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-100">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Signed in with</span>
              <span className="capitalize text-slate-100">{provider}</span>
            </div>
          </div>
        </div>

        <SettingsForm
          defaultDisplayName={profile?.display_name ?? user?.user_metadata?.full_name ?? ""}
          defaultAvatarUrl={profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? ""}
          defaultPhone={profile?.phone ?? ""}
          defaultCity={profile?.city ?? ""}
          defaultCountry={profile?.country ?? ""}
          defaultAdultMode={profile?.content_rating === "adult"}
        />
      </div>
    </main>
  );
}
