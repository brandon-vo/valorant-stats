const Account = require('../schemas/AccountSchema');
const { noAccountEmbed, errorEmbed } = require('../components/embeds');
const { buttons, helpButtons } = require('../components/buttons');

async function getArgs(interaction) {

  const account = await Account.find({ discordId: interaction.user.id });

  let args = interaction.options.getString('username-tag') || account[0]?.valorantAccount;

  if (args?.includes('@')) {
    try {
      // mentionedID = args.split('!')[1].slice(0, -1); // old doesn't work
      mentionedID = args.replace(/\D/g, '');
      taggedAccount = await Account.find({ discordId: mentionedID });
      args = taggedAccount[0].valorantAccount;
    } catch (error) {
      return await interaction.editReply({
        embeds: [errorEmbed],
        components: [helpButtons],
        ephemeral: true,
      });
    }
  }

  if (account.length < 1) {
    return await interaction.editReply({
      embeds: [noAccountEmbed],
      components: [buttons],
      ephemeral: true,
    });
  }

  return args;
}

module.exports = { getArgs };
