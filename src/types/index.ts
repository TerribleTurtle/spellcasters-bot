import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';

export interface Condition {
  field: string;
  operator: string;
  value: any; // Value type depends on operator (string, number, boolean)
  notes?: string;
}

export interface Mechanics {
  /**
   * List of features associated with the mechanic.
   * Structure is untyped record to allow flexibility for various feature properties.
   */
  features?: Record<string, unknown>[]; 
  pierce?: boolean;
  stealth?: {
    duration?: number;
    notes?: string;
  };
  cleave?: boolean;
  homing?: boolean;
  knockback?: boolean;
  interruption?: boolean;
  [key: string]: any;
}

export interface Ability {
  name: string;
  description: string;
  charges?: number;
  duration?: number;
  cooldown?: number;
  damage?: number;
  stats?: Stats;
  mechanics?: Mechanics;
  condition?: Condition;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  description: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  // Dynamic properties for upgrades (cost, effects, etc.)
  [key: string]: unknown;
}

export interface Stats {
  [key: string]: number | string | boolean;
}

export interface Hero {
  $schema?: string;
  entity_id?: string;
  name: string;
  class: string;
  category: string;
  movement_type: string;
  health: number;
  movement_speed?: number;
  population: number;
  image_required: boolean;
  difficulty: number;
  tags: string[];
  abilities: {
    passive: Ability[];
    primary: Ability;
    defense: Ability;
    ultimate: Ability;
  };
  changelog?: ChangelogEntry[];
  description?: string;
  last_modified?: string;
}

export interface BaseEntity {
  $schema?: string;
  entity_id: string;
  name: string;
  category: string;
  description: string;
  image_required: boolean;
  item_url?: string; // Derived from ID usually
  tags: string[];
  changelog?: ChangelogEntry[];
  last_modified?: string;
}

// ... (Unit, Spell, Titan, Consumable use BaseEntity so they get ChangelogEntry)

export interface AllData {
  build_info: BuildInfo;
  heroes: Hero[];
  units: Unit[];
  spells: Spell[];
  titans: Titan[];
  consumables: Consumable[];
  upgrades?: Upgrade[];
  decks?: any[]; // Keep any for decks if structure unknown
  game_config?: GameConfig;
}

export interface Command {
  data: SlashCommandBuilder | any; // Discord.js types can be complex, keeping any here might be safer for now or use specific distinct types
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface Unit extends BaseEntity {
  magic_school: string;
  rank: string;
  damage?: number;
  health: number;
  range?: number;
  movement_speed?: number;
  movement_type?: string;
  dps?: number;
  attack_interval?: number;
  charges: number;
  recharge_time: number;
  cast_time: number;
  population: number;
  mechanics?: Mechanics;
}

export interface Spell extends BaseEntity {
  magic_school: string;
  rank: string;
  damage?: number;
  range?: number;
  charges: number;
  recharge_time: number;
  cast_time: number;
  duration?: number;
  value?: number;
  mechanics?: Mechanics;
}

export interface BuildInfo {
  version: string;
  generated_at: string;
}

export interface GameConfig {
  [key: string]: any;
}

export interface Titan extends BaseEntity {
  magic_school: string;
  rank: string;
  damage: number;
  health: number;
  movement_speed: number;
  passive_health_regen?: number;
  heal_amount?: number;
  dps: number;
  attack_interval: number;
  charges: number;
  recharge_time: number;
  cast_time: number;
  population: number;
  mechanics?: {
    aura?: any[];
    auto_capture_altars?: boolean;
    [key: string]: any;
  };
}

export interface Consumable extends BaseEntity {
  effect_type: string;
  value: number;
  duration?: number;
  buff_target?: string;
  stack_size?: number;
}


