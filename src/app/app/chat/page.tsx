import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharacter, getDisplayName } from "@/lib/ai/characters";
import { ChatClient } from "./chat-client";

interface PageProps {
  searchParams: Promise<{ character?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  const { character: characterId } = await searchParams;

  if (!characterId) {
    redirect("/app/characters");
  }

  const character = getCharacter(characterId);
  if (!character) {
    redirect("/app/characters");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
