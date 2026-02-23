/** External URLs for game assets, API, and community resources. */
export const URLS = {
  WIKI_BASE: 'https://www.spellcastersdb.com',
  IMAGE_BASE: 'https://terribleturtle.github.io/spellcasters-community-api/assets',
  COMMUNITY_API: 'https://terribleturtle.github.io/spellcasters-community-api/',
  SPELLCASTERS_DB: 'https://terribleturtle.github.io/spellcastersdb',
  SUPPORT_SERVER: 'https://discord.gg/spellcasters',
};

/** Static text strings used in UI elements. */
export const UI = {
  FOOTER_TEXT: 'View on SpellcastersDB',
};

/** Hex color codes mapped to magic schools and UI states. */
export const COLORS = {
  ASTRAL: 0x2e86c1,
  WAR: 0xc0392b,
  ELEMENTAL: 0xf39c12,
  HOLY: 0xf1c40f,
  NECROMANCY: 0x8e44ad,
  WILD: 0x27ae60,
  TECHNOMANCY: 0x7f8c8d,
  TITAN: 0xe74c3c,
  DEFAULT_BLUE: 0x0099ff,
  CONSUMABLE_GREEN: 0x00ff00,
  ERROR_RED: 0xff0000,
  COMPARE_ORANGE: 0xffaa00,
  HELP_BLURPLE: 0x5865f2,
  ABOUT_PURPLE: 0x9b59b6,
};

/** Discord emojis matching entity categories. */
export const EMOJIS: Record<string, string> = {
  Hero: '🧙',
  Unit: '🐾',
  Spell: '📜',
  Titan: '🗿',
  Consumable: '💊',
};

/** Rank sort order for Roman numeral ranks. */
export const RANK_ORDER: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

/** Timeout (ms) for interactive pagination button collectors. */
export const PAGINATION_TIMEOUT_MS = 120_000;

/** Fuse.js fuzzy search threshold (0 = exact, 1 = anything). */
export const FUSE_THRESHOLD = 0.4;

/** Safely format a value for an embed field. Returns 'N/A' for null/undefined/empty. */
export const safeStr = (val: unknown, suffix = ''): string => {
  if (val === null || val === undefined || val === '') return 'N/A';
  return `${val}${suffix}`;
};
