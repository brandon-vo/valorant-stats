const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { helpButtons } = require('../components/buttons');
const { ErrorType, DataType } = require('../constants/types');
const { getAuthor } = require('../functions/getAuthor');
const { getData } = require('../api');
const { getArgs } = require('../functions/getArgs');
const { handlePages } = require('../functions/handlePages');
const { handleResponse } = require('../functions/handleResponse');
const assets = require('../assets.json');

function getPlayerFields(player, team) {
  const {
    attributes: { platformUserIdentifier: playerName },
    metadata: { agentName },
    stats: {
      rank: { value: rank },
      kills,
      deaths,
      assists,
      kdRatio,
      scorePerRound,
    },
  } = player;

  const agentEmoji = assets.agentEmojis[agentName]?.emoji || ':white_small_square:';
  const rankEmoji = assets.rankEmojis[rank]?.emoji || '';
  const acs = parseInt(scorePerRound.value).toFixed(0);
  const ansiCode = team === 'red' ? '36m' : '33m';

  return {
    name: `${playerName} ${agentEmoji} ${rankEmoji}`,
    value:
      `\`\`\`ansi\n\u001b[2;${ansiCode}K / D / A / R   | ACS\n` +
      `${kills.value} / ${deaths.value} / ${assists.value} / ${kdRatio.value.toFixed(
        2
      )} | ${acs}\n` +
      `\`\`\``,
    inline: true,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lastmatch')
    .setDescription('Get last competitive match stats for a VALORANT user')
    .addStringOption((option) =>
      option
        .setName('username-tag')
        .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const playerID = encodeURIComponent(await getArgs(interaction));
    await interaction.deferReply();

    const [trackerProfile, trackerMatch] = await Promise.all([
      getData(playerID, DataType.PROFILE),
      getData(playerID, DataType.MATCH),
    ]);

    const dataSources = [trackerMatch, trackerProfile];
    if (!(await handleResponse(interaction, dataSources))) {
      return;
    }

    const author = getAuthor(trackerProfile.data.data, playerID);
    const lastMatch = trackerMatch.data.data.matches[0];
    const matchID = lastMatch.attributes.id;

    const [trackerMatchInfo] = await Promise.all([getData(playerID, DataType.MATCH_INFO, matchID)]);

    if (trackerMatchInfo === ErrorType.DEFAULT) {
      return await interaction.editReply({
        embeds: [errorEmbed],
        components: [helpButtons],
        ephemeral: true,
      });
    }

    const matchInfo = trackerMatchInfo.data.data;
    const lastMap = lastMatch.metadata.mapName;

    const roundsWon = lastMatch.segments[0].stats.roundsWon.value;
    const roundsLost = lastMatch.segments[0].stats.roundsLost.value;
    const scoreVisualized =
      '<:greenline:839562756930797598>'.repeat(roundsWon) +
      '\n' +
      '<:redline:839562438760071298>'.repeat(roundsLost);

    const timeStamp = lastMatch.metadata.timestamp.split('T', 2);
    const modeEmoji = assets.modeEmojis['Competitive']?.emoji || '';

    const playerStats = lastMatch.segments[0].stats;
    const rankName = playerStats.rank.metadata.tierName;
    const rankEmoji = assets.rankEmojis[rankName]?.emoji || '';
    const result = lastMatch.metadata.result;

    let mapImage = assets.maps[lastMap]?.img || assets.maps['Unknown'].img;

    if (result === 'victory') {
      mapImage = assets.maps[lastMap]?.imgWon || assets.maps['Unknown'].imgWon;
    } else if (roundsWon === roundsLost) {
      mapImage = assets.maps[lastMap]?.imgDraw || assets.maps['Unknown'].imgDraw;
    } else if (result === 'defeat') {
      mapImage = assets.maps[lastMap]?.imgLost || assets.maps['Unknown'].imgLost;
    }

    const lastMatchEmbed1 = new MessageEmbed()
      .setColor('#11806A')
      .setTitle('Last Competitive Match - ' + lastMap)
      .setAuthor(author)
      .setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
      .setDescription('`              ' + timeStamp[0] + '             `')
      .addFields(
        {
          name: 'Mode ' + modeEmoji,
          value: '```ansi\n\u001b[2;36mCompetitive\n```',
          inline: true,
        },
        {
          name: 'Length',
          value: '```ansi\n\u001b[2;36m' + playerStats.playtime.displayValue + '\n```',
          inline: true,
        },
        {
          name: 'Rank' + rankEmoji + '               K / D / A              KDR',
          value:
            '```grey\n' +
            playerStats.rank.metadata.tierName +
            '    ' +
            playerStats.kills.displayValue +
            '/' +
            playerStats.deaths.displayValue +
            '/' +
            playerStats.assists.displayValue +
            '      ' +
            playerStats.kdRatio.displayValue +
            '\n```',
          inline: false,
        },
        {
          name: 'Combat Scr',
          value: '```ansi\n\u001b[2;36m' + playerStats.score.displayValue + '\n```',
          inline: true,
        },
        {
          name: 'ACS',
          value: '```ansi\n\u001b[2;36m' + playerStats.scorePerRound.displayValue + '\n```',
          inline: true,
        },
        {
          name: 'Econ Rating',
          value: '```ansi\n\u001b[2;36m' + playerStats.econRating.displayValue + '\n```',
          inline: true,
        },
        {
          name: 'Headshot %',
          value: '```ansi\n\u001b[2;36m' + playerStats.headshotsPercentage.displayValue + '%\n```',
          inline: true,
        },
        {
          name: 'First Bloods',
          value: '```ansi\n\u001b[2;36m' + playerStats.firstBloods.displayValue + '\n```',
          inline: true,
        },
        {
          name: 'Score',
          value:
            scoreVisualized +
            '```ansi\n\u001b[1;34m             ' +
            playerStats.roundsWon.displayValue +
            ' \u001b[2;30m-\u001b[2;35m ' +
            playerStats.roundsLost.displayValue +
            '\n```',
          inline: false,
        }
      )
      .setImage(mapImage);

    const lastMatchEmbed2 = new MessageEmbed()
      .setColor('#11806A')
      .setTitle(
        'Last Competitive Match - ' +
          lastMap +
          ' | ' +
          playerStats.roundsWon.displayValue +
          ' - ' +
          playerStats.roundsLost.displayValue
      )
      .setAuthor(author)
      .setDescription('```\n                Players in your game\n```');

    const playerMatchInfo = matchInfo.segments.filter(
      (segment) => segment.type === 'player-summary'
    );
    const redTeam = playerMatchInfo.filter(
      (playerSummary) => playerSummary.metadata.teamId === 'Red'
    );
    const blueTeam = playerMatchInfo.filter(
      (playerSummary) => playerSummary.metadata.teamId === 'Blue'
    );

    // Sort players by ACS
    redTeam.sort((a, b) => b.stats.scorePerRound.value - a.stats.scorePerRound.value);
    blueTeam.sort((a, b) => b.stats.scorePerRound.value - a.stats.scorePerRound.value);

    let count = 0;

    for (let x = 0; x < playerMatchInfo.length / 2; x++) {
      const playerA = redTeam[x];
      const playerB = blueTeam[x];

      const fieldsA = getPlayerFields(playerA, 'red');
      const fieldsB = getPlayerFields(playerB, 'blue');

      count++;

      lastMatchEmbed2.addFields(fieldsA, fieldsB);

      // For 2 column formatting
      if (count === 1) {
        lastMatchEmbed2.addField('\u200B', '\u200B', true);
        count = 0;
      }
    }

    const embeds = [lastMatchEmbed1, lastMatchEmbed2];
    handlePages(interaction, embeds, author);
  },
};
