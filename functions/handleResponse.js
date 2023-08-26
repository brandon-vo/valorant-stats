const { maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const { buttons, helpButtons } = require('../components/buttons');
const { ErrorType } = require('../constants/types');

async function handleResponse(interaction, dataSources) {
  const noDataResponse = {
    embeds: [noStatsEmbed],
    components: [buttons],
    ephemeral: true,
  };

  if (dataSources.includes(ErrorType.FORBIDDEN)) {
    await interaction.reply({
      embeds: [maintenanceEmbed],
      components: [buttons],
      ephemeral: true,
    });
    return false;
  }

  if (dataSources.includes(ErrorType.DEFAULT)) {
    await interaction.reply({
      embeds: [errorEmbed],
      components: [helpButtons],
      ephemeral: true,
    });
    return false;
  }

  if (
    dataSources.some((source) => {
      return source.data && source.data.data && source.data.data.length === 0;
    })
  ) {
    await interaction.reply(noDataResponse);
    return false;
  }
  return true;
}

module.exports = { handleResponse };
