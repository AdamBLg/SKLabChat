import { SendHorizonal, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sendMessage, clearChat } from "@/app/actions";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("profiles").upsert({
    id: user!.id,
    display_name: user?.user_metadata?.full_name ?? null,
    avatar_url: user?.user_metadata?.avatar_url ?? null,
  });

  const { data: chat } = await supabase
    .from("chats")
    .select("id, title")
    .eq("user_id", user!.id)
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("content_rating")
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto flex h-[calc(100vh-73px)] max-w-5xl flex-col px-3 py-4 md:px-6">
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-4">
        <div>
          <h1 className="text-xl font-black">{chat?.title ?? "New chat"}</h1>
          <p className="text-sm text-slate-400">Mode: {profile?.content_rating === "adult" ? "Adult" : "PG-13"}</p>
        </div>
        <form action={clearChat}>
          <button className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <Trash2 size={16} /> Clear chat
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-inner">
        {!messages?.length ? (
          <div className="flex h-full items-center justify-center text-center text-slate-400">
            <div>
              <p className="text-2xl font-black text-white">Start the conversation</p>
              <p className="mt-2 max-w-md">Messages are saved in Supabase now. The assistant reply is intentionally fake until the AI backend is added.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow ${isUser ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-white/10 text-slate-100"}`}>
                    {message.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form action={sendMessage} className="mt-4 flex gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <input
          name="message"
          autoComplete="off"
          placeholder="Message PlayPals AI..."
          className="min-w-0 flex-1 rounded-2xl bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
        />
        <button className="rounded-2xl bg-brand-600 px-4 py-3 font-bold hover:bg-brand-500" aria-label="Send message">
          <SendHorizonal size={20} />
        </button>
      </form>
    </main>
  );
}
