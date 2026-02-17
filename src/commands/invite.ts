import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get a link to add this bot to your server'),
  async execute(interaction: ChatInputCommandInteraction) {
    const clientId = interaction.client.user.id;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=0&scope=bot%20applications.commands`;

    await interaction.reply({
      content: `📩 **Add Spellcasters Bot to your server:**\n> [Click here to invite](${inviteUrl})`,
      ephemeral: true,
    });
  },
};
