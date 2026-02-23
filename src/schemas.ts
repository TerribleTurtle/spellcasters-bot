import { z } from 'zod';

/** Validates condition rules/requirements for abilities. */
export const ConditionSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  notes: z.string().optional(),
});

/** Validates complex spell/hero mechanics like stealth, pierce, and status effects. */
export const MechanicsSchema = z
  .object({
    features: z.array(z.any()).optional(), // Legacy features or remaining ones
    pierce: z.boolean().optional(),
    stealth: z
      .object({
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
      .optional(),
    cleave: z.boolean().optional(),
    homing: z.boolean().optional(),
    knockback: z.boolean().optional(),
    interruption: z.boolean().optional(),
  })
  .catchall(z.any()); // Allow other mechanics keys

/** Validates individual abilities (passive, primary, defense, ultimate). */
export const AbilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  charges: z.number().optional(),
  duration: z.number().optional(),
  cooldown: z.number().optional(),
  damage: z.number().optional(),
  stats: z.record(z.string(), z.any()).optional(),
  mechanics: MechanicsSchema.optional(),
  condition: ConditionSchema.optional(),
});

/** Validates a Hero entity from the community API. */
export const HeroSchema = z.object({
  $schema: z.string().optional(),
  type: z.string().optional(),
  entity_id: z.string().optional(),
  name: z.string(),
  class: z.string(),
  category: z.string(),
  movement_type: z.string(),
  health: z.number(),
  movement_speed: z.number().optional(),
  population: z.number(),
  image_required: z.boolean(),
  difficulty: z.number(),
  tags: z.array(z.string()),
  abilities: z.object({
    passive: z.array(AbilitySchema),
    primary: AbilitySchema,
    defense: AbilitySchema,
    ultimate: AbilitySchema,
  }),

  description: z.string().optional(),
  last_modified: z.string().optional(),
});

/** Base schema fields shared by all game entities. */
export const BaseEntitySchema = z.object({
  $schema: z.string().optional(),
  type: z.string().optional(),
  entity_id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  image_required: z.boolean(),
  item_url: z.string().optional(),
  tags: z.array(z.string()),

  last_modified: z.string().optional(),
});

/** Validates a Unit (or Building) entity. */
export const UnitSchema = BaseEntitySchema.extend({
  magic_school: z.string(),
  rank: z.string(),
  damage: z.number().optional(),
  health: z.number(),
  range: z.number().optional(),
  movement_speed: z.number().optional(),
  movement_type: z.string().optional(),
  dps: z.number().optional(),
  attack_interval: z.number().optional(),
  charges: z.number(),
  recharge_time: z.number(),
  cast_time: z.number(),
  population: z.number(),
  mechanics: MechanicsSchema.optional(),
});

/** Validates a Spell (Incantation) entity. */
export const SpellSchema = BaseEntitySchema.extend({
  magic_school: z.string(),
  rank: z.string(),
  damage: z.number().optional(),
  range: z.number().optional(),
  charges: z.number(),
  recharge_time: z.number(),
  cast_time: z.number(),
  duration: z.number().optional(),
  value: z.number().optional(),
  mechanics: MechanicsSchema.optional(),
});

/** Validates a Titan entity. */
export const TitanSchema = BaseEntitySchema.extend({
  magic_school: z.string(),
  rank: z.string(),
  damage: z.number(),
  health: z.number(),
  movement_speed: z.number(),
  passive_health_regen: z.number().optional(),
  heal_amount: z.number().optional(),
  dps: z.number(),
  attack_interval: z.number(),
  charges: z.number(),
  recharge_time: z.number(),
  cast_time: z.number(),
  population: z.number(),
  mechanics: z.record(z.string(), z.any()).optional(),
});

/** Validates a Consumable entity. */
export const ConsumableSchema = BaseEntitySchema.extend({
  effect_type: z.string(),
  value: z.number(),
  duration: z.number().optional(),
  buff_target: z.string().optional(),
  stack_size: z.number().optional(),
});

/** Validates the metadata describing the dataset version and creation time. */
export const BuildInfoSchema = z.object({
  version: z.string(),
  generated_at: z.string(),
});

/** Root schema validating the entire Community API JSON response. */
export const AllDataSchema = z.object({
  build_info: BuildInfoSchema,
  heroes: z.array(HeroSchema),
  units: z.array(UnitSchema),
  spells: z.array(SpellSchema),
  titans: z.array(TitanSchema),
  consumables: z.array(ConsumableSchema),
  upgrades: z.array(z.any()).optional(),
  decks: z.array(z.any()).optional(),
  game_config: z.record(z.string(), z.any()).optional(),
});
