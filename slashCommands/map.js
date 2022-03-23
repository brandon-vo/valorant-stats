const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const assets = require('../assets.json');
const { getProfile, getMap } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Get all map stats for a Valorant user')
        .addStringOption(option =>
            option.setName('username-tag')
                .setDescription('Your Valorant Username and Tagline (ex: CMDRVo#CMDR)')
                .setRequired(false)),
    async execute(interaction) {

        let args = interaction.options.getString('username-tag');
        let account = await Account.find({ discordId: interaction.user.id });
        if (!args) {
            if (account.length < 1) {
                return await interaction.reply({
                    embeds: [noAccountEmbed],
                    components: [buttons]
                });
            }
            args = account[0].valorantAccount;
        }

        if (args.includes('@')) {
            try {
                mentionedID = args.split('!')[1].slice(0, -1);
                taggedAccount = await Account.find({ discordId: (mentionedID) });
                args = taggedAccount[0].valorantAccount;
            } catch (error) {
                return await interaction.reply({
                    embeds: [errorEmbed],
                    components: [helpButtons],
                    ephemeral: true
                });
            }
        }

        const playerID = encodeURIComponent(args);

        (async () => {
            trackerProfile = await getProfile(playerID);
            trackerMap = await getMap(playerID);
            switch (trackerMap) {
                case '403_error':
                    return await interaction.reply({
                        embeds: [maintenanceEmbed],
                        components: [buttons],
                        ephemeral: true
                    });
                case 'default_error':
                    return await interaction.reply({
                        embeds: [errorEmbed],
                        components: [helpButtons],
                        ephemeral: true
                    });
                default:
                    mapStats = trackerMap.data.data; // Map stats
                    break;
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle; // Username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl; // Avatar image

            const author = {
                name: `${userHandle}`,
                iconURL: userAvatar,
                url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`
            };

            mapInfo = []
            for (let x = 0; x < mapStats.length; x++) {

                if (x != 4) { // Skip index 4, old Icebox
                    mapInfo.push([mapStats[x].metadata.name, mapStats[x].stats.timePlayed.displayValue,
                    mapStats[x].stats.matchesWon.value, mapStats[x].stats.matchesWon.displayValue,
                    mapStats[x].stats.matchesLost.value, mapStats[x].stats.matchesLost.displayValue,
                    mapStats[x].stats.matchesWinPct.value, mapStats[x].stats.matchesWinPct.displayValue])
                }
            }

            const mapEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .setDescription("```grey\n      " + "        Map Stats" + "\n```")
                .setFooter({ text: 'Competitive Maps Only' })

            for (let i = 0; i < mapInfo.length; i++) { // For all avaliable maps

                greenSquare = parseInt((mapInfo[i][6] / 100) * 16)
                redSquare = 16 - greenSquare
                winRateVisualized = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                let mapName = mapInfo[i][0]
                let timePlayed = mapInfo[i][1]
                let winRate = mapInfo[i][7]
                let mapEmoji = '▫️'

                let availableMapEmojis = ['Ascent', 'Bind', 'Breeze', 'Haven', 'Icebox', 'Split', 'Fracture'];
                if (availableMapEmojis.includes(mapName)) {
                    mapEmoji = assets.mapEmojis[mapName].emoji;
                }

                mapEmbed.addFields(
                    {
                        name: mapName + " " + mapEmoji + "    |    " + timePlayed + "    |    Win Rate: " + parseInt(winRate).toFixed(0) + "%",
                        value: winRateVisualized, inline: false
                    },
                )
            }

            await interaction.reply({
                embeds: [mapEmbed],
                components: [buttons]
            })
        })()
    }
}