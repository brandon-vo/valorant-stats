const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const axios = require('axios').default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bitcoin')
    .setDescription('Get the current price of Bitcoin'),
  async execute(interaction) {
    try {
      const res = await axios('https://api.coindesk.com/v1/bpi/currentprice.json');
      const bitcoinData = res.data.bpi;
      return await interaction.reply({
        content: `\`\`\`ansi\n\u001b[0;33mCurrent Bitcoin Price\`\`\`
:coin: USD : $${bitcoinData.USD.rate_float.toFixed(2)}
:coin: GBP : £${bitcoinData.GBP.rate_float.toFixed(2)}
:coin: EUR : €${bitcoinData.EUR.rate_float.toFixed(2)}`,
        components: [buttons],
      });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: `Bitcoin data not found...`,
        components: [buttons],
      });
    }
  },
};
