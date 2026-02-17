import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { fetchData } from '../services/api';

export const command = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Information about the game and bot'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const data = await fetchData();
    const config = data.game_config;
    const build = data.build_info;

    const embed = new EmbedBuilder()
      .setTitle('About Spellcasters')
      .setColor(0x9b59b6)
      .setDescription(config ? `${config.game_name || 'Spellcasters'} — ${config.genre || 'Strategy'}` : 'Spellcasters Community Bot')
      .addFields(
        { name: 'Developer', value: config?.developer || 'Terrible Turtle Games', inline: true },
        { name: 'API Version', value: build.version, inline: true },
        { name: 'Data Updated', value: build.generated_at, inline: true },
        { name: 'Database', value: `${data.heroes.length} Heroes · ${data.units.length} Units · ${data.spells.length} Spells · ${data.titans.length} Titans · ${data.consumables.length} Consumables`, inline: false },
        { name: 'Links', value: '[SpellcastersDB](https://terribleturtle.github.io/spellcasters-db) · [Support Server](https://discord.gg/spellcasters)', inline: false },
        { name: 'Privacy', value: 'This bot stores no user data. It only reads public game data from the Spellcasters Community API.', inline: false },
      )
      .setFooter({ text: 'Powered by Spellcasters Community API v2' });

    await interaction.editReply({ embeds: [embed] });
  },
};
