import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HardHat } from "lucide-react";

export function ConstructionZone({ characterName }: { characterName?: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/characters/greek-construction-zone.jpg"
            alt="Greek construction zone"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300">
            <HardHat size={26} />
          </div>
          <h1 className="text-3xl font-black">Greek Construction Zone</h1>
          <p className="mt-3 text-slate-300">
            {characterName ? `${characterName} is` : "This character is"} still being built. Our crews
            are hard at work raising the marble — check back soon to start chatting.
          </p>
          <Link
            href="/app/characters"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-bold transition-colors hover:bg-brand-500"
          >
            <ArrowLeft size={18} /> Back to characters
          </Link>
        </div>
      </div>
    </main>
  );
}
