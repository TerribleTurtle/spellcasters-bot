import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

/**
 * Centralized application configuration. Values are loaded from `.env.local`
 * first (dev override), then `.env`. Falls back to sensible defaults.
 *
 * @property DISCORD_TOKEN - Discord bot token (required).
 * @property DATA_URL - URL to fetch game data JSON.
 * @property ERROR_WEBHOOK_URL - Optional Discord webhook for error logging.
 * @property CACHE_TTL_HOURS - Hours to cache API data before refetching (default: 6).
 * @property GUILD_ID - Optional guild ID for dev-mode command registration.
 * @property NODE_ENV - Runtime environment (default: 'production').
 */
export const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DATA_URL:
    process.env.DATA_URL ||
    'https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json',
  ERROR_WEBHOOK_URL: process.env.ERROR_WEBHOOK_URL,
  CACHE_TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS || '6', 10),
  GUILD_ID: process.env.GUILD_ID,
  NODE_ENV: process.env.NODE_ENV || 'production',
};

if (!config.DISCORD_TOKEN) {
  throw new Error('Missing discord_token in environment variables');
}
