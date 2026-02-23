import axios from 'axios';
import { config } from '../config';
import { AllData, Entity, Hero, Unit, Spell, Titan, Consumable } from '../types';
import { AllDataSchema } from '../schemas';
import { FUSE_THRESHOLD } from '../constants';
import { hasClass, hasMagicSchool, hasRank } from '../types';

import Fuse from 'fuse.js';

let cachedData: AllData | null = null;
let fuseIndex: Fuse<Entity> | null = null;
let allEntities: Entity[] = [];
const entityMap: Map<string, Entity> = new Map();
let lastFetchTime = 0;
let activeFetchPromise: Promise<AllData> | null = null;

// Map entity types to AllData keys
const ENTITY_COLLECTIONS: Record<string, keyof AllData> = {
  hero: 'heroes',
  unit: 'units',
  spell: 'spells',
  titan: 'titans',
  consumable: 'consumables',
};

/**
 * Fetches data from the configured API URL and caches it.
 * Validates the data against the Zod schema.
 * @param forceRefresh - If true, ignores cache and fetches fresh data.
 * @returns The complete data object.
 */
export const fetchData = async (forceRefresh: boolean = false): Promise<AllData> => {
  // Check cache TTL
  const ttlMs = config.CACHE_TTL_HOURS * 60 * 60 * 1000;
  const isStale = cachedData && Date.now() - lastFetchTime > ttlMs;

  if (cachedData && !forceRefresh && !isStale) return cachedData;

  // Cache stampede prevention: coalesce concurrent callers onto one request
  if (activeFetchPromise) return activeFetchPromise;

  activeFetchPromise = (async (): Promise<AllData> => {
    try {
      console.log(`Fetching data from ${config.DATA_URL}...`);
      const response = await axios.get<AllData>(config.DATA_URL);

      // Validate data with Zod
      const validationResult = AllDataSchema.safeParse(response.data);
      if (!validationResult.success) {
        console.error('❌ Data validation failed:', validationResult.error);
        throw new Error('Data validation failed');
      }

      cachedData = validationResult.data as AllData;

      // Record fetch timestamp
      lastFetchTime = Date.now();

      // Inject 'type' property into cached entities immediately
      cachedData.heroes.forEach((e) => (e.type = 'Hero'));
      cachedData.units.forEach((e) => (e.type = 'Unit'));
      cachedData.spells.forEach((e) => (e.type = 'Spell'));
      cachedData.titans.forEach((e) => (e.type = 'Titan'));
      cachedData.consumables.forEach((e) => (e.type = 'Consumable'));

      // Build search index
      allEntities = [
        ...(cachedData.heroes as (Hero & { type: 'Hero' })[]),
        ...(cachedData.units as (Unit & { type: 'Unit' })[]),
        ...(cachedData.spells as (Spell & { type: 'Spell' })[]),
        ...(cachedData.titans as (Titan & { type: 'Titan' })[]),
        ...(cachedData.consumables as (Consumable & { type: 'Consumable' })[]),
      ];

      // Populate HashMap for O(1) lookup
      entityMap.clear();
      allEntities.forEach((entity) => {
        if (entity.name) {
          entityMap.set(entity.name.toLowerCase(), entity);
        }
      });

      fuseIndex = new Fuse(allEntities, {
        keys: ['name'],
        threshold: FUSE_THRESHOLD,
      });

      console.log(`Data fetched and index built with ${allEntities.length} entities.`);
      return cachedData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
};

/**
 * Searches for entities matching the query string using fuzzy search.
 * @param query - The search query.
 * @returns An array of matching entities (Heroes, Units, Spells, Titans, Consumables).
 */
export const searchEntities = (query: string): Entity[] => {
  if (!fuseIndex || !query) return [];
  return fuseIndex.search(query).map((result) => result.item);
};

/**
 * Gets all raw entities (heroes, units, spells, titans, consumables) as a flat array.
 * @returns The array of all parsed entity objects.
 */
export const getAllEntities = (): Entity[] => {
  return allEntities;
};

/**
 * Finds a specific entity by its exact name (case-insensitive).
 * @param name - The name of the entity.
 * @returns The entity object if found, otherwise undefined.
 */
export const findEntityByName = (name: string): Entity | undefined => {
  return entityMap.get(name.toLowerCase());
};

/**
 * Returns the currently cached AllData object, or null if not yet fetched.
 * @returns The Data object containing all split collection arrays.
 */
export const getData = (): AllData | null => {
  return cachedData;
};

// --- Type-Safe Accessors ---

/** Retrieves the array of Heroes from the API. */
export const getHeroes = async () => (await fetchData()).heroes;
/** Retrieves the array of Units from the API. */
export const getUnits = async () => (await fetchData()).units;
/** Retrieves the array of Spells from the API. */
export const getSpells = async () => (await fetchData()).spells;
/** Retrieves the array of Titans from the API. */
export const getTitans = async () => (await fetchData()).titans;
/** Retrieves the array of Consumables from the API. */
export const getConsumables = async () => (await fetchData()).consumables;
/** Retrieves the game configuration rules from the API. */
export const getGameConfig = async () => (await fetchData()).game_config;

// --- Helper Functions ---

/**
 * Returns a random entity, optionally filtered by type.
 * @param type - Optional type filter ('Hero', 'Unit', 'Spell', 'Titan', 'Consumable').
 * @returns A random entity object or null if none found.
 */
export const getRandomEntity = async (type?: string): Promise<Entity | null> => {
  await fetchData();
  let pool = allEntities;

  if (type) {
    const lowerType = type.toLowerCase();
    const collectionKey = ENTITY_COLLECTIONS[lowerType];

    if (collectionKey && cachedData && cachedData[collectionKey]) {
      pool = cachedData[collectionKey] as unknown as Entity[]; // Cast as unknown first then Entity[]
      // We know this is safe because we injected 'type' above
    } else {
      pool = []; // invalid type
    }
  }

  if (pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

/**
 * Filters entities based on type, school/class, and rank.
 * @param type - The entity type (Hero, Unit, Spell, etc.).
 * @param school - Optional magic school or hero class.
 * @param rank - Optional rank (e.g., 'I', 'II', 'Star').
 * @returns An array of filtered entities.
 */
export const filterEntities = async (
  type: string,
  school?: string,
  rank?: string,
): Promise<Entity[]> => {
  await fetchData();
  let results: Entity[] = [];

  const lowerType = type.toLowerCase();

  // Optimization: Direct access to cached arrays instead of filtering allEntities
  const collectionKey = ENTITY_COLLECTIONS[lowerType];
  if (collectionKey && cachedData && cachedData[collectionKey]) {
    results = cachedData[collectionKey] as unknown as Entity[];
  } else {
    results = []; // Fallback for invalid types
  }

  if (school) {
    results = results.filter((e) => {
      let field: string | undefined;
      if (lowerType === 'hero' && hasClass(e)) field = e.class;
      else if (hasMagicSchool(e)) field = e.magic_school;
      return field && field.toLowerCase() === school.toLowerCase();
    });
  }

  if (rank) {
    results = results.filter((e) => hasRank(e) && e.rank === rank); // Rank is usually uppercase Roman numeral
  }

  return results;
};
