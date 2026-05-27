"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContentRating } from "@/types/database";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveSettings(_prevState: { success: boolean; message: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const contentRating: ContentRating = formData.get("adultMode") === "on" ? "adult" : "pg13";
  const displayName = String(formData.get("displayName") ?? "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      content_rating: contentRating,
      updated_at: new Date().toISOString(),
    });

  if (error) return { success: false, message: error.message };
  revalidatePath("/app/settings");
  revalidatePath("/app/chat");
  return { success: true, message: "Settings saved successfully!" };
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const content = String(formData.get("message") ?? "").trim();
  if (!content) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("content_rating")
    .eq("id", user.id)
    .single();

  const { data: existingChat } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let chatId = existingChat?.id;
  if (!chatId) {
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: "First chat" })
      .select("id")
      .single();
    if (chatError) throw new Error(chatError.message);
    chatId = newChat.id;
  }

  const fakeReply = profile?.content_rating === "adult"
    ? "I am feeling spunky, talk dirty to me."
    : `Ok, let me think about: ${content}. Note: the AI integration is coming soon.`;

  const { error: messageError } = await supabase.from("messages").insert([
    { chat_id: chatId, user_id: user.id, role: "user", content },
    { chat_id: chatId, user_id: user.id, role: "assistant", content: fakeReply },
  ]);
  if (messageError) throw new Error(messageError.message);

  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
  revalidatePath("/app/chat");
}

export async function clearChat() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (chat?.id) {
    await supabase.from("messages").delete().eq("chat_id", chat.id);
  }

  revalidatePath("/app/chat");
}
