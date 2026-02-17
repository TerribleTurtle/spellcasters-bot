import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getRandomEntity } from '../services/api';
import { createHeroEmbed, createUnitEmbed, createSpellEmbed, createTitanEmbed, createConsumableEmbed } from '../utils/embeds';

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
  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const entity = await getRandomEntity(type || undefined);

    if (!entity) {
      await interaction.editReply('❌ No entities found.');
      return;
    }

    let embed;
    switch (entity.type) {
      case 'Hero': embed = createHeroEmbed(entity); break;
      case 'Unit': embed = createUnitEmbed(entity); break;
      case 'Spell': embed = createSpellEmbed(entity); break;
      case 'Titan': embed = createTitanEmbed(entity); break;
      case 'Consumable': embed = createConsumableEmbed(entity); break;
      default: embed = createUnitEmbed(entity);
    }

    await interaction.editReply({ content: `🎲 **Random ${entity.type}**`, embeds: [embed] });
  },
};
