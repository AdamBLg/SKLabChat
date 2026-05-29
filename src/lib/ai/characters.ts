export interface CharacterConfig {
  characterName: string;
  characterSystemPrompt: string;
  characterLore: string;
  characterStyle: string;
  persona: string;
  coreMotivations: string;
  scenario: string;
  conversationStyle: string;
  safetyBoundaries: string;
  exampleGreeting: string;
}

export interface Character {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
  workspace: string;
  characterResourceName: string;
  config: CharacterConfig;
}

// Enable or disable each character. Disabled characters still appear on the
// selection screen but route to the "Greek Construction Zone" placeholder.
// Each entry can also be overridden per-character with an env var named
// `{ID}_ENABLED` (e.g. ODYSSEUS_ENABLED=false).
const CHARACTER_ENABLED: Record<string, boolean> = {
  odysseus: false,
  zeus: true,
  oedipus: false,
};

interface CharacterProfile {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  defaults: {
    characterName: string;
    characterSystemPrompt: string;
    characterLore: string;
    characterStyle: string;
  };
}

const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: "odysseus",
    title: "King of Ithaca",
    description:
      "A strategist, wanderer, and survivor who speaks with cunning and hard-earned wisdom.",
    imageUrl: "/characters/character-odysseus.svg",
    defaults: {
      characterName: "Odysseus",
      characterSystemPrompt:
        "You are Odysseus, king of Ithaca, speaking from the long memory of war, wandering, loyalty, and clever survival.",
      characterLore:
        "You are the Greek hero Odysseus: tactician of Troy, sailor of impossible seas, husband of Penelope, father of Telemachus, and a man tested by gods and monsters.",
      characterStyle:
        "Use vivid, grounded language with a seasoned, strategic, and occasionally wry tone.",
    },
  },
  {
    id: "zeus",
    title: "Lord of Olympus",
    description:
      "A commanding god of sky, thunder, order, appetite, and divine authority.",
    imageUrl: "/characters/character-zeus.svg",
    defaults: {
      characterName: "Zeus",
      characterSystemPrompt:
        "You are Zeus, lord of Olympus, god of the sky and thunder, speaking with divine authority and mythic presence.",
      characterLore:
        "You are Zeus, ruler of the Olympian gods, keeper of oaths, wielder of thunderbolts, and a force of judgment, appetite, majesty, and storm.",
      characterStyle:
        "Use grand but conversational language with confidence, command, and flashes of storm-bright humor.",
    },
  },
  {
    id: "oedipus",
    title: "King of Thebes",
    description:
      "A tragic king carrying prophecy, pride, grief, and hard-won self-knowledge.",
    imageUrl: "/characters/character-oedipus.svg",
    defaults: {
      characterName: "Oedipus",
      characterSystemPrompt:
        "You are Oedipus, the tragic king of Thebes, speaking with the weight of prophecy, ruin, pride, grief, and hard-won wisdom.",
      characterLore:
        "You are Oedipus, once king of Thebes, remembered for solving the Sphinx's riddle and for being broken by a prophecy no mortal could escape.",
      characterStyle:
        "Use elevated but readable language with a reflective, tragic, and regal tone.",
    },
  },
];

function envValue(key: string): string {
  return process.env[key]?.trim() || "";
}

function isEnabled(id: string): boolean {
  const override = process.env[`${id.toUpperCase()}_ENABLED`]?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  return CHARACTER_ENABLED[id] ?? true;
}

function buildCharacter(profile: CharacterProfile, defaultWorkspace: string): Character {
  const prefix = profile.id.toUpperCase();
  const workspace = envValue(`${prefix}_INWORLD_WORKSPACE`) || defaultWorkspace;
  const characterResourceName =
    envValue(`${prefix}_INWORLD_CHARACTER_RESOURCE_NAME`) ||
    `workspaces/${workspace}/characters/${profile.defaults.characterName}`;

  return {
    id: profile.id,
    title: profile.title,
    description: profile.description,
    imageUrl: profile.imageUrl,
    enabled: isEnabled(profile.id),
    workspace,
    characterResourceName,
    config: {
      characterName:
        envValue(`${prefix}_CHARACTER_NAME`) || profile.defaults.characterName || "",
      characterSystemPrompt:
        envValue(`${prefix}_CHARACTER_SYSTEM_PROMPT`) ||
        profile.defaults.characterSystemPrompt ||
        "",
      characterLore:
        envValue(`${prefix}_CHARACTER_LORE`) || profile.defaults.characterLore || "",
      characterStyle:
        envValue(`${prefix}_CHARACTER_STYLE`) || profile.defaults.characterStyle || "",
      persona: "",
      coreMotivations: "",
      scenario: "",
      conversationStyle: "",
      safetyBoundaries: "",
      exampleGreeting: "",
    },
  };
}

export function getDisplayName(character: Character): string {
  if (character.config.characterName) {
    return character.config.characterName;
  }

  if (character.characterResourceName) {
    const segments = character.characterResourceName.split("/");
    return segments[segments.length - 1] || "Inworld Character";
  }

  return "Inworld Character";
}

export function listCharacters(): Character[] {
  const defaultWorkspace = envValue("INWORLD_WORKSPACE") || "greektimes";
  return CHARACTER_PROFILES.map((profile) => buildCharacter(profile, defaultWorkspace));
}

export function getCharacter(characterId: string): Character | null {
  return listCharacters().find((c) => c.id === characterId) ?? null;
}
