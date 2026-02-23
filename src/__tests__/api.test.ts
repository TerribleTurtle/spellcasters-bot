import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { hasMagicSchool } from '../types';

// Mock axios before importing the module under test
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// We need to reset module state between tests since api.ts uses module-level cache
let api: typeof import('../services/api');

const mockAllData = {
  build_info: { version: '2.1.0', generated_at: '2026-02-22T00:00:00Z' },
  heroes: [
    {
      name: 'Frostmage',
      class: 'Astral',
      category: 'Ranged',
      movement_type: 'Ground',
      health: 400,
      population: 1,
      image_required: true,
      difficulty: 2,
      tags: ['ranged'],
      abilities: {
        passive: [],
        primary: { name: 'Frost Bolt', description: 'Shoots ice.' },
        defense: { name: 'Ice Wall', description: 'Blocks.' },
        ultimate: { name: 'Blizzard', description: 'Big freeze.' },
      },
    },
  ],
  units: [
    {
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
    },
    {
      entity_id: 'skeleton',
      name: 'Skeleton',
      category: 'Ground',
      description: 'An undead warrior.',
      image_required: true,
      tags: ['undead'],
      magic_school: 'Necromancy',
      rank: 'I',
      health: 100,
      charges: 5,
      recharge_time: 8,
      cast_time: 0.5,
      population: 1,
    },
    {
      entity_id: 'knight',
      name: 'Knight',
      category: 'Ground',
      description: 'A heavily armored warrior.',
      image_required: true,
      tags: ['armored'],
      magic_school: 'War',
      rank: 'III',
      health: 450,
      charges: 2,
      recharge_time: 12,
      cast_time: 1,
      population: 3,
    },
  ],
  spells: [
    {
      entity_id: 'fireball',
      name: 'Fireball',
      category: 'Damage',
      description: 'A ball of fire.',
      image_required: true,
      tags: ['fire'],
      magic_school: 'Elemental',
      rank: 'III',
      charges: 2,
      recharge_time: 15,
      cast_time: 0.5,
    },
  ],
  titans: [
    {
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
    },
  ],
  consumables: [
    {
      entity_id: 'health_potion',
      name: 'Health Potion',
      category: 'Healing',
      description: 'Restores health.',
      image_required: false,
      tags: ['healing'],
      effect_type: 'Heal',
      value: 100,
    },
  ],
};

describe('API Service', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockAllData });

    api = await import('../services/api');
  });

  describe('fetchData', () => {
    it('fetches and caches data from the API', async () => {
      const data = await api.fetchData();
      expect(data.heroes).toHaveLength(1);
      expect(data.units).toHaveLength(3);
      expect(data.spells).toHaveLength(1);
      expect(data.titans).toHaveLength(1);
      expect(data.consumables).toHaveLength(1);
    });

    it('returns cached data on second call', async () => {
      await api.fetchData();
      await api.fetchData();
      // axios.get should only be called once (cached after first call)
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('refetches when forceRefresh is true', async () => {
      await api.fetchData();
      await api.fetchData(true);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchEntities', () => {
    it('returns fuzzy matches', async () => {
      await api.fetchData();
      const results = api.searchEntities('harpy');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Harpy');
    });

    it('returns empty array for empty query', async () => {
      await api.fetchData();
      const results = api.searchEntities('');
      expect(results).toEqual([]);
    });

    it('handles typos via fuzzy matching', async () => {
      await api.fetchData();
      const results = api.searchEntities('hrapy');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Harpy');
    });
  });

  describe('findEntityByName', () => {
    it('finds an entity by exact name (case-insensitive)', async () => {
      await api.fetchData();
      const result = api.findEntityByName('harpy');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Harpy');
    });

    it('finds an entity with mixed case', async () => {
      await api.fetchData();
      const result = api.findEntityByName('STONE GOLEM');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Stone Golem');
    });

    it('returns undefined for unknown entities', async () => {
      await api.fetchData();
      const result = api.findEntityByName('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('filterEntities', () => {
    it('filters by type', async () => {
      await api.fetchData();
      const results = await api.filterEntities('Unit');
      expect(results).toHaveLength(3);
    });

    it('filters by type and school', async () => {
      await api.fetchData();
      const results = await api.filterEntities('Unit', 'War');
      expect(results).toHaveLength(2); // Harpy and Knight
      results.forEach((r) => expect(hasMagicSchool(r) ? r.magic_school : 'missing').toBe('War'));
    });

    it('filters by type, school, and rank', async () => {
      await api.fetchData();
      const results = await api.filterEntities('Unit', 'War', 'II');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Harpy');
    });

    it('filters heroes by class instead of magic_school', async () => {
      await api.fetchData();
      const results = await api.filterEntities('Hero', 'Astral');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Frostmage');
    });

    it('returns empty for invalid type', async () => {
      await api.fetchData();
      const results = await api.filterEntities('InvalidType');
      expect(results).toHaveLength(0);
    });
  });

  describe('getRandomEntity', () => {
    it('returns a random entity from the full pool', async () => {
      await api.fetchData();
      const entity = await api.getRandomEntity();
      expect(entity).toBeDefined();
      expect(entity!.name).toBeTruthy();
    });

    it('returns only spells when filtered by type', async () => {
      await api.fetchData();
      const entity = await api.getRandomEntity('Spell');
      expect(entity).toBeDefined();
      expect(entity!.name).toBe('Fireball');
    });

    it('returns null for invalid type', async () => {
      await api.fetchData();
      const entity = await api.getRandomEntity('InvalidType');
      expect(entity).toBeNull();
    });
  });

  describe('getAllEntities', () => {
    it('returns all entities across all types', async () => {
      await api.fetchData();
      const all = api.getAllEntities();
      // 1 hero + 3 units + 1 spell + 1 titan + 1 consumable = 7
      expect(all).toHaveLength(7);
    });
  });
});
