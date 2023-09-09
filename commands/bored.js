const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const axios = require('axios').default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bored')
    .setDescription('Get a suggestion of an activity to do if you are bored'),
  async execute(interaction) {
    try {
      const res = await axios('https://www.boredapi.com/api/activity');
      const boredData = res.data.activity;
      return await interaction.reply({
        content: boredData,
        components: [buttons],
      });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: `Data not found...`,
        components: [buttons],
      });
    }
  },
};
