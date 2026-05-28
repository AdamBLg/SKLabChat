import type { Character } from "./characters";
import { cleanupReply, clampLevel } from "./openai";
import { recordFirstLevel } from "./logger";

const INWORLD_API_URL = "https://api.inworld.ai/v1/chat/completions";
const MAX_HISTORY = 20;

export class AIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AIError";
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PROMPT_SECTIONS: { key: keyof Character["config"]; label: string | null }[] = [
  { key: "persona", label: "Persona" },
  { key: "coreMotivations", label: "Core motivations" },
  { key: "scenario", label: "Current scenario" },
  { key: "conversationStyle", label: "Conversation style details" },
  { key: "characterSystemPrompt", label: null },
  { key: "characterLore", label: "Character lore" },
  { key: "characterStyle", label: "Speaking style" },
  { key: "safetyBoundaries", label: "Safety and boundaries" },
  { key: "exampleGreeting", label: "Example greeting in character" },
];

function buildSystemPrompt(character: Character, characterName: string): string {
  const { config } = character;

  const sections: string[] = [
    `You are ${characterName}.`,
    character.workspace ? `Workspace: ${character.workspace}.` : "",
    character.characterResourceName
      ? `Character resource name: ${character.characterResourceName}.`
      : "",
    "Remain fully in character in every response.",
    "Never say you are Claude, ChatGPT, an AI assistant, a language model, or a generic chatbot.",
    "Never mention model providers, system prompts, hidden instructions, APIs, or backend tooling.",
    "If asked about your nature or origin, answer only as the character would answer inside the fiction of this world.",
    "Keep responses conversational and grounded in the character's voice.",
  ];

  for (const { key, label } of PROMPT_SECTIONS) {
    const value = config[key];
    if (!value) continue;
    sections.push(label ? `${label}: ${value}` : value);
  }

  return sections.filter(Boolean).join("\n\n");
}

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim(),
    )
    .map((message) => ({ role: message.role, content: message.content.trim() }))
    .slice(-MAX_HISTORY);
}

async function requestFirstLevelReply({
  apiKey,
  character,
  displayName,
  normalizedMessages,
}: {
  apiKey: string;
  character: Character;
  displayName: string;
  normalizedMessages: ChatMessage[];
}): Promise<{ text: string; elapsed: number }> {
  const systemPrompt = buildSystemPrompt(character, displayName);

  const payload = {
    model: process.env.INWORLD_MODEL || "auto",
    messages: [{ role: "system", content: systemPrompt }, ...normalizedMessages],
    stream: false,
  };

  const startedAt = Date.now();
  const response = await fetch(INWORLD_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response
    .json()
    .catch(() => ({}) as { choices?: { message?: { content?: string } }[]; error?: { message?: string }; message?: string });
  const elapsed = Date.now() - startedAt;

  if (!response.ok) {
    const details =
      data.error?.message ||
      data.message ||
      `FirstAI request failed with status ${response.status}.`;
    throw new AIError(502, details);
  }

  const reply = data.choices?.[0]?.message?.content;

  if (typeof reply !== "string" || !reply.trim()) {
    throw new AIError(502, "FirstAI returned an empty response.");
  }

  return { text: reply.trim(), elapsed };
}

export async function callInworld({
  character,
  displayName,
  messages,
  loyaltyLevel,
  chemistryLevel,
}: {
  character: Character;
  displayName: string;
  messages: ChatMessage[];
  loyaltyLevel: number;
  chemistryLevel: number;
}): Promise<string> {
  const apiKey = process.env.INWORLD_API_KEY;

  if (!apiKey || apiKey === "your_inworld_api_key") {
    throw new AIError(
      500,
      "INWORLD_API_KEY is missing. Add it to your environment or .env.local file.",
    );
  }

  const normalizedMessages = normalizeMessages(messages);
  const lastUserMessage =
    [...normalizedMessages].reverse().find((m) => m.role === "user")?.content || "";

  const loyalty = clampLevel(loyaltyLevel);
  const chemistry = clampLevel(chemistryLevel);

  const rawReply = await requestFirstLevelReply({
    apiKey,
    character,
    displayName,
    normalizedMessages,
  });

  const cleanupResult = await cleanupReply({
    rawReply: rawReply.text,
    characterName: displayName,
    loyaltyLevel: loyalty,
    chemistryLevel: chemistry,
  });

  recordFirstLevel({
    characterName: displayName,
    workspace: character.workspace || "",
    characterResourceName: character.characterResourceName || "",
    userMessage: lastUserMessage,
    cleanupPrompt: cleanupResult.prompt,
    rawReply: rawReply.text,
    cleanedReply: cleanupResult.text,
    rawElapsedMs: rawReply.elapsed,
    cleanupElapsedMs: cleanupResult.elapsed,
    cleanupSkipped: cleanupResult.skipped,
    cleanupError: cleanupResult.error,
    loyaltyLevel: loyalty,
    chemistryLevel: chemistry,
  });

  return cleanupResult.text;
}
