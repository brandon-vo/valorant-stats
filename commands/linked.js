const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { linkedEmbed, noLinkEmbed } = require('../components/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linked')
    .setDescription('View your linked VALORANT account'),
  async execute(interaction) {
    await interaction.deferReply();
    const accounts = await Account.find({ discordId: interaction.user.id });

    if (accounts.length > 0) {
      const ID = accounts[0].valorantAccount;
      const linkedAccount = decodeURI(ID);

      return await interaction.editReply({
        embeds: [linkedEmbed(linkedAccount)],
        components: [buttons],
      });
    } else {
      return await interaction.editReply({
        embeds: [noLinkEmbed],
        components: [buttons],
      });
    }
  },
};
