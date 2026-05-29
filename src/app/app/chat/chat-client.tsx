"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { SendHorizonal, Trash2, Bug, RefreshCw } from "lucide-react";
import { clearChat } from "@/app/actions";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface DebugEntry {
  id: number;
  timestamp: string;
  characterName: string;
  characterResourceName: string;
  userMessage: string;
  cleanupPrompt: string;
  rawReply: string;
  cleanedReply: string;
  rawElapsedMs: number;
  cleanupElapsedMs: number;
  cleanupSkipped: boolean;
  cleanupError: string;
  loyaltyLevel: number | null;
  chemistryLevel: number | null;
}

interface Props {
  characterId: string;
  characterName: string;
  characterAvatar: string;
  initialMessages: Message[];
}

const MAX_SENTENCES_PER_BUBBLE = 3;

// A sentence that speaks directly to the user (second person) gets grouped into
// its own bubble so it's easy to spot when the character is talking about you.
function addressesUser(sentence: string): boolean {
  return /\b(you|your|you're|youre|yours|yourself|you've|you'll|you'd)\b/i.test(sentence);
}

function splitReply(reply: string): string[] {
  const trimmed = reply.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const initialChunks =
    paragraphs.length > 1
      ? paragraphs
      : trimmed
          .split(/\n+/)
          .map((chunk) => chunk.trim())
          .filter(Boolean);

  const chunks = initialChunks.length > 0 ? initialChunks : [trimmed];
  const result: string[] = [];

  for (const chunk of chunks) {
    const sentences = (chunk.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [chunk])
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      result.push(chunk);
      continue;
    }

    // Group consecutive sentences of the same "address mode" together, breaking
    // into a new bubble when the mode flips (narration <-> talking to you) or
    // when a bubble reaches the sentence cap.
    let current: string[] = [];
    let currentMode: boolean | null = null;

    const flush = () => {
      if (current.length) {
        result.push(current.join(" ").trim());
        current = [];
      }
    };

    for (const sentence of sentences) {
      const mode = addressesUser(sentence);
      if (
        currentMode !== null &&
        (mode !== currentMode || current.length >= MAX_SENTENCES_PER_BUBBLE)
      ) {
        flush();
      }
      current.push(sentence);
      currentMode = mode;
    }
    flush();
  }

  return result.filter(Boolean);
}

export function ChatClient({ characterId, characterName, characterAvatar, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loyalty, setLoyalty] = useState(5);
  const [chemistry, setChemistry] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || pending) return;

    setError(null);
    setInput("");
    setPending(true);

    const userMsg: Message = { id: `local-${Date.now()}`, role: "user", content };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          message: content,
          loyaltyLevel: loyalty,
          chemistryLevel: chemistry,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get a reply.");
      }

      const bubbles = splitReply(data.reply);
      setMessages((prev) => [
        ...prev,
        ...bubbles.map((content, i) => ({
          id: `reply-${Date.now()}-${i}`,
          role: "assistant" as const,
          content,
        })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  function handleClear() {
    startTransition(async () => {
      await clearChat(characterId);
      setMessages([]);
    });
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-73px)] max-w-5xl flex-col px-3 py-4 md:px-6">
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30">
            <Image
              src={characterAvatar}
              alt={characterName}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-black">{characterName}</h1>
            <p className="text-sm text-slate-400">Greek Heros brought back to be your friends</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <Trash2 size={16} /> Clear chat
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-inner"
      >
        {!messages.length ? (
          <div className="flex h-full items-center justify-center text-center text-slate-400">
            <div>
              <p className="text-2xl font-black text-white">Start the conversation</p>
              <p className="mt-2 max-w-md">Send a message to begin chatting with {characterName}.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow ${
                      isUser
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-bl-sm bg-white/10 text-slate-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-[1.35rem] rounded-bl-sm bg-white/10 px-4 py-3 text-sm text-slate-400">
                  {characterName} is typing…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="flex justify-between text-xs font-bold text-slate-300">
              <span>Loyalty</span>
              <span className="text-brand-100">{loyalty}/10</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={loyalty}
              onChange={(e) => setLoyalty(Number(e.target.value))}
              className="accent-brand-600"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="flex justify-between text-xs font-bold text-slate-300">
              <span>Chemistry</span>
              <span className="text-brand-100">{chemistry}/10</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={chemistry}
              onChange={(e) => setChemistry(Number(e.target.value))}
              className="accent-brand-600"
            />
          </label>
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            placeholder={`Message ${characterName}...`}
            className="min-w-0 flex-1 rounded-2xl bg-black/30 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-2xl bg-brand-600 px-4 py-3 font-bold hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizonal size={20} />
          </button>
        </form>
      </div>

      <DebugPanel />
    </main>
  );
}

function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [status, setStatus] = useState("Paused");
  const lastIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setStatus("Paused");
      return;
    }

    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/debug/log?since=${lastIdRef.current}`);
        const data = await res.json();
        if (!active) return;
        if (typeof data.lastId === "number") lastIdRef.current = data.lastId;
        if (Array.isArray(data.entries) && data.entries.length) {
          setEntries((prev) => [...prev, ...data.entries]);
        }
        setStatus(`Live`);
      } catch (err) {
        if (active) setStatus(err instanceof Error ? `Error: ${err.message}` : "Error");
      }
    }

    poll();
    const handle = window.setInterval(poll, 2000);
    return () => {
      active = false;
      window.clearInterval(handle);
    };
  }, [open]);

  async function handleClear() {
    await fetch("/api/debug/log", { method: "DELETE" });
    setEntries([]);
    lastIdRef.current = 0;
  }

  const toSec = (ms: number) => (ms / 1000).toFixed(2);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-slate-300"
      >
        <span className="flex items-center gap-2">
          <Bug size={16} /> Debug · First-level AI log
        </span>
        <span className="flex items-center gap-2 text-xs font-normal text-slate-500">
          {open && <RefreshCw size={12} className="animate-spin" />}
          {status}
        </span>
      </button>

      {open && (
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex justify-end">
            <button
              onClick={handleClear}
              className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/20"
            >
              Clear log
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {!entries.length ? (
              <p className="py-4 text-center text-xs text-slate-500">
                No responses yet. Send a message to see the raw and cleaned AI passes.
              </p>
            ) : (
              entries.map((entry) => (
                <details key={entry.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-brand-100">{entry.characterName || "AI"}</span>
                    <span className="text-slate-500">
                      first {toSec(entry.rawElapsedMs)}s ·{" "}
                      {entry.cleanupSkipped ? "cleanup skipped" : `cleanup ${toSec(entry.cleanupElapsedMs)}s`}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3 text-xs">
                    {entry.userMessage && (
                      <Section label="You said" text={entry.userMessage} />
                    )}
                    <Section label="First-level AI output (raw)" text={entry.rawReply} />
                    {entry.cleanupSkipped ? (
                      <p className="text-amber-300">
                        Cleanup skipped{entry.cleanupError ? `: ${entry.cleanupError}` : " — raw reply shown."}
                      </p>
                    ) : (
                      <Section
                        label={`Cleaned reply (Loyalty ${entry.loyaltyLevel}/10 · Chemistry ${entry.chemistryLevel}/10)`}
                        text={entry.cleanedReply}
                      />
                    )}
                  </div>
                </details>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-bold text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-slate-200">{text}</p>
    </div>
  );
}
