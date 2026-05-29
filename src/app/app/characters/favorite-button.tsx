"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { setFavoriteCharacter } from "@/app/actions";

export function FavoriteButton({
  characterId,
  isFavorite,
}: {
  characterId: string;
  isFavorite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      title={isFavorite ? "Your favorite — opens automatically next time" : "Set as favorite"}
      disabled={pending}
      onClick={() => startTransition(() => setFavoriteCharacter(characterId))}
      className={`absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
        isFavorite
          ? "border-yellow-400/40 bg-yellow-400/20 text-yellow-300"
          : "border-white/15 bg-black/30 text-slate-400 hover:text-yellow-300"
      }`}
    >
      <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
