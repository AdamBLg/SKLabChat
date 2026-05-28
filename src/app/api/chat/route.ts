import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callInworld, AIError, type ChatMessage } from "@/lib/ai/inworld";
import { getCharacter, getDisplayName } from "@/lib/ai/characters";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: {
    characterId?: string;
    message?: string;
    loyaltyLevel?: number;
    chemistryLevel?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const characterId = body.characterId?.trim();
  const content = body.message?.trim();

  if (!characterId) {
    return NextResponse.json({ error: "characterId is required." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const character = getCharacter(characterId);
  if (!character) {
    return NextResponse.json(
      { error: `Unknown character "${characterId}".` },
      { status: 404 },
    );
  }

  // Find or create a chat tied to this user + character.
  const { data: existingChat } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", user.id)
    .eq("character_id", characterId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let chatId = existingChat?.id;
  if (!chatId) {
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        character_id: characterId,
        title: `Chat with ${getDisplayName(character)}`,
      })
      .select("id")
      .single();
    if (chatError || !newChat) {
      return NextResponse.json({ error: chatError?.message ?? "Failed to create chat." }, { status: 500 });
    }
    chatId = newChat.id;
  }

  // Pull prior history for AI context (oldest first).
  const { data: priorMessages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const history: ChatMessage[] = (priorMessages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  history.push({ role: "user", content });

  // Persist the user message.
  const { error: userMsgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: user.id,
    role: "user",
    content,
  });
  if (userMsgError) {
    return NextResponse.json({ error: userMsgError.message }, { status: 500 });
  }

  // Generate the AI reply (Inworld -> OpenAI cleanup).
  let reply: string;
  try {
    reply = await callInworld({
      character,
      displayName: getDisplayName(character),
      messages: history,
      loyaltyLevel: body.loyaltyLevel ?? 5,
      chemistryLevel: body.chemistryLevel ?? 5,
    });
  } catch (error) {
    const status = error instanceof AIError ? error.status : 500;
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status });
  }

  // Persist the assistant reply.
  const { error: assistantMsgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: user.id,
    role: "assistant",
    content: reply,
  });
  if (assistantMsgError) {
    return NextResponse.json({ error: assistantMsgError.message }, { status: 500 });
  }

  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  return NextResponse.json({ reply });
}
