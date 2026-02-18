import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { patches } from '../data/patches';

export const command = {
  data: new SlashCommandBuilder()
    .setName('patch')
    .setDescription('Show patch notes')
    .addStringOption((option) =>
      option
        .setName('version')
        .setDescription('Specific patch version (e.g. 2.1.0)')
        .setRequired(false)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction: any) {
    const focusedValue = interaction.options.getFocused();
    const filtered = patches
      .filter((p) => p.version.includes(focusedValue))
      .slice(0, 25)
      .map((p) => ({ name: `v${p.version} - ${p.title}`, value: p.version }));

    await interaction.respond(filtered);
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const version = interaction.options.getString('version');

    // Find patch: specified version OR latest
    const patch = version ? patches.find((p) => p.version === version) : patches[0];

    if (!patch) {
      await interaction.reply({
        content: `❌ Patch version **${version}** not found.`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📜 Patch Notes: v${patch.version}`)
      .setDescription(`**${patch.title}**\n*${patch.date}* — ${patch.type}\n\n${patch.description}`)
      .setColor(patch.type === 'Hotfix' ? 0xff0000 : 0x0099ff);

    if (patch.changes.length > 0) {
      const changeLines = patch.changes.map((c) => {
        const oldVal = c.old != null ? String(c.old) : '—';
        const newVal = c.new != null ? String(c.new) : '—';
        return `**${c.entity}**: ${c.field} ${oldVal} ➝ **${newVal}**`;
      });

      // Discord embed field max = 1024 chars
      let changesText = '';
      let shown = 0;
      for (const line of changeLines) {
        const next = changesText ? changesText + '\n' + line : line;
        if (next.length > 980) {
          // Leave room for overflow text
          changesText += `\n*…and ${changeLines.length - shown} more*`;
          break;
        }
        changesText = next;
        shown++;
      }

      embed.addFields({ name: 'Changes', value: changesText });
    } else {
      embed.addFields({ name: 'Changes', value: 'No balance changes listed.' });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
