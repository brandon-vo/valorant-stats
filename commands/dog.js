const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const axios = require('axios').default;

module.exports = {
  data: new SlashCommandBuilder().setName('dog').setDescription('Get a random picture of a dog'),
  async execute(interaction) {
    try {
      const res = await axios('https://dog.ceo/api/breeds/image/random');
      const dogLink = res.data.message;
      return await interaction.reply({
        content: dogLink,
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
