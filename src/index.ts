import { Client, GatewayIntentBits, Events, Interaction, Collection, ActivityType } from 'discord.js';
import { config } from './config';
import { fetchData } from './services/api';
import { logError } from './services/logger';
import { recordCommand } from './services/stats';
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
      recordCommand(interaction.commandName);
      await command.execute(interaction);
    } catch (error) {
      await logError(`Command: /${interaction.commandName}`, error);
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
      await logError(`Autocomplete: /${interaction.commandName}`, error);
    }
  }
});

client.login(config.DISCORD_TOKEN);
