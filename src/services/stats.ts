
export interface StatsSnapshot {
  uptimeSeconds: number;
  totalCommands: number;
  commandsBreakdown: Record<string, number>;
  searchesRun: number;
  startedAt: Date;
}

const stats = {
  totalCommands: 0,
  commandsBreakdown: {} as Record<string, number>,
  searchesRun: 0,
  startedAt: new Date(),
};

/**
 * Increment command usage counter.
 * @param commandName - The name of the command executed.
 */
export const recordCommand = (commandName: string) => {
  stats.totalCommands++;
  stats.commandsBreakdown[commandName] = (stats.commandsBreakdown[commandName] || 0) + 1;

  if (commandName === 'search') {
    stats.searchesRun++;
  }
};

/**
 * Get a snapshot of current stats.
 */
export const getStats = (): StatsSnapshot => {
  const uptimeSeconds = Math.floor((new Date().getTime() - stats.startedAt.getTime()) / 1000);
  return {
    ...stats,
    uptimeSeconds,
    // Return a copy of the breakdown to prevent mutation
    commandsBreakdown: { ...stats.commandsBreakdown },
  };
};
