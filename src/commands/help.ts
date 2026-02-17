import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Spellcasters Bot — Commands')
      .setColor(0x5865f2)
      .setDescription('Use these slash commands to explore the world of Spellcasters.')
      .addFields(
        {
          name: '🔍 /search <query>',
          value: 'Find any entity by name (fuzzy match).\n*Example:* `/search Fire Ball`',
        },
        {
          name: '🦸 /hero <name>',
          value: 'Detailed hero card with all abilities.\n*Example:* `/hero Swamp Witch`',
        },
        {
          name: '📋 /list <type> [school] [rank] [sort]',
          value: 'Browse entities with filters. Sort by Name (default) or Rank.\n*Example:* `/list units War II`',
        },
        {
          name: '⚔️ /compare <first> <second>',
          value: 'Side-by-side stat comparison.\n*Example:* `/compare Harpy Lizard Archer`',
        },
        {
          name: '🎲 /random [type]',
          value: 'Show a random entity. Optionally filter by type.\n*Example:* `/random spell`',
        },
        {
          name: 'ℹ️ /about',
          value: 'Game info, database stats, and links.',
        },
        {
          name: '🏓 /ping',
          value: 'Check bot latency and API responsiveness.',
        },
        {
          name: '📩 /invite',
          value: 'Get a link to add this bot to your server.',
        },
        {
          name: '📊 /stats',
          value: 'Show bot usage statistics and database info.',
        },
      )
      .setFooter({ text: 'Tip: All name fields support autocomplete — just start typing!' });

    await interaction.reply({ embeds: [embed] });
  },
};
