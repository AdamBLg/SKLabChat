"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings } from "@/app/actions";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  defaultDisplayName: string;
  defaultAvatarUrl: string;
  defaultPhone: string;
  defaultCity: string;
  defaultCountry: string;
  defaultAdultMode: boolean;
}

export function SettingsForm({ defaultDisplayName, defaultAvatarUrl, defaultPhone, defaultCity, defaultCountry, defaultAdultMode }: Props) {
  const [state, formAction, isPending] = useActionState(saveSettings, null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (state) {
      setShowBanner(true);
      if (state.success) {
        const timer = setTimeout(() => setShowBanner(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      {showBanner && state && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
            state.success
              ? "border border-green-500/30 bg-green-500/10 text-green-300"
              : "border border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {state.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {state.message}
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-slate-200">Display name</span>
        <input
          name="displayName"
          defaultValue={defaultDisplayName}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
          placeholder="Adam"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-slate-200">Profile picture URL</span>
        <input
          name="avatarUrl"
          defaultValue={defaultAvatarUrl}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
          placeholder="https://example.com/photo.jpg"
        />
        <span className="text-xs text-slate-500">Paste a link to your profile image</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-slate-200">Phone number</span>
        <input
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
          placeholder="+1 555-123-4567"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-200">City</span>
          <input
            name="city"
            defaultValue={defaultCity}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
            placeholder="San Francisco"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-200">Country</span>
          <input
            name="country"
            defaultValue={defaultCountry}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
            placeholder="United States"
          />
        </label>
      </div>

      <label className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <input
          type="checkbox"
          name="adultMode"
          defaultChecked={defaultAdultMode}
          className="mt-1 h-5 w-5 accent-brand-600"
        />
        <span>
          <span className="block font-bold">Adult / uncensored preference</span>
          <span className="mt-1 block text-sm leading-6 text-slate-400">
            Off means PG-13. On stores an adult-mode preference for later AI routing and changes the current fake reply.
          </span>
        </span>
      </label>

      <button
        disabled={isPending}
        className="rounded-2xl bg-brand-600 px-5 py-3 font-bold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
