const MAX_ENTRIES = 500;

export interface FirstLevelEntry {
  id: number;
  timestamp: string;
  characterName: string;
  workspace: string;
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

export type FirstLevelInput = Omit<FirstLevelEntry, "id" | "timestamp">;

// In-memory store. Resets when the serverless instance recycles, matching the
// dev-oriented behavior of the original project.
const firstLevelState: { entries: FirstLevelEntry[]; nextId: number } = {
  entries: [],
  nextId: 1,
};

export function recordFirstLevel(payload: Partial<FirstLevelInput>): FirstLevelEntry {
  const entry: FirstLevelEntry = {
    id: firstLevelState.nextId++,
    timestamp: new Date().toISOString(),
    characterName: payload.characterName || "",
    workspace: payload.workspace || "",
    characterResourceName: payload.characterResourceName || "",
    userMessage: payload.userMessage || "",
    cleanupPrompt: payload.cleanupPrompt || "",
    rawReply: payload.rawReply || "",
    cleanedReply: payload.cleanedReply || "",
    rawElapsedMs: payload.rawElapsedMs || 0,
    cleanupElapsedMs: payload.cleanupElapsedMs || 0,
    cleanupSkipped: Boolean(payload.cleanupSkipped),
    cleanupError: payload.cleanupError || "",
    loyaltyLevel:
      typeof payload.loyaltyLevel === "number" ? payload.loyaltyLevel : null,
    chemistryLevel:
      typeof payload.chemistryLevel === "number" ? payload.chemistryLevel : null,
  };

  firstLevelState.entries.push(entry);

  if (firstLevelState.entries.length > MAX_ENTRIES) {
    firstLevelState.entries.splice(0, firstLevelState.entries.length - MAX_ENTRIES);
  }

  return entry;
}

export function getFirstLevelEntries(sinceId?: number): FirstLevelEntry[] {
  if (typeof sinceId === "number" && Number.isFinite(sinceId)) {
    return firstLevelState.entries.filter((entry) => entry.id > sinceId);
  }

  return firstLevelState.entries.slice();
}

export function clearFirstLevel(): void {
  firstLevelState.entries.length = 0;
}
