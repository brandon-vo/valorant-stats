const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { getRow, editGetRow, timeout } = require('../components/pages');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const assets = require('../assets.json');
const { getProfile, getMatch, getMatchInfo } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lastmatch')
        .setDescription('Get last match stats for a VALORANT user')
        .addStringOption(option =>
            option.setName('username-tag')
                .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
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
            trackerMatch = await getMatch(playerID);
            switch (trackerMatch) {
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
                    var profileStats = trackerProfile.data.data.segments;
                    var lastMatch = trackerMatch.data.data.matches[0]; // Last match info
                    var lmStats = lastMatch.segments[0].stats; // Last match stats for the player
                    var matchID = lastMatch.attributes.id; // Match ID
                    break;
            }

            for (let x = 0; x < profileStats.length; x++) {
                if (profileStats[x].metadata.name === 'Competitive' && profileStats[x].type === 'playlist')
                    var compStats = profileStats[x].stats;
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle; // Username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl; // Avatar image

            const author = {
                name: `${userHandle}`,
                iconURL: userAvatar,
                url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`
            };

            var lastAgent = lastMatch.segments[0].metadata.agentName;

            if (lastAgent == "Astra" || lastAgent == "Breach" || lastAgent == "Brimstone" || lastAgent == "Cypher" || lastAgent == "Jett"
                || lastAgent == "Killjoy" || lastAgent == "Omen" || lastAgent == "Phoenix" || lastAgent == "Raze" || lastAgent == "Reyna"
                || lastAgent == "Sage" || lastAgent == "Skye" || lastAgent == "Sova" || lastAgent == "Viper" || lastAgent == "Yoru" || lastAgent == "KAY/O") {
                agentEmoji = assets.agentEmojis[lastAgent].emoji
            }

            // Check last match mode
            if (lastMatch.metadata.modeName === 'Unknown') {
                return await interaction.reply({
                    embeds: [noStatsEmbed],
                    components: [buttons],
                    ephemeral: true
                });
            }

            // Access last match info
            matchInfo = await getMatchInfo(matchID);
            if (matchInfo === 'default_error') {
                return await interaction.reply({ embeds: [errorEmbed], components: [buttons] });
            }

            const lastMap = lastMatch.metadata.mapName // Map name

            // 2D Arrays
            playerMatchInfo = [] // All players
            redTeam = [] // Team A
            blueTeam = [] // Team B

            // Check if last match was a deathmatch game
            if (lastMatch.metadata.modeName === 'Deathmatch') {

                // Get the 14 players
                for (x = 14; x < 28; x++) {
                    playerName = matchInfo.data.data.segments[x].attributes.platformUserIdentifier
                    playerAgent = matchInfo.data.data.segments[x].metadata.agentName
                    playerScore = matchInfo.data.data.segments[x].stats.score.value
                    playerKills = matchInfo.data.data.segments[x].stats.kills.displayValue
                    playerDeaths = matchInfo.data.data.segments[x].stats.deaths.displayValue
                    playerAssists = matchInfo.data.data.segments[x].stats.assists.displayValue
                    playerKDR = matchInfo.data.data.segments[x].stats.kdRatio.displayValue

                    // Add information to array
                    playerMatchInfo.push([playerName, playerAgent, playerScore, playerKills, playerDeaths, playerAssists, playerKDR])
                }

                playerMatchInfo.sort(function (a, b) { return b[3] - a[3] }) // Sort players by kills

                if (lastMap != 'Bind' && lastMap != 'Split' && lastMap != 'Haven' && lastMap != 'Ascent' && lastMap != 'Icebox' && lastMap != 'Breeze') {
                    var mapImage = assets.maps['Unknown'].img
                } else {
                    var mapImage = assets.maps[lastMap].img // Set map image
                }
                var deathmatchEmoji = assets.modeEmojis[lastMatch.metadata.modeName].emoji

                // Placement text formatting
                if (lmStats.placement.displayValue === '1')
                    lmStats.placement.displayValue = '1st'
                else if (lmStats.placement.displayValue === '2')
                    lmStats.placement.displayValue = '2nd'
                else if (lmStats.placement.displayValue === '3')
                    lmStats.placement.displayValue = '3rd'
                else
                    lmStats.placement.displayValue = lmStats.placement.displayValue + 'th'

                // Embed
                const deathmatchEmbed = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle('Last Match Stats - ' + lastMap + " " + deathmatchEmoji)
                    .setAuthor(author)
                    .setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                    .setDescription("`" + lastMatch.metadata.timestamp + "`")
                    .setDescription("```\n     " + lastMatch.metadata.modeName + " - " + lmStats.playtime.displayValue + "\n```")
                    .setImage(mapImage)
                    .setFooter({ text: "You placed " + lmStats.placement.displayValue })

                var count = 0 // Count columns for embed format

                for (let x = 0; x < playerMatchInfo.length; x++) {

                    let name = playerMatchInfo[x][0]
                    let agent = playerMatchInfo[x][1]
                    let score = playerMatchInfo[x][2]
                    let kills = playerMatchInfo[x][3]
                    let deaths = playerMatchInfo[x][4]
                    let assists = playerMatchInfo[x][5]

                    var username = name.split('#', 2) // Username without tag

                    var playerAgentEmoji = ":white_small_square:"

                    if (agent == "Astra" || agent == "Breach" || agent == "Brimstone" || agent == "Cypher" || agent == "Jett"
                        || agent == "Killjoy" || agent == "Omen" || agent == "Phoenix" || agent == "Raze" || agent == "Reyna"
                        || agent == "Sage" || agent == "Skye" || agent == "Sova" || agent == "Viper" || agent == "Yoru" || agent == "KAY/O") {
                        var playerAgentEmoji = assets.agentEmojis[agent].emoji // Set emoji to played agent
                    }

                    count++;

                    deathmatchEmbed.addFields(
                        {
                            name: username[0] + playerAgentEmoji, value: "```yaml\nPts: " + score + "     \n"
                                + kills + " / " + deaths + " / " + assists + "\n```", inline: true
                        },
                    )

                    // For 2 column formatting
                    if (count == 2) {
                        deathmatchEmbed.addField('\u200B', '\u200B', true)
                        count = 0
                    }
                }

                return message.channel.send({ embeds: [deathmatchEmbed], components: [defaultButtons] }) // Send embed
            }
            // Get info about players in last match
            for (x = 2; x < 12; x++) {
                playerName = matchInfo.data.data.segments[x].attributes.platformUserIdentifier
                playerKills = matchInfo.data.data.segments[x].stats.kills.displayValue
                playerDeaths = matchInfo.data.data.segments[x].stats.deaths.displayValue
                playerAssists = matchInfo.data.data.segments[x].stats.assists.displayValue
                playerKDR = matchInfo.data.data.segments[x].stats.kdRatio.displayValue
                playerACS = matchInfo.data.data.segments[x].stats.scorePerRound.displayValue
                playerTeam = matchInfo.data.data.segments[x].metadata.teamId
                playerAgent = matchInfo.data.data.segments[x].metadata.agentName
                playerRank = matchInfo.data.data.segments[x].stats.rank.displayValue

                // Add information to a 2D array
                playerMatchInfo.push([playerName, playerAgent, playerRank, playerKills, playerDeaths, playerAssists, playerKDR, playerACS, playerTeam])
            }

            // Separate both teams
            for (x = 0; x < playerMatchInfo.length; x++) {
                if (playerMatchInfo[x][8] == 'Red')
                    redTeam.push(playerMatchInfo[x])
                if (playerMatchInfo[x][8] == 'Blue')
                    blueTeam.push(playerMatchInfo[x])
            }

            // Text format
            if (lastMatch.segments[0].metadata.result == 'victory') {
                lastMatch.segments[0].metadata.result = 'Victory'
                if (lastMap != 'Bind' && lastMap != 'Split' && lastMap != 'Haven' && lastMap != 'Ascent' && lastMap != 'Icebox' && lastMap != 'Breeze') {
                    var mapImage = assets.maps['Unknown'].imgWon
                } else {
                    var mapImage = assets.maps[lastMap].imgWon
                }
            } else if (lastMatch.segments[0].metadata.result == 'defeat') {
                if (lmStats.roundsWon.value == lmStats.roundsLost.value) {
                    lastMatch.segments[0].metadata.result == 'Draw'
                    if (lastMap != 'Bind' && lastMap != 'Split' && lastMap != 'Haven' && lastMap != 'Ascent' && lastMap != 'Icebox' && lastMap != 'Breeze') {
                        var mapImage = assets.maps['Unknown'].imgDraw
                    } else {
                        var mapImage = assets.maps[lastMap].imgDraw
                    }
                } else {
                    lastMatch.segments[0].metadata.result = 'Defeat'
                    if (lastMap != 'Bind' && lastMap != 'Split' && lastMap != 'Haven' && lastMap != 'Ascent' && lastMap != 'Icebox' && lastMap != 'Breeze') {
                        var mapImage = assets.maps['Unknown'].imgLost
                    } else {
                        var mapImage = assets.maps[lastMap].imgLost
                    }
                }
            }

            // Text format
            if (lastMatch.metadata.modeName == 'Normal') {
                lastMatch.metadata.modeName = 'Unrated'
            }

            // Score
            greenSquare = Math.round(lmStats.roundsWon.displayValue)
            redSquare = Math.round(lmStats.roundsLost.displayValue)
            scoreVisualized = "<:greenline:839562756930797598>".repeat(greenSquare) + "\n" + "<:redline:839562438760071298>".repeat(redSquare)

            redTeam.sort(function (a, b) { return b[7] - a[7] }) // Sort team players by ACS
            blueTeam.sort(function (a, b) { return b[7] - a[7] }) // Sort team players by ACS

            var time = lastMatch.metadata.timestamp
            var timeStamp = time.split('T', 2) // Get date of match

            var modeEmoji = assets.modeEmojis[lastMatch.metadata.modeName].emoji // Setting emoji for gamemode

            const lastMatchEmbed1 = new MessageEmbed()

            // Competitive game embed
            if (lastMatch.metadata.modeName === 'Competitive') {
                // Set rank emojis and name
                var rankName = '';
                var rankEmoji = '';
                if (compStats) {
                    rankName = compStats.rank.metadata.tierName;
                    rankEmoji = assets.rankEmojis[rankName].emoji;
                    if (rankName.includes('Immortal')) {
                        rankName = rankName.split(' ')[0] + ' #' + compStats.rank.rank;
                    }
                    else if (rankName.includes('Radiant')) {
                        rankName = rankName + ' #' + compStats.rank.rank;
                    }
                } else {
                    return await interaction.reply({
                        embeds: [noStatsEmbed],
                        components: [buttons],
                        ephemeral: true
                    });
                }

                lastMatchEmbed1.setColor('#11806A')
                lastMatchEmbed1.setTitle('Last Match Stats - ' + lastMap)
                lastMatchEmbed1.setAuthor(author)
                lastMatchEmbed1.setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                lastMatchEmbed1.setDescription("`              " + timeStamp[0] + "             `")
                lastMatchEmbed1.addFields(
                    { name: 'Mode ' + modeEmoji, value: "```yaml\n" + lastMatch.metadata.modeName + "\n```", inline: true },
                    { name: 'Length', value: "```yaml\n" + lmStats.playtime.displayValue + "\n```", inline: true },
                    {
                        name: 'Rank' + rankEmoji + "               K / D / A              KDR", value: "```grey\n" + lmStats.rank.metadata.tierName
                            + "    " + lmStats.kills.displayValue + "/" + lmStats.deaths.displayValue + "/" + lmStats.assists.displayValue +
                            "      " + lmStats.kdRatio.displayValue + "\n```", inline: false
                    },
                    { name: 'Combat Scr', value: "```yaml\n" + lmStats.score.displayValue + "\n```", inline: true },
                    { name: 'ACS', value: "```yaml\n" + lmStats.scorePerRound.displayValue + "\n```", inline: true },
                    { name: 'Econ Rating', value: "```yaml\n" + lmStats.econRating.displayValue + "\n```", inline: true },
                    { name: 'Headshot %', value: "```yaml\n" + lmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                    { name: 'First Bloods', value: "```yaml\n" + lmStats.firstBloods.displayValue + "\n```", inline: true },
                    {
                        name: 'Score', value: scoreVisualized + "```yaml\n             " + lmStats.roundsWon.displayValue + " - "
                            + lmStats.roundsLost.displayValue + "\n```", inline: false
                    },
                )
                lastMatchEmbed1.setImage(mapImage)
            }

            // Other gamemode embeds
            else {
                lastMatchEmbed1.setColor('#11806A')
                lastMatchEmbed1.setTitle('Last Match Stats - ' + lastMap)
                lastMatchEmbed1.setAuthor(author)
                lastMatchEmbed1.setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                lastMatchEmbed1.setDescription("`" + lastMatch.metadata.timestamp + "`")
                lastMatchEmbed1.addFields(
                    { name: 'Mode ' + modeEmoji, value: "```yaml\n" + lastMatch.metadata.modeName + "\n```", inline: true },
                    { name: 'Length', value: "```yaml\n" + lmStats.playtime.displayValue + "\n```", inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    {
                        name: 'K / D / A', value: "```yaml\n" + lmStats.kills.displayValue + "/" + lmStats.deaths.displayValue
                            + "/" + lmStats.assists.displayValue + "\n```", inline: true
                    },
                    { name: 'KDR', value: "```yaml\n" + lmStats.kdRatio.displayValue + "\n```", inline: true },
                    { name: 'ACS', value: "```yaml\n" + lmStats.scorePerRound.displayValue + "\n```", inline: true },
                    { name: 'Econ Rating', value: "```yaml\n" + lmStats.econRating.displayValue + "\n```", inline: true },
                    { name: 'Headshot %', value: "```yaml\n" + lmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                    {
                        name: 'Score', value: scoreVisualized + "```yaml\n             " + lmStats.roundsWon.displayValue
                            + " - " + lmStats.roundsLost.displayValue + "\n```", inline: false
                    },
                )
                lastMatchEmbed1.setImage(mapImage)
            }

            const lastMatchEmbed2 = new MessageEmbed()
                .setColor('#11806A')
                .setTitle('Last Match Stats - ' + lastMap + " | " + lmStats.roundsWon.displayValue + " - " + lmStats.roundsLost.displayValue)
                .setAuthor(author)
                .setDescription('```\n                Players in your game\n```')

            var count = 0;

            for (let x = 0; x < playerMatchInfo.length / 2; x++) {
                var nameA = blueTeam[x][0];
                var agentA = blueTeam[x][1];
                var rankA = blueTeam[x][2];
                var killsA = blueTeam[x][3];
                var deathsA = blueTeam[x][4];
                var assistsA = blueTeam[x][5];
                var kdrA = blueTeam[x][6];
                var acsA = blueTeam[x][7];

                var nameB = redTeam[x][0];
                var agentB = redTeam[x][1];
                var rankB = redTeam[x][2];
                var killsB = redTeam[x][3];
                var deathsB = redTeam[x][4];
                var assistsB = redTeam[x][5];
                var kdrB = redTeam[x][6];
                var acsB = redTeam[x][7];

                var playerAgentEmojiA = ":white_small_square:";
                var playerAgentEmojiB = ":white_small_square:";

                if (agentA == "Astra" || agentA == "Breach" || agentA == "Brimstone" || agentA == "Cypher" || agentA == "Jett"
                    || agentA == "Killjoy" || agentA == "Omen" || agentA == "Phoenix" || agentA == "Raze" || agentA == "Reyna"
                    || agentA == "Sage" || agentA == "Skye" || agentA == "Sova" || agentA == "Viper" || agentA == "Yoru" || agentA == 'KAY/O') {
                    var playerAgentEmojiA = assets.agentEmojis[agentA].emoji;
                }
                var playerRankEmojiA = assets.rankEmojis[rankA].emoji

                if (agentB == "Astra" || agentB == "Breach" || agentB == "Brimstone" || agentB == "Cypher" || agentB == "Jett"
                    || agentB == "Killjoy" || agentB == "Omen" || agentB == "Phoenix" || agentB == "Raze" || agentB == "Reyna"
                    || agentB == "Sage" || agentB == "Skye" || agentB == "Sova" || agentB == "Viper" || agentB == "Yoru" || agentB == 'KAY/O') {
                    var playerAgentEmojiB = assets.agentEmojis[agentB].emoji;

                }
                var playerRankEmojiB = assets.rankEmojis[rankB].emoji;

                count++;

                lastMatchEmbed2.addFields(
                    {
                        name: nameA + " " + playerAgentEmojiA + " " + playerRankEmojiA, value: "```yaml\nK / D / A / R   | ACS\n" +
                            killsA + " / " + deathsA + " / " + assistsA + " / " + kdrA + " | " + parseInt(acsA).toFixed(0) + "\n```", inline: true
                    },
                    {
                        name: nameB + " " + playerAgentEmojiB + " " + playerRankEmojiB, value: "```fix\nK / D / A / R   | ACS\n" +
                            killsB + " / " + deathsB + " / " + assistsB + " / " + kdrB + " | " + parseInt(acsB).toFixed(0) + "\n```", inline: true
                    },
                )

                // For 2 column formatting
                if (count == 1) {
                    lastMatchEmbed2.addField('\u200B', '\u200B', true)
                    count = 0;
                }
            }

            const embeds = [];
            const pages = {};

            embeds.push(lastMatchEmbed1);
            embeds.push(lastMatchEmbed2);

            const randomID = Math.floor(Math.random() * 99999999);

            let collector;
            const id = interaction.user.id;
            pages[id] = pages[id] || 0;
            const embed = embeds[pages[id]]

            const filter = (i) => i.user.id === interaction.user.id;

            let navButtons = getRow(id, pages, embeds, randomID);
            if (typeof navButtons === 'number') {
                const cooldownEmbed = new MessageEmbed()
                    .setColor('#11806A')
                    .setAuthor(author)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: ':warning: You are on cooldown!', value: "Please wait " + navButtons + " more seconds before using this command." },
                    )

                return await interaction.reply({
                    embeds: [cooldownEmbed],
                    components: [buttons],
                    ephemeral: true
                })
            }

            reply = await interaction.reply({
                embeds: [embed],
                components: [navButtons],
                fetchReply: true
            });
            collector = interaction.channel.createMessageComponentCollector({ filter, time: timeout });

            collector.on('collect', btnInt => {
                if (!btnInt) {
                    return
                }
                btnInt.deferUpdate()
                if (btnInt.customId !== 'previous' + randomID && btnInt.customId !== 'next' + randomID) {
                    return;
                }
                if (btnInt.customId === 'previous' + randomID && pages[id] > 0) {
                    --pages[id];
                } else if (btnInt.customId === 'next' + randomID && pages[id] < embeds.length - 1) {
                    ++pages[id];
                }
                if (reply) {
                    interaction.editReply({
                        embeds: [embeds[pages[id]]],
                        components: [editGetRow(id, pages, embeds, randomID)],
                    });
                }
            });
        })()
    }
}