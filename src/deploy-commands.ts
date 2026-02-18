import { REST, Routes } from 'discord.js';
import { config } from './config';
import { commands } from './commands';

const commandsData = Object.values(commands).map((command: any) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN!);

(async () => {
  try {
    const user = (await rest.get(Routes.user('@me'))) as any;
    const clientId = user.id;

    // 1. Clear any stale guild-scoped commands that could mask global ones
    console.log('Clearing stale guild commands...');
    const guilds = (await rest.get(Routes.userGuilds())) as any[];
    for (const guild of guilds) {
      const guildCmds = (await rest.get(Routes.applicationGuildCommands(clientId, guild.id))) as any[];
      if (guildCmds.length > 0) {
        console.log(`  Removing ${guildCmds.length} guild command(s) from: ${guild.name}`);
        await rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: [] });
      }
    }

    // 2. Register all commands globally
    console.log(`Deploying ${commandsData.length} global commands (may take up to 1 hour to propagate)...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commandsData });

    console.log('✅ Successfully registered all global commands.');
  } catch (error) {
    console.error('❌ Command registration failed:', error);
    process.exit(1);
  }
})();
