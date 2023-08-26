const { SlashCommandBuilder } = require('@discordjs/builders');
const { getData } = require('../api');
const { Overview } = require('../constants/overview');
const { DataType } = require('../constants/types');
const { getAuthor } = require('../utils/getAuthor');
const { getArgs } = require('../utils/getArgs');
const { handlePages } = require('../utils/handlePages');
const { createEmbed } = require('../utils/createEmbed');
const assets = require('../assets.json');
const { handleResponse } = require('../utils/handleResponse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get overall competitive stats for a VALORANT user')
    .addStringOption((option) =>
      option
        .setName('username-tag')
        .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const playerID = encodeURIComponent(await getArgs(interaction));

    const [trackerProfile, trackerOverview, trackerRank] = await Promise.all([
      getData(playerID, DataType.PROFILE),
      getData(playerID, DataType.COMP_OVERVIEW),
      getData(playerID, DataType.RANK),
    ]);

    const dataSources = [trackerOverview, trackerProfile, trackerRank];
    if (!(await handleResponse(interaction, dataSources))) {
      return;
    }

    const profileOverview = trackerOverview.data.data[0].stats;
    const author = getAuthor(trackerProfile.data.data, playerID);
    const stats = Overview(profileOverview);

    let rankName = stats.rankName; // Rank Name

    // Set rank emoji and name if Radiant or Immortal
    const rankEmoji = assets.rankEmojis[rankName]?.emoji || '';
    if (rankName.includes('Immortal') || rankName.includes('Radiant')) {
      rankName =
        rankName +
        ' #' +
        (profileOverview.rank.rank ? profileOverview.rank.rank : '') +
        '\n' +
        profileOverview.rank.value +
        ' RR';
    }

    const embeds = [
      createEmbed(
        'Competitive Career Stats',
        [
          { name: 'KDR', value: '```ansi\n\u001b[2;36m' + stats.kdrRatio + '\n```', inline: true },
          {
            name: 'DMG/R',
            value: '```ansi\n\u001b[2;36m' + stats.damagePerRound + '\n```',
            inline: true,
          },
          { name: 'Rank ' + rankEmoji, value: '```grey\n' + rankName + '\n```', inline: true },
          { name: 'Kills', value: '```ansi\n\u001b[2;36m' + stats.kills + '\n```', inline: true },
          { name: 'Deaths', value: '```ansi\n\u001b[2;36m' + stats.deaths + '```', inline: true },
          {
            name: 'Assists',
            value: '```ansi\n\u001b[2;36m' + stats.assists + '\n```',
            inline: true,
          },
          {
            name: 'Most Kills',
            value: '```ansi\n\u001b[2;36m' + stats.mostKills + '\n```',
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
          },
        ],
        author
      ),
      createEmbed(
        'Competitive Career Stats',
        [
          {
            name: 'Kills/Match',
            value: '```ansi\n\u001b[2;36m' + stats.killsPerMatch + '\n```',
            inline: true,
          },
          {
            name: 'Deaths/Match',
            value: '```ansi\n\u001b[2;36m' + stats.deathsPerMatch + '\n```',
            inline: true,
          },
          {
            name: 'Assists/Match',
            value: '```ansi\n\u001b[2;36m' + stats.assistsPerMatch + '\n```',
            inline: true,
          },
          {
            name: 'ACS',
            value: '```ansi\n\u001b[2;36m' + stats.avgCombatScore + '\n```',
            inline: true,
          },
          {
            name: 'HS %',
            value: '```ansi\n\u001b[2;36m' + stats.headshotPct + '\n```',
            inline: true,
          },
          {
            name: '1v1 Clutches',
            value: '```ansi\n\u001b[2;36m' + stats.oneVsOneClutches + '\n```',
            inline: true,
          },
          {
            name: 'Plants',
            value: '```ansi\n\u001b[2;36m' + stats.plantCount + '\n```',
            inline: true,
          },
          {
            name: 'Defuses',
            value: '```ansi\n\u001b[2;36m' + stats.defuseCount + '\n```',
            inline: true,
          },
          {
            name: 'Avg Econ',
            value: '```ansi\n\u001b[2;36m' + stats.avgEconRating + '\n```',
            inline: true,
          },
          { name: 'Aces', value: '```ansi\n\u001b[2;36m' + stats.aceCount + '\n```', inline: true },
          {
            name: 'First Bloods',
            value: '```ansi\n\u001b[2;36m' + stats.firstBloodCount + '\n```',
            inline: true,
          },
          {
            name: 'First Deaths',
            value: '```ansi\n\u001b[2;36m' + stats.firstDeathsCount + '\n```',
            inline: true,
          },
        ],
        author
      ),
    ];

    handlePages(interaction, embeds, author);
  },
};
