import { EmbedBuilder } from 'discord.js';
import { Entity, Hero, Unit, Spell, Titan, Consumable } from '../types';
import { URLS, UI, COLORS, EMOJIS, safeStr as safe } from '../constants';

// --- Private Helpers ---

const getEntityId = (entity: { entity_id?: string; name: string }): string => {
  return entity.entity_id || entity.name.toLowerCase().replace(/\s+/g, '_');
};

const WIKI_PATHS: Record<string, string> = {
  hero: 'spellcasters',
  unit: 'incantations/units',
  spell: 'incantations/spells',
  titan: 'titans',
  consumable: 'consumables',
};

const getWikiUrl = (type: string, id: string): string => {
  const path = WIKI_PATHS[type];
  return path ? `${URLS.WIKI_BASE}/${path}/${id}` : URLS.WIKI_BASE;
};

const getImageUrl = (type: string, id: string): string => {
  const dir = type === 'hero' ? 'heroes' : type + 's';
  return `${URLS.IMAGE_BASE}/${dir}/${id}.png`;
};

const SCHOOL_COLORS: Record<string, number> = {
  Astral: COLORS.ASTRAL,
  War: COLORS.WAR,
  Elemental: COLORS.ELEMENTAL,
  Holy: COLORS.HOLY,
  Necromancy: COLORS.NECROMANCY,
  Wild: COLORS.WILD,
  Technomancy: COLORS.TECHNOMANCY,
  Titan: COLORS.TITAN,
};

const getSchoolColor = (school: string | undefined): number => {
  return (school && SCHOOL_COLORS[school]) || COLORS.DEFAULT_BLUE;
};

const getDifficultyStars = (difficulty: number | undefined): string => {
  if (!difficulty || difficulty <= 0) return 'N/A';
  return '⭐'.repeat(Math.min(difficulty, 5));
};

const getCostString = (entity: {
  charges: number;
  recharge_time: number;
  cast_time?: number;
}): string => {
  const parts = [
    `Charges: ${safe(entity.charges)}`,
    `Recharge: ${safe(entity.recharge_time, 's')}`,
  ];
  if (entity.cast_time && entity.cast_time > 0) parts.push(`Cast: ${entity.cast_time}s`);
  return parts.join(' | ');
};

// --- Base Embed Builder ---

/**
 * Creates a pre-configured EmbedBuilder with standard Title, Description,
 * Color, URL, Thumbnail, and Footer shared by all entity types.
 */
const createBaseEmbed = (
  entity: Entity,
  type: string,
  emojiPrefix: string,
  color: number,
): EmbedBuilder => {
  const id = getEntityId(entity);
  return new EmbedBuilder()
    .setTitle(`${emojiPrefix} ${entity.name}`)
    .setDescription(entity.description || 'No description provided.')
    .setColor(color)
    .setURL(getWikiUrl(type, id))
    .setThumbnail(getImageUrl(type, id))
    .setFooter({ text: `${UI.FOOTER_TEXT} | ID: ${id}` });
};

// --- Type-Specific Embed Builders ---

/**
 * Creates an EmbedBuilder customized for a Hero entity.
 * @param hero - The Hero entity to display.
 * @returns A fully configured Discord EmbedBuilder.
 */
export const createHeroEmbed = (hero: Hero): EmbedBuilder => {
  // Heroes use class-based color, but there's no magic_school — use default blue
  const embed = createBaseEmbed(hero as Entity, 'hero', EMOJIS.Hero || '🧙', COLORS.DEFAULT_BLUE);

  // Identity
  embed.addFields(
    { name: '🎓 Class', value: safe(hero.class), inline: true },
    { name: '📂 Category', value: safe(hero.category), inline: true },
    { name: '⭐ Difficulty', value: getDifficultyStars(hero.difficulty), inline: true },
  );

  // Stats
  embed.addFields(
    { name: '❤️ Health', value: safe(hero.health), inline: true },
    { name: '👥 Population', value: safe(hero.population), inline: true },
    { name: '🦶 Movement', value: safe(hero.movement_type), inline: true },
  );

  // Primary Ability
  let primaryDesc = hero.abilities.primary.description || 'No description.';
  if (hero.abilities.primary.damage)
    primaryDesc += `\n**Damage:** ${hero.abilities.primary.damage}`;
  if (hero.abilities.primary.mechanics) {
    const mechs = [];
    if (hero.abilities.primary.mechanics.pierce) mechs.push('Pierce');
    if (hero.abilities.primary.mechanics.cleave) mechs.push('Cleave');
    if (hero.abilities.primary.mechanics.homing) mechs.push('Homing');
    if (mechs.length) primaryDesc += `\n*Mechanics: ${mechs.join(', ')}*`;
  }
  embed.addFields({
    name: `⚔️ Primary: ${hero.abilities.primary.name || 'Unknown'}`,
    value: primaryDesc,
  });

  // Defense Ability
  const def = hero.abilities.defense;
  let defenseDesc = def.description || 'No description.';
  const defStats = [];
  if (def.charges) defStats.push(`Charges: ${def.charges}`);
  if (def.cooldown) defStats.push(`CD: ${def.cooldown}s`);
  if (def.duration) defStats.push(`Dur: ${def.duration}s`);
  if (defStats.length) defenseDesc += `\n*(${defStats.join(' | ')})*`;
  embed.addFields({ name: `🛡️ Defense: ${def.name || 'Unknown'}`, value: defenseDesc });

  // Ultimate Ability
  let ultDesc = hero.abilities.ultimate.description || 'No description.';
  if (hero.abilities.ultimate.duration)
    ultDesc += `\n**Duration:** ${hero.abilities.ultimate.duration}s`;
  embed.addFields({
    name: `🔥 Ultimate: ${hero.abilities.ultimate.name || 'Unknown'}`,
    value: ultDesc,
  });

  if (hero.abilities.passive.length > 0) {
    embed.addFields({
      name: 'Passive',
      value: hero.abilities.passive.map((p) => `**${p.name}**: ${p.description}`).join('\n'),
    });
  }
  return embed;
};

/**
 * Creates an EmbedBuilder customized for a Unit entity (including Buildings).
 * @param unit - The Unit entity to display.
 * @returns A fully configured Discord EmbedBuilder.
 */
export const createUnitEmbed = (unit: Unit): EmbedBuilder => {
  const categoryEmoji = unit.category === 'Building' ? '🏗️' : EMOJIS.Unit || '🐾';
  const embed = createBaseEmbed(
    unit as Entity,
    'unit',
    categoryEmoji,
    getSchoolColor(unit.magic_school),
  );

  // Identity
  embed.addFields(
    { name: '🏅 Rank', value: safe(unit.rank), inline: true },
    { name: '🔮 School', value: safe(unit.magic_school), inline: true },
    { name: '📂 Type', value: safe(unit.category), inline: true },
  );

  // Combat
  embed.addFields(
    { name: '❤️ Health', value: safe(unit.health), inline: true },
    { name: '⚔️ Damage', value: safe(unit.damage), inline: true },
    { name: '⚔️ DPS', value: safe(unit.dps), inline: true },
  );

  if (unit.category !== 'Building') {
    embed.addFields(
      { name: '🎯 Range', value: safe(unit.range), inline: true },
      { name: '🌪️ Speed', value: safe(unit.movement_speed), inline: true },
    );
  } else {
    embed.addFields({ name: '🎯 Range', value: safe(unit.range), inline: true });
  }

  embed.addFields({ name: '💎 Cost', value: getCostString(unit), inline: false });

  if (unit.mechanics) {
    const mechs: string[] = [];
    if (unit.mechanics.spawner) mechs.push('Spawner');
    if (unit.mechanics.aura) mechs.push('Aura');
    if (unit.mechanics.damage_modifiers) mechs.push('Damage Modifiers');

    if (mechs.length > 0) {
      embed.addFields({ name: '⚙️ Mechanics', value: mechs.join(', '), inline: false });
    }
  }

  return embed;
};

/**
 * Creates an EmbedBuilder customized for a Spell entity.
 * @param spell - The Spell entity to display.
 * @returns A fully configured Discord EmbedBuilder.
 */
export const createSpellEmbed = (spell: Spell): EmbedBuilder => {
  const embed = createBaseEmbed(
    spell as Entity,
    'spell',
    EMOJIS.Spell || '📜',
    getSchoolColor(spell.magic_school),
  );

  embed.addFields(
    { name: '🏅 Rank', value: safe(spell.rank), inline: true },
    { name: '🔮 School', value: safe(spell.magic_school), inline: true },
    { name: '🎯 Range', value: safe(spell.range), inline: true },
  );

  if (spell.damage != null)
    embed.addFields({ name: '⚔️ Damage', value: safe(spell.damage), inline: true });
  if (spell.value != null)
    embed.addFields({ name: '💚 Value', value: safe(spell.value), inline: true });
  if (spell.duration)
    embed.addFields({ name: '⏳ Duration', value: safe(spell.duration, 's'), inline: true });

  embed.addFields({ name: '💎 Cost', value: getCostString(spell), inline: false });

  if (spell.mechanics) {
    const details = [];
    if (spell.mechanics.waves) details.push(`Waves: ${spell.mechanics.waves}`);
    if (spell.mechanics.damage_modifiers) details.push('Modifiers');
    if (details.length)
      embed.addFields({ name: '⚙️ Mechanics', value: details.join(', '), inline: true });
  }

  return embed;
};

/**
 * Creates an EmbedBuilder customized for a Titan entity.
 * @param titan - The Titan entity to display.
 * @returns A fully configured Discord EmbedBuilder.
 */
export const createTitanEmbed = (titan: Titan): EmbedBuilder => {
  const embed = createBaseEmbed(
    titan as Entity,
    'titan',
    EMOJIS.Titan || '🗿',
    getSchoolColor(titan.magic_school),
  );

  // Identity
  embed.addFields(
    { name: '🏅 Rank', value: safe(titan.rank), inline: true },
    { name: '🔮 School', value: safe(titan.magic_school), inline: true },
    { name: '❤️ Health', value: safe(titan.health), inline: true },
  );

  // Combat
  embed.addFields(
    { name: '⚔️ Damage', value: safe(titan.damage), inline: true },
    { name: '⚔️ DPS', value: safe(titan.dps), inline: true },
    { name: '🌪️ Speed', value: safe(titan.movement_speed), inline: true },
  );

  embed.addFields({ name: '💎 Cost', value: getCostString(titan), inline: false });

  if (titan.passive_health_regen)
    embed.addFields({
      name: '💚 Regen',
      value: safe(titan.passive_health_regen, '/s'),
      inline: true,
    });
  if (titan.heal_amount)
    embed.addFields({ name: '💚 Heal Amount', value: safe(titan.heal_amount), inline: true });

  if (titan.mechanics) {
    if (titan.mechanics.aura) {
      embed.addFields({
        name: 'Aura',
        value: titan.mechanics.aura
          .map((a: unknown) => {
            const aura = a as { name?: string; description?: string };
            return `**${aura.name || 'Unknown'}**: ${aura.description || ''}`;
          })
          .join('\n'),
      });
    }
    if (titan.mechanics.auto_capture_altars) {
      embed.addFields({ name: 'Special', value: 'Auto-captures Altars', inline: true });
    }
  }
  return embed;
};

/**
 * Creates an EmbedBuilder customized for a Consumable entity.
 * @param consumable - The Consumable entity to display.
 * @returns A fully configured Discord EmbedBuilder.
 */
export const createConsumableEmbed = (consumable: Consumable): EmbedBuilder => {
  let typeLabel = consumable.effect_type;
  if (consumable.effect_type === 'Charge_Refill') typeLabel = '⚡ Charge Refill';
  if (consumable.effect_type === 'Heal') typeLabel = '💚 Heal';
  if (consumable.effect_type === 'Buff') typeLabel = '🔮 Buff';

  const embed = createBaseEmbed(
    consumable as Entity,
    'consumable',
    EMOJIS.Consumable || '💊',
    COLORS.CONSUMABLE_GREEN,
  );

  embed.addFields(
    { name: '✨ Effect', value: safe(typeLabel), inline: true },
    { name: '💎 Value', value: safe(consumable.value), inline: true },
  );

  if (consumable.duration) {
    embed.addFields({ name: '⏳ Duration', value: `${consumable.duration}s`, inline: true });
  }
  if (consumable.buff_target) {
    embed.addFields({ name: '🎯 Target', value: consumable.buff_target, inline: true });
  }
  if (consumable.stack_size && consumable.stack_size > 1) {
    embed.addFields({
      name: '📚 Stack Size',
      value: consumable.stack_size.toString(),
      inline: true,
    });
  }

  return embed;
};

/**
 * Generic dispatch function that creates the appropriate EmbedBuilder
 * based on the provided Entity's discriminant `type`.
 * @param entity - Any valid Entity object (Hero, Unit, Spell, Titan, Consumable).
 * @returns A fully configured Discord EmbedBuilder for that entity.
 */
export const createEntityEmbed = (entity: Entity): EmbedBuilder => {
  switch (entity.type) {
    case 'Hero':
      return createHeroEmbed(entity);
    case 'Unit':
      return createUnitEmbed(entity);
    case 'Spell':
      return createSpellEmbed(entity);
    case 'Titan':
      return createTitanEmbed(entity);
    case 'Consumable':
      return createConsumableEmbed(entity);
    default:
      // Fallback, should never be hit if Entity union is exhaustive
      return createUnitEmbed(entity as unknown as Unit);
  }
};

/**
 * Creates a standardized error embed for failed operations.
 * @param message - The error message to display.
 * @returns A red-colored Discord EmbedBuilder with the error message.
 */
export const createErrorEmbed = (message: string): EmbedBuilder => {
  const prefix = message.startsWith('❌') ? '' : '❌ ';
  return new EmbedBuilder().setDescription(`${prefix}${message}`).setColor(COLORS.ERROR_RED);
};
