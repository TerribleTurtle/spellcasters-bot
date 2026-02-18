import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder().setName('help').setDescription('Show all available commands'),
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
          name: '📋 /list <type> [school] [rank] [sort]',
          value:
            'Browse entities with filters. Sort by Name (default) or Rank.\n*Example:* `/list units War II`',
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
          name: '📜 /patch [version]',
          value: 'Show patch notes.\n*Example:* `/patch` (latest) or `/patch 2.0.1`',
        },
        {
          name: 'ℹ️ /about',
          value: 'Game info, bot stats, and invite link.',
        },
        {
          name: '📖 /help',
          value: 'Show this command list.',
        },
      )
      .setFooter({ text: 'Tip: All name fields support autocomplete — just start typing!' });

    await interaction.reply({ embeds: [embed] });
  },
};
