import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';
import { fetchData, searchEntities } from '../services/api';
import {
  createHeroEmbed,
  createUnitEmbed,
  createSpellEmbed,
  createTitanEmbed,
  createConsumableEmbed,
} from '../utils/embeds';
import { Hero, Unit, Spell, Titan, Consumable } from '../types';

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
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();

    // Ensure data is loaded (if not already)
    await fetchData();

    // Use cached search
    const results = searchEntities(focusedValue);

    const choices = results.slice(0, 25).map((choice: any) => ({
      name: `${choice.name} (${choice.type})`,
      value: choice.name,
    }));

    await interaction.respond(choices);
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('name', true);
    
    // Ensure data is loaded
    await fetchData();

    // 1. Try Exact Match (Optimized O(N) single pass)
    // We import this from api.ts now to avoid the 5-pass scan in the command itself.
    const { findEntityByName } = await import('../services/api'); 
    const exactMatch = findEntityByName(query);

    if (exactMatch) {
      const type = exactMatch.type.toLowerCase();
      
      switch (type) {
        case 'hero':
          await interaction.reply({ embeds: [createHeroEmbed(exactMatch as Hero)] });
          return;
        case 'unit':
          await interaction.reply({ embeds: [createUnitEmbed(exactMatch as Unit)] });
          return;
        case 'spell':
          await interaction.reply({ embeds: [createSpellEmbed(exactMatch as Spell)] });
          return;
        case 'titan':
          await interaction.reply({ embeds: [createTitanEmbed(exactMatch as Titan)] });
          return;
        case 'consumable':
          await interaction.reply({ embeds: [createConsumableEmbed(exactMatch as Consumable)] });
          return;
      }
    }

    // 2. Fuzzy Search Fallback
    const results = searchEntities(query);
    const bestMatch = results[0];

    if (bestMatch) {
      await interaction.reply({
        content: `Entity "${query}" not found. Did you mean **${bestMatch.name}**?`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: `No entity found matching "${query}".`, ephemeral: true });
    }
  },
};
