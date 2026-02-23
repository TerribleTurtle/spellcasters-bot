import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';
import { fetchData, searchEntities, findEntityByName } from '../services/api';
import { createEntityEmbed, createErrorEmbed } from '../utils/embeds';
import { Entity } from '../types';

export const command = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for any entity (Hero, Unit, Spell, Titan, Consumable).')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the entity')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  /**
   * Handles autocomplete choices.
   * @param interaction - The autocomplete interaction.
   */
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();

    // Ensure data is loaded (if not already)
    await fetchData();

    // Use cached search
    const results = searchEntities(focusedValue);

    const choices = results.slice(0, 25).map((choice: Entity) => ({
      name: `${choice.name} (${choice.type})`,
      value: choice.name,
    }));

    await interaction.respond(choices);
  },
  /**
   * Executes the command.
   * @param interaction - The command interaction.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('name', true);

    await interaction.deferReply();

    // Ensure data is loaded
    await fetchData();

    // 1. Try Exact Match
    const exactMatch = findEntityByName(query);

    if (exactMatch) {
      await interaction.editReply({ embeds: [createEntityEmbed(exactMatch)] });
      return;
    }

    // 2. Fuzzy Search Fallback
    const results = searchEntities(query);
    const bestMatch = results[0];

    if (bestMatch) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            `Entity "${query}" not found. Did you mean **${bestMatch.name}** (${bestMatch.type})?`,
          ),
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(`No entity found matching "${query}".`)],
      });
    }
  },
};
