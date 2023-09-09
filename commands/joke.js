const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const axios = require('axios').default;

module.exports = {
  data: new SlashCommandBuilder().setName('joke').setDescription('Get a random dad joke'),
  async execute(interaction) {
    try {
      const dadJoke = await axios('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'application/json',
        },
      });
      return await interaction.reply({
        content: dadJoke.data.joke,
        components: [buttons],
      });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: `The dad joke API said, 'I'm in the midst of 'making' 'API-ple pie,' so no jokes for you until it's ready!`,
        components: [buttons],
      });
    }
  },
};
