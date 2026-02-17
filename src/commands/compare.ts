import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, EmbedBuilder } from 'discord.js';
import { searchEntities, findEntityByName } from '../services/api';

export const command = {
  data: new SlashCommandBuilder()
    .setName('compare')
    .setDescription('Compare two entities side-by-side')
    .addStringOption((option) =>
      option.setName('first').setDescription('First entity').setRequired(true).setAutocomplete(true),
    )
    .addStringOption((option) =>
      option.setName('second').setDescription('Second entity').setRequired(true).setAutocomplete(true),
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const results = await searchEntities(focusedValue);
    const filtered = results.slice(0, 25).map((item: any) => ({ name: item.name, value: item.name }));
    await interaction.respond(filtered);
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const name1 = interaction.options.getString('first', true);
    const name2 = interaction.options.getString('second', true);

    await interaction.deferReply();

    const entity1 = await findEntityByName(name1);
    const entity2 = await findEntityByName(name2);

    if (!entity1 || !entity2) {
      await interaction.editReply('❌ One or both entities count not be found.');
      return;
    }

    if (entity1.type !== entity2.type) {
      await interaction.editReply(`❌ Cannot compare different types: **${entity1.type}** vs **${entity2.type}**.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Compare: ${entity1.name} vs ${entity2.name}`)
      .setColor(0xffaa00)
      .setDescription(`Comparing two **${entity1.type}s**.`);

    const addComparison = (label: string, val1: any, val2: any, suffix = '') => {
        if (val1 === undefined && val2 === undefined) return;
        
        let v1Str = val1 !== undefined ? val1.toString() : 'N/A';
        let v2Str = val2 !== undefined ? val2.toString() : 'N/A';
        
        if (typeof val1 === 'number' && typeof val2 === 'number') {
            if (val1 > val2) v1Str += ' 🟢';
            if (val2 > val1) v2Str += ' 🟢';
        }

        embed.addFields({
            name: label,
            value: `**${entity1.name}:** ${v1Str}${suffix}\n**${entity2.name}:** ${v2Str}${suffix}`,
            inline: true
        });
    };

    addComparison('❤️ Health', entity1.health, entity2.health);
    addComparison('⚔️ Damage', entity1.damage, entity2.damage);
    addComparison('⚔️ DPS', entity1.dps, entity2.dps);
    addComparison('🎯 Range', entity1.range, entity2.range);
    addComparison('🌪️ Speed', entity1.movement_speed, entity2.movement_speed);
    addComparison('⚡ Charge', entity1.charges, entity2.charges);
    addComparison('⏱️ Recharge', entity1.recharge_time, entity2.recharge_time, 's');
    addComparison('💎 Cost', entity1.gold_cost, entity2.gold_cost); // If exists
    addComparison('Population', entity1.population, entity2.population);

    await interaction.editReply({ embeds: [embed] });
  },
};
