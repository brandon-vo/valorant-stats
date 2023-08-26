const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { DataType } = require('../constants/types');
const { getArgs } = require('../utils/getArgs');
const { getAuthor } = require('../utils/getAuthor');
const { getData } = require('../api');
const { handleResponse } = require('../utils/handleResponse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playtime')
    .setDescription('Get the total playtime of a VALORANT user')
    .addStringOption((option) =>
      option
        .setName('username-tag')
        .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const playerID = encodeURIComponent(await getArgs(interaction));

    const [trackerProfile, trackerReport] = await Promise.all([
      getData(playerID, DataType.PROFILE),
      getData(playerID, DataType.SEASON_REPORT),
    ]);

    const dataSources = [trackerReport, trackerProfile];
    if (!(await handleResponse(interaction, dataSources))) {
      return;
    }

    const author = getAuthor(trackerProfile.data.data, playerID);
    const lifetime = trackerReport.data.data.filter(
      (item) => item.type === 'lifetime-matchmaking-time'
    );

    let matches, hours;
    for (const item of lifetime) {
      matches = item.stats.matches.displayValue;
      hours = item.stats.hours.displayValue;
    }

    const playtimeEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setAuthor(author)
      .setThumbnail(author.iconURL)

      .addFields(
        {
          name: 'Total Playtime',
          value: `\`\`\`ansi\n\u001b[2;36m${hours}\n\`\`\``,
          inline: true,
        },
        {
          name: 'Matches',
          value: `\`\`\`ansi\n\u001b[2;33m${matches}\n\`\`\``,
          inline: true,
        }
      )
      .setFooter({ text: 'All game modes' });

    return await interaction.reply({
      embeds: [playtimeEmbed],
      components: [buttons],
    });
  },
};
