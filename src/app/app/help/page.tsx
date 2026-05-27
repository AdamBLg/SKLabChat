import { LifeBuoy, Mail } from "lucide-react";

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <LifeBuoy size={28} className="text-brand-500" />
          <h1 className="text-3xl font-black">Help &amp; Support</h1>
        </div>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          If you need assistance with billing, account issues, or have any questions, please reach out to our support team.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-bold">Billing Support</h2>
          <p className="mt-2 text-slate-400">
            For billing inquiries, refunds, or subscription questions, email us and we&apos;ll get back to you as soon as possible.
          </p>
          <a
            href="mailto:sklabs.admin@gmail.com"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold hover:bg-brand-500 transition-colors"
          >
            <Mail size={18} />
            sklabs.admin@gmail.com
          </a>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-bold">General Help</h2>
          <ul className="mt-3 flex flex-col gap-2 text-slate-300">
            <li>• To change your display name or content preferences, visit <strong>Settings</strong>.</li>
            <li>• Google and Apple sign-in are managed securely through Supabase Auth.</li>
            <li>• Your chat history is automagically archived in anonymity for future generations of PlayPals.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
