const Account = require('../schemas/AccountSchema');
const { noAccountEmbed } = require('../components/embeds');
const { buttons, helpButtons } = require('../components/buttons');

async function getArgs(interaction) {
  let args = interaction.options.getString('username-tag');

  const account = await Account.find({ discordId: interaction.user.id });
  if (account.length < 1) {
    return await interaction.reply({
      embeds: [noAccountEmbed],
      components: [buttons],
      ephemeral: true,
    });
  }

  if (!args) {
    args = account[0].valorantAccount;
  }

  if (args.includes('@')) {
    try {
      mentionedID = args.split('!')[1].slice(0, -1);
      taggedAccount = await Account.find({ discordId: mentionedID });
      args = taggedAccount[0].valorantAccount;
    } catch (error) {
      return await interaction.reply({
        embeds: [errorEmbed],
        components: [helpButtons],
        ephemeral: true,
      });
    }
  }
  return args;
}

module.exports = { getArgs };
