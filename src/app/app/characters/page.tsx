import Image from "next/image";
import Link from "next/link";
import { MessageCircle, HardHat } from "lucide-react";
import { listCharacters, getDisplayName } from "@/lib/ai/characters";

export default function CharactersPage() {
  const characters = listCharacters();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Choose a character</h1>
        <p className="mt-2 text-slate-300">
          Pick someone from Greek myth to start a conversation. Each character stays fully in
          their own voice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <Link
            key={character.id}
            href={`/app/chat?character=${encodeURIComponent(character.id)}`}
            className={`group relative flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur transition-all hover:bg-white/[0.1] ${
              character.enabled ? "hover:border-brand-500/50" : "hover:border-yellow-400/40"
            }`}
          >
            {!character.enabled && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-300">
                <HardHat size={12} /> Under construction
              </span>
            )}
            <div
              className={`mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 ${
                character.enabled ? "" : "opacity-60 grayscale"
              }`}
            >
              <Image
                src={character.imageUrl}
                alt={getDisplayName(character)}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mt-5 text-center text-2xl font-black">{getDisplayName(character)}</h2>
            <p className="mt-1 text-center text-sm font-semibold uppercase tracking-wider text-brand-100">
              {character.title}
            </p>
            <p className="mt-3 flex-1 text-center text-sm leading-6 text-slate-400">
              {character.description}
            </p>
            {character.enabled ? (
              <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-bold transition-colors group-hover:bg-brand-500">
                <MessageCircle size={18} /> Start chatting
              </span>
            ) : (
              <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-yellow-200 transition-colors group-hover:bg-white/15">
                <HardHat size={18} /> Coming soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
