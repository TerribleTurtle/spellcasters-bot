import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { searchEntities, findEntityByName } from '../services/api';
import { createHeroEmbed } from '../utils/embeds';
import { Hero } from '../types';

export const command = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('Get detailed information about a specific Hero')
    .addStringOption((option) =>
      option.setName('name').setDescription('Name of the hero').setRequired(true).setAutocomplete(true),
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const results = await searchEntities(focusedValue);
    // Filter for Heroes only and limit to 25
    const filtered = results
      .filter((item: any) => item.type === 'Hero')
      .slice(0, 25)
      .map((item: any) => ({ name: item.name, value: item.name }));
    
    await interaction.respond(filtered);
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('name', true);
    await interaction.deferReply();

    const result = await findEntityByName(name);

    if (!result || result.type !== 'Hero') {
      await interaction.editReply(`❌ Could not find hero "**${name}**".`);
      return;
    }

    const embed = createHeroEmbed(result as Hero);
    await interaction.editReply({ embeds: [embed] });
  },
};
