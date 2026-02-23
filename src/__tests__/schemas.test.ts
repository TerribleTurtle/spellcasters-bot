import { describe, it, expect } from 'vitest';
import {
  HeroSchema,
  UnitSchema,
  SpellSchema,
  TitanSchema,
  ConsumableSchema,
  AllDataSchema,
} from '../schemas';

// --- Minimal valid fixtures ---

const validHero = {
  name: 'Test Hero',
  class: 'Astral',
  category: 'Ranged',
  movement_type: 'Ground',
  health: 500,
  population: 1,
  image_required: true,
  difficulty: 3,
  tags: ['ranged', 'astral'],
  abilities: {
    passive: [],
    primary: { name: 'Zap', description: 'A basic attack.' },
    defense: { name: 'Shield', description: 'Blocks damage.' },
    ultimate: { name: 'Nova', description: 'Big boom.' },
  },
};

const validUnit = {
  entity_id: 'harpy',
  name: 'Harpy',
  category: 'Flying',
  description: 'A flying unit.',
  image_required: true,
  tags: ['flying'],
  magic_school: 'War',
  rank: 'II',
  health: 200,
  charges: 3,
  recharge_time: 10,
  cast_time: 1,
  population: 2,
};

const validSpell = {
  entity_id: 'fireball',
  name: 'Fireball',
  category: 'Damage',
  description: 'Deals fire damage.',
  image_required: true,
  tags: ['fire'],
  magic_school: 'Elemental',
  rank: 'III',
  charges: 2,
  recharge_time: 15,
  cast_time: 0.5,
};

const validTitan = {
  entity_id: 'golem',
  name: 'Stone Golem',
  category: 'Tank',
  description: 'A massive golem.',
  image_required: true,
  tags: ['tank'],
  magic_school: 'War',
  rank: 'V',
  damage: 80,
  health: 5000,
  movement_speed: 2.5,
  dps: 40,
  attack_interval: 2,
  charges: 1,
  recharge_time: 60,
  cast_time: 3,
  population: 8,
};

const validConsumable = {
  entity_id: 'health_potion',
  name: 'Health Potion',
  category: 'Healing',
  description: 'Restores health.',
  image_required: false,
  tags: ['healing'],
  effect_type: 'Heal',
  value: 100,
};

// --- Tests ---

describe('HeroSchema', () => {
  it('accepts a valid hero', () => {
    const result = HeroSchema.safeParse(validHero);
    expect(result.success).toBe(true);
  });

  it('rejects a hero missing required fields', () => {
    const { name: _, ...incomplete } = validHero;
    const result = HeroSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects a hero with wrong health type', () => {
    const result = HeroSchema.safeParse({ ...validHero, health: 'not-a-number' });
    expect(result.success).toBe(false);
  });

  it('accepts a hero with optional fields', () => {
    const result = HeroSchema.safeParse({
      ...validHero,
      entity_id: 'test_hero',
      description: 'Optional desc',
      movement_speed: 5.5,
      last_modified: '2026-01-01',
    });
    expect(result.success).toBe(true);
  });
});

describe('UnitSchema', () => {
  it('accepts a valid unit', () => {
    const result = UnitSchema.safeParse(validUnit);
    expect(result.success).toBe(true);
  });

  it('rejects a unit missing entity_id', () => {
    const { entity_id: _, ...incomplete } = validUnit;
    const result = UnitSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('accepts a unit with optional mechanics', () => {
    const result = UnitSchema.safeParse({
      ...validUnit,
      mechanics: { pierce: true, cleave: false },
    });
    expect(result.success).toBe(true);
  });
});

describe('SpellSchema', () => {
  it('accepts a valid spell', () => {
    const result = SpellSchema.safeParse(validSpell);
    expect(result.success).toBe(true);
  });

  it('rejects a spell missing magic_school', () => {
    const { magic_school: _, ...incomplete } = validSpell;
    const result = SpellSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('accepts optional duration and value', () => {
    const result = SpellSchema.safeParse({
      ...validSpell,
      duration: 5,
      value: 200,
    });
    expect(result.success).toBe(true);
  });
});

describe('TitanSchema', () => {
  it('accepts a valid titan', () => {
    const result = TitanSchema.safeParse(validTitan);
    expect(result.success).toBe(true);
  });

  it('rejects a titan missing damage', () => {
    const { damage: _, ...incomplete } = validTitan;
    const result = TitanSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe('ConsumableSchema', () => {
  it('accepts a valid consumable', () => {
    const result = ConsumableSchema.safeParse(validConsumable);
    expect(result.success).toBe(true);
  });

  it('rejects a consumable missing value', () => {
    const { value: _, ...incomplete } = validConsumable;
    const result = ConsumableSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('accepts optional buff_target and stack_size', () => {
    const result = ConsumableSchema.safeParse({
      ...validConsumable,
      buff_target: 'Units',
      stack_size: 3,
      duration: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe('AllDataSchema', () => {
  const validAllData = {
    build_info: { version: '2.1.0', generated_at: '2026-02-22T00:00:00Z' },
    heroes: [validHero],
    units: [validUnit],
    spells: [validSpell],
    titans: [validTitan],
    consumables: [validConsumable],
  };

  it('accepts a valid complete dataset', () => {
    const result = AllDataSchema.safeParse(validAllData);
    expect(result.success).toBe(true);
  });

  it('accepts empty entity arrays', () => {
    const result = AllDataSchema.safeParse({
      ...validAllData,
      heroes: [],
      units: [],
      spells: [],
      titans: [],
      consumables: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing build_info', () => {
    const { build_info: _, ...incomplete } = validAllData;
    const result = AllDataSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects when a nested entity is malformed', () => {
    const result = AllDataSchema.safeParse({
      ...validAllData,
      units: [{ name: 'broken' }], // missing required fields
    });
    expect(result.success).toBe(false);
  });
});
