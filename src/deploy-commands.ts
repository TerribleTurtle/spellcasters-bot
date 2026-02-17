import { REST, Routes } from 'discord.js';
import { config } from './config';
import { commands } from './commands';

const commandsData = Object.values(commands).map((command: any) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(`Started refreshing ${commandsData.length} application (/) commands.`);

    // For guild-based development (instant updates)
    // await rest.put(
    // 	Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    // 	{ body: commandsData },
    // );

    // For global production (takes up to an hour)
    // We need the client ID. Since we don't have it in config, we can fetch it or just use 'applicationCommands' relative to the token if we had the ID.
    // However, Routes.applicationCommands requires application ID.
    // We can get it from the token... or we can just ask the client to do it on ready.
    // A better approach for standalone script is to require CLIENT_ID in .env

    const user = (await rest.get(Routes.user('@me'))) as any;
    const clientId = user.id;

    console.log(`Deploying to client ID: ${clientId}`);

    if (config.GUILD_ID) {
        console.log(`Deploying to Guild ID: ${config.GUILD_ID}`);
        await rest.put(Routes.applicationGuildCommands(clientId, config.GUILD_ID), { body: commandsData });
    } else {
        console.log('Deploying globally (might take 1 hour to propagate)...');
        await rest.put(Routes.applicationCommands(clientId), { body: commandsData });
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
