const { voteEmbed } = require('../components/embeds');
const { voteButton } = require('../components/buttons');

async function handleNoVote(interaction) {
  return await interaction.reply({
    embeds: [voteEmbed],
    components: [voteButton],
    ephemeral: true,
  });
}

module.exports = { handleNoVote };
