import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export const config = {
  DISCORD_TOKEN: process.env.discord_token || process.env.DISCORD_TOKEN,
  DATA_URL:
    process.env.DATA_URL ||
    'https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json',
  ERROR_WEBHOOK_URL: process.env.ERROR_WEBHOOK_URL,
};

if (!config.DISCORD_TOKEN) {
  throw new Error('Missing discord_token in environment variables');
}
