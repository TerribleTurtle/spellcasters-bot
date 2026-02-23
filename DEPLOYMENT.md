# Spellcasters Bot v2 Deployment Guide

**Target Environment:** Google Cloud e2-micro (2 vCPU, 1GB RAM)
**Strategy:** "Upload & Run" (Automated In-Place Update)

## 1. Prerequisites

- **Node.js:** v18.0.0+
- **PM2:** For process management (`npm install -g pm2`)
- **Unzip:** Installed on server (`sudo apt install unzip`)

## 2. Initial Setup (First Time Only)

If this is a brand new server:

1.  **Extract the project:**
    ```bash
    unzip spellcasters-bot-v2.zip -d spellcasters-bot
    ```
2.  **Move the deployment script:**
    ```bash
    mv spellcasters-bot/deploy.sh .
    chmod +x deploy.sh
    ```
3.  **Configure:**
    Create a `.env` file inside `spellcasters-bot/` with your token:
    ```env
    DISCORD_TOKEN=your_token_here
    DATA_URL=https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json
    # ERROR_WEBHOOK_URL=your_webhook_url (optional)
    # GUILD_ID=your_dev_server_id (optional)
    CACHE_TTL_HOURS=6
    NODE_ENV=production
    ```
4.  **Run Deploy:**
    ```bash
    ./deploy.sh spellcasters-bot-v2.zip
    ```

## 3. Creating the Deployment Package

On your development machine, run:

```bash
npm run pack
```

This creates `spellcasters-bot-v2.zip` with all necessary files (source, configs, scripts, data) while excluding `node_modules` and `.env` files.

## 4. Routine Updates (The Standard Process)

When you have a new version (e.g., `spellcasters-bot-v2.zip`):

1.  **Upload** the zip file to your server's home directory.
2.  **Run** the deployment script:
    ```bash
    ./deploy.sh spellcasters-bot-v2.zip
    ```

**What `deploy.sh` does automatically:**

- 🛑 Stops the running bot.
- 💾 Backs up your `.env` configuration.
- 📦 Unzips the new code suitable for v2.
- ♻️ Restores your `.env`.
- 🛠️ Installs dependencies and rebuilds.
- 🤖 Refreshes Slash Commands (Optimized for memory).
- ▶️ Restarts the bot using PM2.
- 🧹 Deletes the zip file to save space.

## Troubleshooting

- **Bot not starting?**
  Run `pm2 logs spellcasters-bot` to see errors.
- **Slash commands missing?**
  The script runs command registration automatically. If it fails (e.g. out of memory), try running it manually: `node dist/deploy-commands.js`
- **Memory Issues?**
  The bot is optimized for low-memory environments (cached search index). Ensure no other heavy processes are running.
