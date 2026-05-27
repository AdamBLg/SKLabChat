import Link from "next/link";
import { PasscodeCard } from "./passcode-card";

export default function PasscodePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81,transparent_35%),#070711] px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-brand-100">Device login scaffold</p>
        <h1 className="text-4xl font-black">Passcode / QR login</h1>
        <p className="mt-4 leading-7 text-slate-300">
          This starter includes the UI and database table for a future QR/device-code flow. The secure token exchange must be completed later with server-side approval logic.
        </p>
        <PasscodeCard />
        <Link href="/login" className="mt-6 inline-block rounded-2xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/20">Back to login</Link>
      </section>
    </main>
  );
}
