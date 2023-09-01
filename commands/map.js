const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const assets = require('../assets.json');
const { DataType } = require('../constants/types');
const { getAuthor } = require('../functions/getAuthor');
const { getArgs } = require('../functions/getArgs');
const { getData } = require('../api');
const { handleResponse } = require('../functions/handleResponse');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Get all map stats for a VALORANT user')
    .addStringOption((option) =>
      option
        .setName('username-tag')
        .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const playerID = encodeURIComponent(await getArgs(interaction));
    if (!playerID) return;

    const [trackerProfile, trackerOverview] = await Promise.all([
      getData(playerID, DataType.PROFILE),
      getData(playerID, DataType.COMP_OVERVIEW),
    ]);

    const dataSources = [trackerOverview, trackerProfile];
    if (!(await handleResponse(interaction, dataSources))) return;

    const author = getAuthor(trackerProfile.data.data, playerID);

    const mapObjects = trackerOverview.data.data.filter((item) => item.type === 'map');

    mapObjects.sort((a, b) => b.stats.timePlayed.value - a.stats.timePlayed.value);

    const mapEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setAuthor(author)
      .setThumbnail(author.iconURL)
      .setDescription('```grey\n      ' + '        Map Stats' + '\n```')
      .setFooter({ text: 'Competitive Maps Only' });

    mapObjects.forEach((map) => {
      const {
        metadata: { name },
        stats: {
          timePlayed: { displayValue: timePlayed },
          matchesWon: { displayValue: matchesWon },
          matchesLost: { displayValue: matchesLost },
          matchesWinPct: { value: winPctValue },
        },
      } = map;
      greenSquare = parseInt((winPctValue / 100) * 16);
      redSquare = 16 - greenSquare;
      winRateVisualized =
        '<:greenline:839562756930797598>'.repeat(greenSquare) +
        '<:redline:839562438760071298>'.repeat(redSquare);

      const mapEmoji = assets.mapEmojis[name]?.emoji || '▫️';

      const winRatePct = parseInt(winPctValue).toFixed(0);
      mapEmbed.addFields({
        name: `${name}  ${mapEmoji}    |    ${timePlayed}    |    W/L: ${matchesWon}/${matchesLost} - ${winRatePct}%`,
        value: winRateVisualized,
        inline: false,
      });
    });

    return await interaction.editReply({
      embeds: [mapEmbed],
      components: [buttons],
    });
  },
};
