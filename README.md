# Spellcasters Bot (v2)

A Discord bot for looking up Heroes, Units, Spells, Titans, and Consumables from the Spellcasters Community API v2.

## Features

- **Slash Commands**:
  - `/search <query>` - Find any entity (fuzzy match).
  - `/list <type> [school] [rank]` - Browse entities with filters (paginated).
  - `/compare <first> <second>` - Side-by-side stat comparison.
  - `/random [type]` - Get a random entity card.
  - `/patch [version]` - Show patch notes.
  - `/about` - Game info, bot stats, and invite link.

  - `/help` - Show all commands with examples.
  - `/refresh` - Force refresh database from API (Manage Guild only).

- **Rich Embeds**: Displays full mechanics, difficulty, spell duration, and more.
- **Smart Search**: Uses fuzzy matching to find results even with typos.
- **Optimized**: Caches data in memory for fast responses on low-resource hosts.

## Development Setup

### Prerequisites

- Node.js v18+ (v20 Recommended)
- npm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory:

    ```env
    DISCORD_TOKEN=your_discord_bot_token
    DATA_URL=https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json
    # Optional: Webhook URL for error logging
    ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/...

    # Optional Bot Hardening
    CACHE_TTL_HOURS=6
    GUILD_ID=your_test_server_id_(optional)
    NODE_ENV=development
    ```

4.  **Start the development server:**

    ```bash
    npm run dev
    ```

5.  **Code Quality Tools**:
    - **Linting**: Check for errors:
      ```bash
      npm run lint
      ```
    - **Formatting**: Auto-format code:
      ```bash
      npm run format
      ```
    - **Schema Validation**: Verify data integrity:
      ```bash
      npm run validate
      ```
    - **Testing**: Run the Vitest suite:
      ```bash
      npm run test
      ```
      Or watch mode for development:
      ```bash
      npm run test:watch
      ```

### Building for Production

To build the TypeScript code to JavaScript:

```bash
npm run build
```

To run the production build:

```bash
npm run start
```

The output and entrypoint will be in the `dist/` directory.

### Development Scripts 🛠️

The repository includes a `scripts/` directory containing utility scripts (like `analyze_conditions.py` and `analyze_features.py`) used by maintainers to scan raw API data for edge cases and standardize schemas. These are not required to run the bot.

### Packaging for Deployment

To create a deployment zip file:

```bash
npm run pack
```

This creates `spellcasters-bot-v2.zip` containing all source code, configs, and data — ready to upload to your server. See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

## Hosting

Please refer to [DEPLOYMENT.md](DEPLOYMENT.md) for the official deployment guide.
This project includes a `deploy.sh` script for automated updates on Google Cloud e2-micro instances. It respects the `NODE_ENV` configuration loaded from `.env`.

See [active_state.md](active_state.md) for the internal project status and recent changelog milestones.

## 🌐 Part of the Spellcasters Ecosystem

- **[Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api)** — The shared data source (GitHub Pages)
- **[SpellcastersDB](https://github.com/TerribleTurtle/spellcastersdb)** — The public database & deckbuilder
- **[The Grimoire](https://github.com/TerribleTurtle/spellcasters-manager)** — Data management & patch publishing

> All tools consume the same [Community API v2](https://terribleturtle.github.io/spellcasters-community-api/api/v2/).
