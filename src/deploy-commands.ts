/**
 * Slash Command Registration Script
 *
 * This script is intended to be run standalone (e.g. `node dist/deploy-commands.js`).
 * It synchronizes the bot's slash commands with Discord's API in a two-step process:
 * 1. Queries and deletes any stale guild-scoped commands (which would override global ones).
 * 2. Registers all commands defined in the `src/commands/` directory globally.
 * @module
 */

import { REST, Routes, APIUser, APIGuild, APIApplicationCommand } from 'discord.js';
import { config } from './config';
import { commands } from './commands';

// Extract the raw JSON command data from the SlashCommandBuilders
const commandsData = Object.values(commands).map((command) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN!);

(async () => {
  try {
    const user = (await rest.get(Routes.user('@me'))) as APIUser;
    const clientId = user.id;

    // 1. Clear any stale guild-scoped commands that could mask global ones
    console.log('Clearing stale guild commands...');
    const guilds = (await rest.get(Routes.userGuilds())) as APIGuild[];
    for (const guild of guilds) {
      const guildCmds = (await rest.get(
        Routes.applicationGuildCommands(clientId, guild.id),
      )) as APIApplicationCommand[];
      if (guildCmds.length > 0) {
        console.log(`  Removing ${guildCmds.length} guild command(s) from: ${guild.name}`);
        await rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: [] });
      }
    }

    // 2. Register all commands globally
    console.log(
      `Deploying ${commandsData.length} global commands (may take up to 1 hour to propagate)...`,
    );
    await rest.put(Routes.applicationCommands(clientId), { body: commandsData });

    console.log('✅ Successfully registered all global commands.');
  } catch (error) {
    console.error('❌ Command registration failed:', error);
    process.exit(1);
  }
})();
