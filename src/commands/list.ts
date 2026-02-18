import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { filterEntities } from '../services/api';
import {
  createHeroEmbed,
  createUnitEmbed,
  createSpellEmbed,
  createTitanEmbed,
  createConsumableEmbed,
} from '../utils/embeds';

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
  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type', true);
    const school = interaction.options.getString('school');
    const rank = interaction.options.getString('rank');
    const sort = interaction.options.getString('sort') || 'name';

    await interaction.deferReply();

    const entities = await filterEntities(type, school || undefined, rank || undefined);

    if (entities.length === 0) {
      await interaction.editReply('❌ No entities found matching your filters.');
      return;
    }

    // Sort results
    const rankOrder: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
    if (sort === 'rank') {
      entities.sort((a: any, b: any) => {
        const ra = rankOrder[a.rank] ?? 99;
        const rb = rankOrder[b.rank] ?? 99;
        return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
      });
    } else {
      entities.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    let currentPage = 0;
    const maxPages = entities.length;

    const generateResponse = (page: number) => {
      const entity = entities[page];
      let embed;
      switch (entity.type) {
        case 'Hero':
          embed = createHeroEmbed(entity);
          break;
        case 'Unit':
          embed = createUnitEmbed(entity);
          break;
        case 'Spell':
          embed = createSpellEmbed(entity);
          break;
        case 'Titan':
          embed = createTitanEmbed(entity);
          break;
        case 'Consumable':
          embed = createConsumableEmbed(entity);
          break;
        default:
          embed = createUnitEmbed(entity);
      }
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
      time: 120_000,
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
    });
  },
};
