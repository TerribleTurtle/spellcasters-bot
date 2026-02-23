import { describe, it, expect } from 'vitest';
import { safeStr, COLORS, EMOJIS, URLS, UI } from '../constants';

describe('safeStr', () => {
  it('returns "N/A" for null', () => {
    expect(safeStr(null)).toBe('N/A');
  });

  it('returns "N/A" for undefined', () => {
    expect(safeStr(undefined)).toBe('N/A');
  });

  it('returns "N/A" for empty string', () => {
    expect(safeStr('')).toBe('N/A');
  });

  it('formats a number', () => {
    expect(safeStr(42)).toBe('42');
  });

  it('formats a number with suffix', () => {
    expect(safeStr(42, '/s')).toBe('42/s');
  });

  it('formats a string value', () => {
    expect(safeStr('Ground')).toBe('Ground');
  });

  it('formats a string value with suffix', () => {
    expect(safeStr(10, 's')).toBe('10s');
  });

  it('formats zero correctly (not N/A)', () => {
    expect(safeStr(0)).toBe('0');
  });

  it('formats false correctly (not N/A)', () => {
    expect(safeStr(false)).toBe('false');
  });
});

describe('COLORS', () => {
  it('has all expected school colors', () => {
    expect(COLORS.ASTRAL).toBeDefined();
    expect(COLORS.WAR).toBeDefined();
    expect(COLORS.ELEMENTAL).toBeDefined();
    expect(COLORS.HOLY).toBeDefined();
    expect(COLORS.NECROMANCY).toBeDefined();
    expect(COLORS.WILD).toBeDefined();
    expect(COLORS.TECHNOMANCY).toBeDefined();
  });

  it('all color values are valid hex integers', () => {
    Object.values(COLORS).forEach((color) => {
      expect(typeof color).toBe('number');
      expect(color).toBeGreaterThanOrEqual(0);
      expect(color).toBeLessThanOrEqual(0xffffff);
    });
  });
});

describe('EMOJIS', () => {
  it('has emojis for all entity types', () => {
    expect(EMOJIS.Hero).toBeDefined();
    expect(EMOJIS.Unit).toBeDefined();
    expect(EMOJIS.Spell).toBeDefined();
    expect(EMOJIS.Titan).toBeDefined();
    expect(EMOJIS.Consumable).toBeDefined();
  });
});

describe('URLS', () => {
  it('all URLs are non-empty strings', () => {
    Object.values(URLS).forEach((url) => {
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });
});

describe('UI', () => {
  it('has a footer text', () => {
    expect(UI.FOOTER_TEXT).toBe('View on SpellcastersDB');
  });
});
