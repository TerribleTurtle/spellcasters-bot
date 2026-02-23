import { Collection } from 'discord.js';

const DEFAULT_COOLDOWN_SECONDS = 3;

// Map<commandName, Map<userId, expirationTimestamp>>
const cooldowns = new Collection<string, Collection<string, number>>();

/**
 * Checks if a user is on cooldown for a given command.
 * If they are, returns the number of seconds remaining.
 * If they are not, records the usage and returns 0.
 * @param commandName - The name of the command being invoked.
 * @param userId - The Discord user ID.
 * @param cooldownSeconds - The cooldown duration in seconds (defaults to 3).
 * @returns The number of seconds remaining on cooldown, or 0 if not on cooldown.
 */
export const checkCooldown = (
  commandName: string,
  userId: string,
  cooldownSeconds: number = DEFAULT_COOLDOWN_SECONDS,
): number => {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection<string, number>());
  }

  const timestamps = cooldowns.get(commandName)!;
  const now = Date.now();
  const cooldownMs = cooldownSeconds * 1000;

  const expirationTime = timestamps.get(userId);

  if (expirationTime && now < expirationTime) {
    const remaining = (expirationTime - now) / 1000;
    return Math.ceil(remaining);
  }

  // Record usage and set expiration
  timestamps.set(userId, now + cooldownMs);

  // Auto-cleanup: remove expired entries after cooldown expires
  setTimeout(() => timestamps.delete(userId), cooldownMs);

  return 0;
};
