const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { Overview } = require('../constants/overview');
const { DataType } = require('../constants/types');
const { getAuthor } = require('../functions/getAuthor');
const { getData } = require('../api');
const { getArgs } = require('../functions/getArgs');
const { handleResponse } = require('../functions/handleResponse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deathmatch')
    .setDescription('Get overall deathmatch stats for a VALORANT user')
    .addStringOption((option) =>
      option
        .setName('username-tag')
        .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const playerID = encodeURIComponent(await getArgs(interaction));
    await interaction.deferReply();

    const [trackerProfile, trackerOverview] = await Promise.all([
      getData(playerID, DataType.PROFILE),
      getData(playerID, DataType.DEATHMATCH_OVERVIEW),
    ]);

    const dataSources = [trackerOverview, trackerProfile];
    if (!(await handleResponse(interaction, dataSources))) {
      return;
    }

    const profileInfo = trackerProfile.data.data;
    const profileOverview = trackerOverview.data.data[0].stats;
    const author = getAuthor(profileInfo, playerID);
    const stats = Overview(profileOverview);

    const deathmatchEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setTitle(`Deathmatch Career Stats`)
      .setAuthor(author)
      .setThumbnail(author.iconURL)
      .addFields(
        {
          name: 'KDR',
          value: '```ansi\n\u001b[2;36m' + stats.kdrRatio + '\n```',
          inline: true,
        },
        {
          name: 'KAD',
          value: '```ansi\n\u001b[2;36m' + stats.kadRatio + '\n```',
          inline: true,
        },
        {
          name: 'Kills/Game ',
          value: '```ansi\n\u001b[2;36m' + stats.killsPerRound + '\n```',
          inline: true,
        },
        {
          name: 'Kills',
          value: '```ansi\n\u001b[2;36m' + stats.kills + '\n```',
          inline: true,
        },
        {
          name: 'Deaths',
          value: '```ansi\n\u001b[2;36m' + stats.deaths + '```',
          inline: true,
        },
        {
          name: 'Assists',
          value: '```ansi\n\u001b[2;36m' + stats.assists + '\n```',
          inline: true,
        },
        {
          name: 'Playtime',
          value: '```ansi\n\u001b[2;36m' + stats.timePlayed + '\n```',
          inline: true,
        },
        {
          name: 'Win Rate - ' + stats.winRatePct,
          value:
            stats.winRateBar +
            ' ```ansi\n\u001b[2;34m' +
            '    W: ' +
            stats.matchesWon +
            '   \u001b[2;30m|\u001b[2;35m   L: ' +
            stats.matchesLost +
            '\n```',
          inline: false,
        }
      );

    return await interaction.editReply({
      embeds: [deathmatchEmbed],
      components: [buttons],
    });
  },
};
