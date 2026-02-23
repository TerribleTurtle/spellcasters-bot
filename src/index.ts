import {
  Client,
  GatewayIntentBits,
  Events,
  Interaction,
  Collection,
  ActivityType,
} from 'discord.js';
import { config } from './config';
import { fetchData } from './services/api';
import { logError } from './services/logger';
import { recordCommand } from './services/stats';
import { checkCooldown } from './services/cooldowns';
import { commands as commandList } from './commands';
import { Command } from './types';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // GatewayIntentBits.MessageContent, // No longer strictly needed for slash commands
  ],
});

// Load commands into a Collection for easy access
const commands = new Collection<string, Command>();
for (const command of Object.values(commandList)) {
  commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  // Set bot status
  c.user.setPresence({
    activities: [{ name: 'Spellcasters | /help', type: ActivityType.Playing }],
    status: 'online',
  });

  // Fetch data on startup to warm the cache
  try {
    await fetchData();
  } catch (error) {
    await logError('Startup', error);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  // Handle Chat Input Commands
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      // Check cooldown before executing
      const remaining = checkCooldown(
        interaction.commandName,
        interaction.user.id,
        command.cooldown,
      );
      if (remaining > 0) {
        await interaction.reply({
          content: `⏳ Please wait **${remaining}** second${remaining === 1 ? '' : 's'} before using \`/${interaction.commandName}\` again.`,
          ephemeral: true,
        });
        return;
      }

      recordCommand(interaction.commandName);
      await command.execute(interaction);
    } catch (error) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
      logError(`Command: /${interaction.commandName}`, error).catch(console.error);
    }
  }
  // Handle Autocomplete
  else if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      if (command.autocomplete) {
        await command.autocomplete(interaction);
      }
    } catch (error) {
      logError(`Autocomplete: /${interaction.commandName}`, error).catch(console.error);
    }
  }
});

client.login(config.DISCORD_TOKEN);

// --- Process Guards & Graceful Shutdown ---

process.on('unhandledRejection', (error) => {
  logError('UnhandledRejection', error);
});

process.on('uncaughtException', (error) => {
  logError('UncaughtException', error)
    .then(() => process.exit(1))
    .catch(() => process.exit(1));
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  await client.destroy();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// --- Discord Connection Events ---

client.on(Events.ShardDisconnect, (event) => {
  console.warn(`[ShardDisconnect] Code: ${event.code}, Reason: ${event.reason}`);
});

client.on(Events.ShardReconnecting, () => {
  console.log('[ShardReconnecting] Attempting to reconnect to Discord...');
});
