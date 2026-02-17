# Spellcasters Bot (v2)

A Discord bot that provides information about Spellcasters, Spells, and Units from the Spellcasters Community API v2.

## Features

- **Slash Commands**:
  - `/search <query>` - Find any entity (fuzzy match).
  - `/hero <name>` - Deep dive into hero stats and abilities.
  - `/list <type> [school] [rank]` - Browse entities with filters (paginated).
  - `/compare <first> <second>` - Side-by-side stat comparison.
  - `/random [type]` - Get a random entity card.
  - `/about` - Game and bot information.

  - `/help` - Show all commands with examples.
  - `/invite` - Get a link to add the bot to your server.
  - `/ping` - Check bot latency and API responsiveness.
  - `/stats` - View bot uptime and usage statistics.
  - `/refresh` - Force refresh database from API (Manage Guild only).

- **Rich Embeds**: Displays full mechanics, difficulty, spell duration, and more.
- **Smart Search**: Uses fuzzy matching to find results even with typos.
- **Optimized**: Caches data in memory for fast responses on low-resource hosts.

## Development Setup

### Prerequisites

- Node.js v16+ (v20 Recommended)
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
    GUILD_ID=your_discord_guild_id
    # Optional: Webhook URL for error logging
    ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/...
    ```

    Start the development server:

    ```bash
    npm run dev
    ```

4.  **Code Quality Tools**:
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

### Building for Production

To build the TypeScript code to JavaScript:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Packaging for Deployment

To create a deployment zip file:

```bash
npm run pack
```

This creates `spellcasters-bot-v2.zip` containing all source code, configs, and data — ready to upload to your server. See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

## Hosting

Please refer to [DEPLOYMENT.md](DEPLOYMENT.md) for the official deployment guide.
This project includes a `deploy.sh` script for automated updates on Google Cloud e2-micro instances. It automatically configures `NODE_ENV=production` for optimal performance.

## 🌐 Part of the Spellcasters Ecosystem

- **[Spellcasters Community API](https://github.com/TerribleTurtle/spellcasters-community-api)** — The shared data source (GitHub Pages)
- **[SpellcastersDB](https://github.com/TerribleTurtle/spellcastersdb)** — The public database & deckbuilder
- **[The Grimoire](https://github.com/TerribleTurtle/spellcasters-manager)** — Data management & patch publishing

> All tools consume the same [Community API v2](https://terribleturtle.github.io/spellcasters-community-api/api/v2/).
