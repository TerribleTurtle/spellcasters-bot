import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getStats } from '../services/stats';
import { getAllEntities } from '../services/api';

export const command = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show bot usage statistics and database info'),
  async execute(interaction: ChatInputCommandInteraction) {
    const stats = getStats();
    const entities = getAllEntities();
    
    // Sort commands by usage
    const topCommands = Object.entries(stats.commandsBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `**/${name}**: ${count}`)
      .join('\n') || 'None yet';

    const uptime = formatUptime(stats.uptimeSeconds);

    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Statistics')
      .setColor(0x00ff00)
      .addFields(
        { name: '⏱️ Uptime', value: uptime, inline: true },
        { name: '🔢 Total Commands', value: stats.totalCommands.toString(), inline: true },
        { name: '🔎 Searches Run', value: stats.searchesRun.toString(), inline: true },
        { name: '🏆 Top Commands', value: topCommands, inline: false },
        { name: '📚 Database Size', value: `${entities.length} total entities loaded`, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}
