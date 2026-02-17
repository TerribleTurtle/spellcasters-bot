import axios from 'axios';
import { config } from '../config';
import { AllData } from '../types';
import { AllDataSchema } from '../schemas';

import Fuse from 'fuse.js';

let cachedData: AllData | null = null;
let fuseIndex: Fuse<any> | null = null;
let allEntities: any[] = [];

/**
 * Fetches data from the configured API URL and caches it.
 * Validates the data against the Zod schema.
 * @param forceRefresh - If true, ignores cache and fetches fresh data.
 * @returns The complete data object.
 */
export const fetchData = async (forceRefresh: boolean = false): Promise<AllData> => {
  if (cachedData && !forceRefresh) return cachedData;

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

    // Inject 'type' property into cached entities immediately
    cachedData.heroes.forEach(e => (e as any).type = 'Hero');
    cachedData.units.forEach(e => (e as any).type = 'Unit');
    cachedData.spells.forEach(e => (e as any).type = 'Spell');
    cachedData.titans.forEach(e => (e as any).type = 'Titan');
    cachedData.consumables.forEach(e => (e as any).type = 'Consumable');

    // Build search index
    allEntities = [
      ...cachedData.heroes,
      ...cachedData.units,
      ...cachedData.spells,
      ...cachedData.titans,
      ...cachedData.consumables,
    ];

    fuseIndex = new Fuse(allEntities, {
      keys: ['name'],
      threshold: 0.4,
    });

    console.log(`Data fetched and index built with ${allEntities.length} entities.`);
    return cachedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Searches for entities matching the query string using fuzzy search.
 * @param query - The search query.
 * @returns An array of matching entities (Heroes, Units, Spells, Titans, Consumables).
 */
export const searchEntities = (query: string): any[] => {
  if (!fuseIndex || !query) return [];
  return fuseIndex.search(query).map((result) => result.item);
};

export const getAllEntities = (): any[] => {
  return allEntities;
};

/**
 * Finds a specific entity by its exact name (case-insensitive).
 * @param name - The name of the entity.
 * @returns The entity object if found, otherwise undefined.
 */
export const findEntityByName = (name: string): any | undefined => {
  return allEntities.find((entity) => entity.name.toLowerCase() === name.toLowerCase());
};

export const getData = (): AllData | null => {
  return cachedData;
};

// --- Type-Safe Accessors ---

export const getHeroes = async () => (await fetchData()).heroes;
export const getUnits = async () => (await fetchData()).units;
export const getSpells = async () => (await fetchData()).spells;
export const getTitans = async () => (await fetchData()).titans;
export const getConsumables = async () => (await fetchData()).consumables;
export const getGameConfig = async () => (await fetchData()).game_config;

// --- Helper Functions ---

/**
 * Returns a random entity, optionally filtered by type.
 * @param type - Optional type filter ('Hero', 'Unit', 'Spell', 'Titan', 'Consumable').
 * @returns A random entity object or null if none found.
 */
export const getRandomEntity = async (type?: string): Promise<any> => {
  await fetchData();
  let pool = allEntities;

  if (type) {
    const lowerType = type.toLowerCase();
    // Normalize types
    if (lowerType === 'hero') pool = await getHeroes();
    else if (lowerType === 'unit') pool = await getUnits();
    else if (lowerType === 'spell') pool = await getSpells();
    else if (lowerType === 'titan') pool = await getTitans();
    else if (lowerType === 'consumable') pool = await getConsumables();
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
): Promise<any[]> => {
  await fetchData();
  let results: any[] = [];

  const lowerType = type.toLowerCase();
  
  // Optimization: Direct access to cached arrays instead of filtering allEntities
  if (lowerType === 'hero') results = cachedData?.heroes || [];
  else if (lowerType === 'unit') results = cachedData?.units || [];
  else if (lowerType === 'spell') results = cachedData?.spells || [];
  else if (lowerType === 'titan') results = cachedData?.titans || [];
  else if (lowerType === 'consumable') results = cachedData?.consumables || [];
  else results = []; // Fallback, should not happen with valid inputs

  // Ensure type is present (it is injected in fetchData)
  // results = results.filter(e => e.type.toLowerCase() === lowerType); // No longer needed with direct access

  if (school) {
    results = results.filter(e => {
      // Heroes use 'class' instead of 'magic_school'
      const field = lowerType === 'hero' ? e.class : e.magic_school;
      return field && field.toLowerCase() === school.toLowerCase();
    });
  }

  if (rank) {
    results = results.filter(e => e.rank && e.rank === rank); // Rank is usually uppercase Roman numeral
  }

  return results;
};
