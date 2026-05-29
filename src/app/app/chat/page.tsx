import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharacter, getDisplayName } from "@/lib/ai/characters";
import { ConstructionZone } from "@/components/construction-zone";
import { ChatClient } from "./chat-client";

interface PageProps {
  searchParams: Promise<{ character?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  const { character: characterId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // No character chosen: jump straight to the user's favorite (if enabled),
  // otherwise send them to the character selection screen.
  if (!characterId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("favorite_character")
      .eq("id", user!.id)
      .maybeSingle();

    const favorite = profile?.favorite_character
      ? getCharacter(profile.favorite_character)
      : null;

    if (favorite?.enabled) {
      redirect(`/app/chat?character=${encodeURIComponent(favorite.id)}`);
    }
    redirect("/app/characters");
  }

  const character = getCharacter(characterId);
  if (!character) {
    redirect("/app/characters");
  }

  if (!character.enabled) {
    return <ConstructionZone characterName={getDisplayName(character)} />;
  }

  await supabase.from("profiles").upsert({
    id: user!.id,
    display_name: user?.user_metadata?.full_name ?? null,
    avatar_url: user?.user_metadata?.avatar_url ?? null,
  });

  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", user!.id)
    .eq("character_id", characterId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: messages } = chat?.id
    ? await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const initialMessages = (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  return (
    <ChatClient
      characterId={character.id}
      characterName={getDisplayName(character)}
      characterAvatar={character.imageUrl}
      initialMessages={initialMessages}
    />
  );
}
