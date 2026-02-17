import { EmbedBuilder } from 'discord.js';
import { Hero, Unit, Spell, Titan, Consumable } from '../types';

const WIKI_BASE_URL = 'https://www.spellcastersdb.com';
const IMAGE_BASE_URL = 'https://terribleturtle.github.io/spellcasters-community-api/assets';

const getEntityId = (entity: any): string => {
  return entity.entity_id || entity.name.toLowerCase().replace(/\s+/g, '_');
};

const getWikiUrl = (type: string, id: string): string => {
  switch (type) {
    case 'hero':
      return `${WIKI_BASE_URL}/spellcasters/${id}`;
    case 'unit':
      return `${WIKI_BASE_URL}/incantations/units/${id}`;
    case 'spell':
      return `${WIKI_BASE_URL}/incantations/spells/${id}`;
    case 'titan':
      return `${WIKI_BASE_URL}/titans/${id}`;
    case 'consumable':
      return `${WIKI_BASE_URL}/consumables/${id}`;
    default:
      return WIKI_BASE_URL;
  }
};

const getImageUrl = (type: string, id: string): string => {
  // Directory names often correspond to plural types, but let's map them explicitly based on repo structure
  // Repo structure from plan: heroes, units, spells, titans (and assumed consumables?)
  // Actually consumables images might be in 'items' or 'consumables'. The user didn't specifying checking,
  // but plan says 'img/consumables/{id}.png'. I'll stick to plan.

  let dir = type + 's';
  if (type === 'hero') dir = 'heroes'; // "heroes" is plural of hero

  return `${IMAGE_BASE_URL}/${dir}/${id}.png`;
};

const getSchoolColor = (school: string | undefined): number => {
  switch (school) {
    case 'Astral':
      return 0x2e86c1;
    case 'War':
      return 0xc0392b;
    case 'Elemental':
      return 0xf39c12;
    case 'Holy':
      return 0xf1c40f;
    case 'Necromancy':
      return 0x8e44ad;
    case 'Wild':
      return 0x27ae60;
    case 'Technomancy':
      return 0x7f8c8d;
    case 'Titan':
      return 0xe74c3c;
    default:
      return 0x0099ff; // Default Blue
  }
};

const FOOTER_TEXT = 'View on SpellcastersDB';

const getDifficultyStars = (difficulty: number): string => {
  return '⭐'.repeat(difficulty);
};

export const createHeroEmbed = (hero: Hero): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle(hero.name)
    .setDescription(hero.description || 'No description provided.')
    .setColor(0x0099ff);

  const id = getEntityId(hero);
  embed.setURL(getWikiUrl('hero', id));
  embed.setThumbnail(getImageUrl('hero', id));
  embed.setFooter({ text: `${FOOTER_TEXT} | ID: ${id}` });

  embed.addFields(
    { name: 'Class', value: hero.class, inline: true },
    { name: 'Category', value: hero.category, inline: true },
    { name: 'Difficulty', value: getDifficultyStars(hero.difficulty), inline: true },
    { name: '❤️ Health', value: hero.health.toString(), inline: true },
    { name: 'Population', value: hero.population.toString(), inline: true },
    { name: 'Movement', value: hero.movement_type, inline: true },
  );

  // Primary Ability
  let primaryDesc = hero.abilities.primary.description;
  if (hero.abilities.primary.damage) primaryDesc += `\n**Damage:** ${hero.abilities.primary.damage}`;
  if (hero.abilities.primary.mechanics) {
    const mechs = [];
    if (hero.abilities.primary.mechanics.pierce) mechs.push('Pierce');
    if (hero.abilities.primary.mechanics.cleave) mechs.push('Cleave');
    if (hero.abilities.primary.mechanics.homing) mechs.push('Homing');
    if (mechs.length) primaryDesc += `\n*Mechanics: ${mechs.join(', ')}*`;
  }
  embed.addFields({ name: `⚔️ Primary: ${hero.abilities.primary.name}`, value: primaryDesc });

  // Defense Ability
  let defenseDesc = hero.abilities.defense.description;
  const def = hero.abilities.defense;
  const defStats = [];
  if (def.charges) defStats.push(`Charges: ${def.charges}`);
  if (def.cooldown) defStats.push(`CD: ${def.cooldown}s`);
  if (def.duration) defStats.push(`Dur: ${def.duration}s`);
  if (defStats.length) defenseDesc += `\n*(${defStats.join(' | ')})*`;
  embed.addFields({ name: `🛡️ Defense: ${def.name}`, value: defenseDesc });

  // Ultimate Ability
  let ultDesc = hero.abilities.ultimate.description;
  if (hero.abilities.ultimate.duration) ultDesc += `\n**Duration:** ${hero.abilities.ultimate.duration}s`;
  embed.addFields({ name: `🔥 Ultimate: ${hero.abilities.ultimate.name}`, value: ultDesc });

  if (hero.abilities.passive.length > 0) {
    embed.addFields({
      name: 'Passive',
      value: hero.abilities.passive.map((p) => `**${p.name}**: ${p.description}`).join('\n'),
    });
  }
  return embed;
};

export const createUnitEmbed = (unit: Unit): EmbedBuilder => {
  const categoryEmoji = unit.category === 'Building' ? '🏗️' : '🐾';
  const embed = new EmbedBuilder()
    .setTitle(`${categoryEmoji} ${unit.name}`)
    .setDescription(unit.description || 'No description provided.')
    .setColor(getSchoolColor(unit.magic_school));

  const id = getEntityId(unit);
  embed.setURL(getWikiUrl('unit', id));
  embed.setThumbnail(getImageUrl('unit', id));
  embed.setFooter({ text: `${FOOTER_TEXT} | ID: ${id}` });

  embed.addFields(
    { name: 'Rank', value: unit.rank, inline: true },
    { name: 'School', value: unit.magic_school, inline: true },
    { name: 'Type', value: unit.category, inline: true },
    { name: '❤️ Health', value: unit.health.toString(), inline: true },
    { name: '⚔️ Damage', value: unit.damage?.toString() || 'N/A', inline: true },
    { name: '⚔️ DPS', value: unit.dps?.toString() || 'N/A', inline: true },
  );

  if (unit.category !== 'Building') {
    embed.addFields(
      { name: '🎯 Range', value: unit.range?.toString() || 'N/A', inline: true },
      { name: '🌪️ Speed', value: unit.movement_speed?.toString() || 'N/A', inline: true },
    );
  } else {
     embed.addFields({ name: '🎯 Range', value: unit.range?.toString() || 'N/A', inline: true });
  }

  const cost = [`Charge: ${unit.charges}`, `Recharge: ${unit.recharge_time}s`];
  if (unit.cast_time) cost.push(`Cast: ${unit.cast_time}s`);
  embed.addFields({ name: '💎 Cost', value: cost.join(' | '), inline: false });

  // Mechanics Summary
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

export const createSpellEmbed = (spell: Spell): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle(`📜 ${spell.name}`)
    .setDescription(spell.description || 'No description provided.')
    .setColor(getSchoolColor(spell.magic_school));

  const id = getEntityId(spell);
  embed.setURL(getWikiUrl('spell', id));
  embed.setThumbnail(getImageUrl('spell', id));
  embed.setFooter({ text: `${FOOTER_TEXT} | ID: ${id}` });

  embed.addFields(
    { name: 'Rank', value: spell.rank, inline: true },
    { name: 'School', value: spell.magic_school, inline: true },
    { name: '🎯 Range', value: spell.range?.toString() || 'N/A', inline: true },
  );

  if (spell.damage) embed.addFields({ name: '⚔️ Damage', value: spell.damage.toString(), inline: true });
  if (spell.value) embed.addFields({ name: '💚 Value', value: spell.value.toString(), inline: true });
  if (spell.duration) embed.addFields({ name: '⏳ Duration', value: `${spell.duration}s`, inline: true });

  const cost = [`Charge: ${spell.charges}`, `Recharge: ${spell.recharge_time}s`];
  if (spell.cast_time) cost.push(`Cast: ${spell.cast_time}s`);
  embed.addFields({ name: '💎 Cost', value: cost.join(' | '), inline: false });

  if (spell.mechanics) {
      const details = [];
      if (spell.mechanics.waves) details.push(`Waves: ${spell.mechanics.waves}`);
      if (spell.mechanics.damage_modifiers) details.push('Modifiers');
      if (details.length) embed.addFields({ name: '⚙️ Mechanics', value: details.join(', '), inline: true });
  }

  return embed;
};

export const createTitanEmbed = (titan: Titan): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle(`🗿 ${titan.name}`)
    .setDescription(titan.description || 'No description provided.')
    .setColor(getSchoolColor(titan.magic_school));

  const id = getEntityId(titan);
  embed.setURL(getWikiUrl('titan', id));
  embed.setThumbnail(getImageUrl('titan', id));
  embed.setFooter({ text: `${FOOTER_TEXT} | ID: ${id}` });

  embed.addFields(
    { name: 'Rank', value: titan.rank, inline: true },
    { name: 'School', value: titan.magic_school, inline: true },
    { name: '❤️ Health', value: titan.health.toString(), inline: true },
    { name: '⚔️ Damage', value: titan.damage.toString(), inline: true },
    { name: '⚔️ DPS', value: titan.dps.toString(), inline: true },
    { name: '🌪️ Speed', value: titan.movement_speed.toString(), inline: true },
  );
  
  const cost = [`Charge: ${titan.charges}`, `Recharge: ${titan.recharge_time}s`];
  if (titan.cast_time) cost.push(`Cast: ${titan.cast_time}s`);
  embed.addFields({ name: '💎 Cost', value: cost.join(' | '), inline: false });

  if (titan.passive_health_regen) embed.addFields({ name: '💚 Regen', value: `${titan.passive_health_regen}/s`, inline: true });
  if (titan.heal_amount) embed.addFields({ name: '💚 Heal Amount', value: titan.heal_amount.toString(), inline: true });

  if (titan.mechanics) {
    if (titan.mechanics.aura) {
      embed.addFields({
        name: 'Aura',
        value: titan.mechanics.aura.map((a: any) => `**${a.name}**: ${a.description}`).join('\n'),
      });
    }
    if (titan.mechanics.auto_capture_altars) {
        embed.addFields({ name: 'Special', value: 'Auto-captures Altars', inline: true });
    }
  }
  return embed;
};

export const createConsumableEmbed = (consumable: Consumable): EmbedBuilder => {
  let typeLabel = consumable.effect_type;
  if (consumable.effect_type === 'Charge_Refill') typeLabel = '⚡ Charge Refill';
  if (consumable.effect_type === 'Heal') typeLabel = '💚 Heal';
  if (consumable.effect_type === 'Buff') typeLabel = '🔮 Buff';

  const embed = new EmbedBuilder()
    .setTitle(`💊 ${consumable.name}`)
    .setDescription(consumable.description || 'No description provided.')
    .setColor(0x00ff00);

  const id = getEntityId(consumable);
  embed.setURL(getWikiUrl('consumable', id));
  embed.setThumbnail(getImageUrl('consumable', id));
  embed.setFooter({ text: `${FOOTER_TEXT} | ID: ${id}` });

  embed.addFields(
    { name: 'Effect', value: typeLabel, inline: true },
    { name: 'Value', value: consumable.value.toString(), inline: true },
  );

  if (consumable.duration) {
    embed.addFields({ name: '⏳ Duration', value: `${consumable.duration}s`, inline: true });
  }
  if (consumable.buff_target) {
    embed.addFields({ name: '🎯 Target', value: consumable.buff_target, inline: true });
  }
  if (consumable.stack_size && consumable.stack_size > 1) {
    embed.addFields({ name: '📚 Stack Size', value: consumable.stack_size.toString(), inline: true });
  }
  
  return embed;
};
