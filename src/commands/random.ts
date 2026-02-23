import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getRandomEntity } from '../services/api';
import { createEntityEmbed, createErrorEmbed } from '../utils/embeds';

export const command = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Show a random entity')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Filter by type')
        .addChoices(
          { name: 'Hero', value: 'Hero' },
          { name: 'Unit', value: 'Unit' },
          { name: 'Spell', value: 'Spell' },
          { name: 'Titan', value: 'Titan' },
          { name: 'Consumable', value: 'Consumable' },
        ),
    ),
  /**
   * Executes the command.
   * @param interaction - The command interaction.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const entity = await getRandomEntity(type || undefined);

    if (!entity) {
      await interaction.editReply({ embeds: [createErrorEmbed('No entities found.')] });
      return;
    }

    const embed = createEntityEmbed(entity);

    await interaction.editReply({ content: `🎲 **Random ${entity.type}**`, embeds: [embed] });
  },
};
