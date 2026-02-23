import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getStats } from '../services/stats';
import { getAllEntities } from '../services/api';
import { COLORS } from '../constants';
import pkg from '../../package.json';

export const command = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Game info, bot stats, and invite link'),
  /**
   * Executes the command.
   * @param interaction - The command interaction.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const stats = getStats();
    const entities = getAllEntities();
    const uptime = formatUptime(stats.uptimeSeconds);

    // Latency
    const ws = interaction.client.ws.ping;

    // Invitation
    const clientId = interaction.client.user.id;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=0&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('ℹ️ About Spellcasters Bot')
      .setColor(COLORS.ABOUT_PURPLE)
      .setDescription(
        'The official community bot for **Spellcasters Chronicles**.\nData provided by the [Community API v2](https://terribleturtle.github.io/spellcasters-community-api/).',
      )
      .addFields(
        {
          name: '🤖 Bot Stats',
          value: `**Servers:** ${interaction.client.guilds.cache.size}\n**Uptime:** ${uptime}\n**Latency:** ${ws}ms\n**Commands Run:** ${stats.totalCommands}\n**Entities Loaded:** ${entities.length}`,
          inline: true,
        },
        {
          name: '🔗 Links',
          value: `• [Invite Bot](${inviteUrl})\n• [SpellcastersDB](https://terribleturtle.github.io/spellcastersdb)\n• [Support Server](https://discord.gg/spellcasters)`,
          inline: false,
        },
      )
      .setFooter({ text: `v${pkg.version} | Powered by Spellcasters API` });

    await interaction.reply({ embeds: [embed] });
  },
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
