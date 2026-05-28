const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const DEFAULT_CLEANUP_PROMPT = [
  "You are a careful editor preparing an in-character reply from {characterName} for the player.",
  "Polish the draft below: fix awkward phrasing; tighten repetition; remove meta commentary or model self-references; keep the character's voice and intent.",
  "The best response is optimized for SMS chat-bubble–style communication. The AI character should not give a long monologue; it should sound conversational and engaging. Format the reply as short chat-bubble paragraphs of no more than 2 to 3 sentences each, separated by a single blank line. If the draft is short enough to fit in a single 2-3 sentence bubble, leave it as one paragraph.",
  "Tune the tone using these relationship dials: {characterName}'s loyalty toward the player is {loyaltyLevel}/10 and chemistry with the player is {chemistryLevel}/10 (10 = maximum flirtatious, warm, and eager engagement; 5 = neutral, polite, mildly interested; 1 = cold, aloof, uninterested in chatting). Match the rewrite to these levels.",
  "Do not add new facts, scene directions, or quotation marks. Respond with only the cleaned reply text — no preamble, no explanation, no labels.",
].join(" ");

export interface CleanupResult {
  text: string;
  elapsed: number;
  skipped: boolean;
  error: string;
  prompt: string;
}

export function clampLevel(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 5;
  }
  return Math.max(1, Math.min(10, Math.round(numeric)));
}

function loadCleanupPromptTemplate(): string {
  const envOverride = process.env.CLEANUP_PROMPT || process.env.OPENAI_CLEANUP_PROMPT;
  if (typeof envOverride === "string" && envOverride.trim()) {
    return envOverride.trim();
  }
  return DEFAULT_CLEANUP_PROMPT;
}

function buildCleanupPrompt(
  characterName: string,
  loyaltyLevel: number,
  chemistryLevel: number,
): string {
  return loadCleanupPromptTemplate()
    .replace(/\{characterName\}/g, characterName || "the character")
    .replace(/\{loyaltyLevel\}/g, String(loyaltyLevel))
    .replace(/\{chemistryLevel\}/g, String(chemistryLevel));
}

export async function cleanupReply({
  rawReply,
  characterName,
  loyaltyLevel,
  chemistryLevel,
}: {
  rawReply: string;
  characterName: string;
  loyaltyLevel: number;
  chemistryLevel: number;
}): Promise<CleanupResult> {
  const startedAt = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;

  const loyalty = clampLevel(loyaltyLevel);
  const chemistry = clampLevel(chemistryLevel);
  const systemPrompt = buildCleanupPrompt(characterName, loyalty, chemistry);

  if (!apiKey || apiKey === "your_openai_api_key") {
    return {
      text: rawReply,
      elapsed: Date.now() - startedAt,
      skipped: true,
      error: "OPENAI_API_KEY missing",
      prompt: systemPrompt,
    };
  }

  const model =
    process.env.OPENAI_CLEANUP_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: rawReply },
    ],
    stream: false,
  };

  let response: Response;
  let data: { choices?: { message?: { content?: string } }[]; error?: { message?: string }; message?: string };

  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    data = await response.json().catch(() => ({}));
  } catch (error) {
    return {
      text: rawReply,
      elapsed: Date.now() - startedAt,
      skipped: true,
      error: error instanceof Error ? error.message : "network error",
      prompt: systemPrompt,
    };
  }

  const elapsed = Date.now() - startedAt;

  if (!response.ok) {
    const details =
      data.error?.message ||
      data.message ||
      `OpenAI cleanup request failed with status ${response.status}.`;
    return { text: rawReply, elapsed, skipped: true, error: details, prompt: systemPrompt };
  }

  const cleaned = data.choices?.[0]?.message?.content;

  if (typeof cleaned !== "string" || !cleaned.trim()) {
    return {
      text: rawReply,
      elapsed,
      skipped: true,
      error: "empty cleanup response",
      prompt: systemPrompt,
    };
  }

  return { text: cleaned.trim(), elapsed, skipped: false, error: "", prompt: systemPrompt };
}
