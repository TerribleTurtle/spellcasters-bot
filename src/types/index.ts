import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';
import { z } from 'zod';
import {
  ConditionSchema,
  MechanicsSchema,
  AbilitySchema,
  HeroSchema,
  BaseEntitySchema,
  UnitSchema,
  SpellSchema,
  TitanSchema,
  ConsumableSchema,
  BuildInfoSchema,
  AllDataSchema,
} from '../schemas';

export type Condition = z.infer<typeof ConditionSchema>;
export type Mechanics = z.infer<typeof MechanicsSchema>;
export type Ability = z.infer<typeof AbilitySchema>;

export type Hero = z.infer<typeof HeroSchema>;
export type BaseEntity = z.infer<typeof BaseEntitySchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Spell = z.infer<typeof SpellSchema>;
export type Titan = z.infer<typeof TitanSchema>;
export type Consumable = z.infer<typeof ConsumableSchema>;
export type BuildInfo = z.infer<typeof BuildInfoSchema>;
export type AllData = z.infer<typeof AllDataSchema>;

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface Stats {
  [key: string]: number | string | boolean;
}

export interface GameConfig {
  [key: string]: unknown;
}

export interface Command {
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | unknown;
  /** Cooldown in seconds. Defaults to 3 if omitted. */
  cooldown?: number;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export type Entity =
  | (Hero & { type: 'Hero' })
  | (Unit & { type: 'Unit' })
  | (Spell & { type: 'Spell' })
  | (Titan & { type: 'Titan' })
  | (Consumable & { type: 'Consumable' });

// --- Type Guards ---

/** Type guard — narrows unknown value to an object with a `rank` property. */
export const hasRank = (e: unknown): e is { rank: string } =>
  typeof e === 'object' && e !== null && 'rank' in e;

/** Type guard — narrows unknown value to an object with a `magic_school` property. */
export const hasMagicSchool = (e: unknown): e is { magic_school: string } =>
  typeof e === 'object' && e !== null && 'magic_school' in e;

/** Type guard — narrows unknown value to an object with a `class` (hero class) property. */
export const hasClass = (e: unknown): e is { class: string } =>
  typeof e === 'object' && e !== null && 'class' in e;
