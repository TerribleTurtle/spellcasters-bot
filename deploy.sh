#!/bin/bash

# Master Deployment Script
# Usage: ./deploy.sh <zip_filename>
# Example: ./deploy.sh spellcasters-bot-v2.zip

ZIP_FILE="$1"
TARGET_DIR="spellcasters-bot"

# 1. Validation
if [ -z "$ZIP_FILE" ]; then
    echo "❌ Error: Please specify the zip file."
    echo "Usage: ./deploy.sh <zip_filename>"
    exit 1
fi

if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ Error: Zip file '$ZIP_FILE' not found."
    exit 1
fi

echo "🚀 Starting Deployment for $ZIP_FILE..."

# 2. Stop existing service
echo "🛑 Stopping current bot process..."
pm2 stop spellcasters-bot || echo "Bot was not running."

# 3. Preparation
if [ ! -d "$TARGET_DIR" ]; then
    echo "📂 Creating target directory '$TARGET_DIR'..."
    mkdir "$TARGET_DIR"
fi

# 4. Backup Config
if [ -f "$TARGET_DIR/.env" ]; then
    echo "💾 Backing up .env..."
    cp "$TARGET_DIR/.env" "$TARGET_DIR/.env.bak"
fi

# 5. Extraction
echo "📦 Unzipping update..."
unzip -o "$ZIP_FILE" -d "$TARGET_DIR"

# 6. Restore Config
if [ -f "$TARGET_DIR/.env.bak" ]; then
    echo "♻️  Restoring .env..."
    cp "$TARGET_DIR/.env.bak" "$TARGET_DIR/.env"
fi

# 7. Build & Install
echo "🛠️  Building project..."
cd "$TARGET_DIR"
npm install
npm run build

# 8. Register Commands (Specific for v2)
echo "🤖 Registering Slash Commands..."
# Use node directly to save memory on e2-micro
node dist/deploy-commands.js

# 9. Restart
echo "▶️  Restarting bot..."
pm2 restart spellcasters-bot --update-env --env production || pm2 start dist/index.js --name spellcasters-bot --time --env production

# 10. Cleanup
cd ..
echo "🧹 Cleaning up zip file..."
rm "$ZIP_FILE"

echo "✅ Deployment Complete! Bot is running."
pm2 status spellcasters-bot
