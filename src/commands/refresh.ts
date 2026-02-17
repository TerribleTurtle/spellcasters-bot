import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { fetchData } from '../services/api';

export const command = {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Force refresh database from API')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Only allow users with Manage Guild permission
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: 'You do not have permission to run this.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const data = await fetchData(true);
      const summary = [
        `✅ **Database Refreshed!**`,
        `- Heroes: ${data.heroes.length}`,
        `- Units: ${data.units.length}`,
        `- Spells: ${data.spells.length}`,
        `- Titans: ${data.titans.length}`,
        `- Consumables: ${data.consumables.length}`,
      ].join('\n');

      await interaction.editReply(summary);
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Failed to refresh database.');
    }
  },
};
