import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and API responsiveness'),
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    await interaction.editReply(
      `🏓 **Pong!**\n> Roundtrip: **${roundtrip}ms**\n> WebSocket: **${ws}ms**`,
    );
  },
};
