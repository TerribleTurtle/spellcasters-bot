import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { filterEntities } from '../services/api';
import { createEntityEmbed, createErrorEmbed } from '../utils/embeds';
import { Entity, hasRank } from '../types';
import { RANK_ORDER, PAGINATION_TIMEOUT_MS } from '../constants';

export const command = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List entities with filters')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of entity')
        .setRequired(true)
        .addChoices(
          { name: 'Heroes', value: 'Hero' },
          { name: 'Units', value: 'Unit' },
          { name: 'Spells', value: 'Spell' },
          { name: 'Titans', value: 'Titan' },
          { name: 'Consumables', value: 'Consumable' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('school')
        .setDescription('Magic School filter')
        .addChoices(
          { name: 'Astral', value: 'Astral' },
          { name: 'War', value: 'War' },
          { name: 'Elemental', value: 'Elemental' },
          { name: 'Holy', value: 'Holy' },
          { name: 'Necromancy', value: 'Necromancy' },
          { name: 'Wild', value: 'Wild' },
          { name: 'Technomancy', value: 'Technomancy' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('rank')
        .setDescription('Rank filter')
        .addChoices(
          { name: 'Rank I', value: 'I' },
          { name: 'Rank II', value: 'II' },
          { name: 'Rank III', value: 'III' },
          { name: 'Rank IV', value: 'IV' },
          { name: 'Rank V', value: 'V' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('sort')
        .setDescription('Sort order (default: Name)')
        .addChoices({ name: 'Name (A-Z)', value: 'name' }, { name: 'Rank', value: 'rank' }),
    ),
  /**
   * Executes the command.
   * @param interaction - The command interaction.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type', true);
    const school = interaction.options.getString('school');
    const rank = interaction.options.getString('rank');
    const sort = interaction.options.getString('sort') || 'name';

    await interaction.deferReply();

    const entities = await filterEntities(type, school || undefined, rank || undefined);

    if (entities.length === 0) {
      await interaction.editReply({
        embeds: [createErrorEmbed('No entities found matching your filters.')],
      });
      return;
    }

    // Sort results
    if (sort === 'rank') {
      entities.sort((a: Entity, b: Entity) => {
        const ra = hasRank(a) && RANK_ORDER[a.rank] ? RANK_ORDER[a.rank] : 99;
        const rb = hasRank(b) && RANK_ORDER[b.rank] ? RANK_ORDER[b.rank] : 99;
        return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
      });
    } else {
      entities.sort((a: Entity, b: Entity) => a.name.localeCompare(b.name));
    }

    let currentPage = 0;
    const maxPages = entities.length;

    const generateResponse = (page: number) => {
      const entity = entities[page];
      const embed = createEntityEmbed(entity);
      const entityId = entity.entity_id || entity.name.toLowerCase().replace(/\s+/g, '_');
      embed.setFooter({ text: `Page ${page + 1}/${maxPages} | ID: ${entityId}` });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️ Prev')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === maxPages - 1),
      );

      return { embeds: [embed], components: [row] };
    };

    const response = await interaction.editReply(generateResponse(currentPage));

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: PAGINATION_TIMEOUT_MS,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: 'These buttons are not for you!', ephemeral: true });
        return;
      }

      if (i.customId === 'prev') {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId === 'next') {
        currentPage = Math.min(maxPages - 1, currentPage + 1);
      }

      await i.update(generateResponse(currentPage));
    });

    collector.on('end', async () => {
      try {
        // Disable buttons
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀️ Prev')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        );
        await interaction.editReply({ components: [disabledRow] });
      } catch (error) {
        console.error('Failed to update list buttons on end, message might be deleted.', error);
      }
    });
  },
};
