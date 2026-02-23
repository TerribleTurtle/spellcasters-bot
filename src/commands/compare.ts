import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  EmbedBuilder,
} from 'discord.js';
import { searchEntities, findEntityByName } from '../services/api';
import { Entity } from '../types';
import { COLORS, EMOJIS, safeStr } from '../constants';
import { createErrorEmbed } from '../utils/embeds';

export const command = {
  data: new SlashCommandBuilder()
    .setName('compare')
    .setDescription('Compare two entities side-by-side')
    .addStringOption((option) =>
      option
        .setName('first')
        .setDescription('First entity')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName('second')
        .setDescription('Second entity')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  /**
   * Handles autocomplete choices.
   * @param interaction - The autocomplete interaction.
   */
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const results = await searchEntities(focusedValue);
    const filtered = results
      .slice(0, 25)
      .map((item: Entity) => ({ name: item.name, value: item.name }));
    await interaction.respond(filtered);
  },
  /**
   * Executes the command.
   * @param interaction - The command interaction.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const name1 = interaction.options.getString('first', true);
    const name2 = interaction.options.getString('second', true);

    await interaction.deferReply();

    const entity1 = await findEntityByName(name1);
    const entity2 = await findEntityByName(name2);

    if (!entity1 || !entity2) {
      await interaction.editReply({
        embeds: [createErrorEmbed('One or both entities could not be found.')],
      });
      return;
    }

    if (entity1.type !== entity2.type) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            `Cannot compare different types: **${entity1.type}** vs **${entity2.type}**.`,
          ),
        ],
      });
      return;
    }

    const emoji = EMOJIS[entity1.type] || '⚔️';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Compare: ${entity1.name} vs ${entity2.name}`)
      .setColor(COLORS.COMPARE_ORANGE)
      .setDescription(`Comparing two **${entity1.type}s**.`)
      .setFooter({
        text: `${entity1.entity_id || entity1.name} vs ${entity2.entity_id || entity2.name}`,
      });

    const addComparison = (label: string, val1: unknown, val2: unknown, suffix = '') => {
      if ((val1 === undefined || val1 === null) && (val2 === undefined || val2 === null)) return;

      let v1Str = safeStr(val1);
      let v2Str = safeStr(val2);

      if (typeof val1 === 'number' && typeof val2 === 'number') {
        if (val1 > val2) v1Str += ' 🟢';
        if (val2 > val1) v2Str += ' 🟢';
      }

      embed.addFields({
        name: label,
        value: `**${entity1.name}:** ${v1Str}${suffix}\n**${entity2.name}:** ${v2Str}${suffix}`,
        inline: true,
      });
    };

    // Helper to safely access dynamic properties that might not exist on all subtypes
    const getProp = <K extends string>(entity: Entity, prop: K): unknown => {
      return typeof entity === 'object' && entity !== null && prop in entity
        ? (entity as Record<K, unknown>)[prop]
        : undefined;
    };

    // Identity
    addComparison('🏅 Rank', getProp(entity1, 'rank'), getProp(entity2, 'rank'));
    addComparison(
      '🔮 School',
      getProp(entity1, 'magic_school') || getProp(entity1, 'class'),
      getProp(entity2, 'magic_school') || getProp(entity2, 'class'),
    );
    addComparison('📂 Category', entity1.category, entity2.category);

    // Combat
    addComparison('❤️ Health', getProp(entity1, 'health'), getProp(entity2, 'health'));
    addComparison('⚔️ Damage', getProp(entity1, 'damage'), getProp(entity2, 'damage'));
    addComparison('⚔️ DPS', getProp(entity1, 'dps'), getProp(entity2, 'dps'));
    addComparison('🎯 Range', getProp(entity1, 'range'), getProp(entity2, 'range'));
    addComparison(
      '🌪️ Speed',
      getProp(entity1, 'movement_speed'),
      getProp(entity2, 'movement_speed'),
    );

    // Economy
    addComparison('⚡ Charges', getProp(entity1, 'charges'), getProp(entity2, 'charges'));
    addComparison(
      '⏱️ Recharge',
      getProp(entity1, 'recharge_time'),
      getProp(entity2, 'recharge_time'),
      's',
    );
    addComparison('👥 Population', getProp(entity1, 'population'), getProp(entity2, 'population'));
    addComparison('💰 Gold', getProp(entity1, 'gold_cost'), getProp(entity2, 'gold_cost'));

    await interaction.editReply({ embeds: [embed] });
  },
};
