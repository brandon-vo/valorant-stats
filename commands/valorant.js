const { MessageEmbed, Message } = require('discord.js');
const pagination = require('discord.js-pagination')
const assets = require('../assets.json')
const fs = require('fs')
const axios = require('axios').default;

module.exports = {
    name: "valorant",
    aliases: ['stats', 'lastmatch', 'lm', 'test'],
    description: "Get statistics for a Valorant player",
    async execute(message, args, command, client) {

        // Argument formatting to access Valorant usernames with spaces
        var str = args[0];
        for (i = 1; i < args.length; i++)
            str += '%20' + args[i];

        // Read accounts file
        const accounts = JSON.parse(
            fs.readFileSync("./accounts.json", "utf8", function (error) {
                if (error) console.log(error);
            })
        );

        // If theres no argument provided by user, check if they linked a Valorant account to their Discord ID
        if (!args[0] && accounts[message.author.id])
            str = accounts[message.author.id].username
        else if (!args[0])
            return message.reply('Please include your Valorant username and tag (USERNAME#TAG)')

        // Convert characters to lowercase
        var ID = str.toLowerCase();

        var playerID = ID.replace(/#/g, "%23")

        try {

            // Check if account exists
            try {
                trackerProfile = await axios.get(
                    `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${playerID}`
                )

                trackerMatch = await axios.get(
                    `https://api.tracker.gg/api/v2/valorant/rap-matches/riot/${playerID}`
                )

            } catch (error) {
                message.reply("Please ensure the player you are viewing has logged into tracker.gg! https://tracker.gg/valorant")
                return
            }

            const compStats = trackerProfile.data.data.segments[0].stats // access overall comp stats
            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle // access username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl // access valorant avatar image
            const lastMatch = trackerMatch.data.data.matches[0] // access last match info
            const lmStats = lastMatch.segments[0].stats // access last match stats for the player

            const matchID = lastMatch.attributes.id
            try {
                matchInfo = await axios.get(
                    `https://api.tracker.gg/api/v2/valorant/rap-matches/${matchID}`
                )
            } catch (error) {
                message.reply("There is no match to retrieve.")
                return
            }

            // Set rank emojis
            var rankEmoji = ':medal:'
            rankEmoji = assets.rankEmojis[compStats.rank.metadata.tierName].emoji

            // Set agent emoji for the user
            var agentEmoji = ':slight_smile:'
            agentEmoji = assets.agentEmojis[lastMatch.segments[0].metadata.agentName].emoji

            if (command === 'stats') {

                //console.log(trackerProfile.data.data)
                //console.log('-------------------')
                //console.log(trackerMatch.data.data.matches)
                //console.log('-------------------')
                // console.log(trackerProfile.data.data.segments)
                // console.log('-------------------')
                // console.log(trackerProfile.data.data.segments[0].stats) // comp stats
                // console.log('-------------------')

                // console.log(compStats.matchesWon.displayValue) // amount of wins
                // console.log(compStats.matchesLost.displayValue) // amount of losses
                // console.log(compStats.matchesWinPct.displayValue) // win percent
                // console.log(compStats.headshotsPercentage.displayValue) //headshot percent
                // console.log(compStats.kDRatio.displayValue) //kdr
                // console.log(compStats.damagePerRound.displayValue) //dmg/round
                // console.log(compStats.timePlayed.displayValue) // time played
                // console.log(compStats.rank.metadata.tierName) // rank
                // console.log(compStats.kills.displayValue) // total kills
                // console.log(compStats.deaths.displayValue) // total deaths
                // console.log(compStats.assists.displayValue) // total assists
                // console.log(compStats.killsPerMatch.displayValue) // kills per match average
                // console.log(compStats.deathsPerMatch.displayValue) // deaths per match average
                // console.log(compStats.assistsPerMatch.displayValue) // assists per match average
                // console.log(compStats.firstBloods.displayValue) // first bloods total
                //console.log(compStats.deathsFirst.displayValue) // first deaths total
                //console.log(compStats.mostKillsInMatch.displayValue) // most kills in a match
                //console.log(compStats.econRatingPerMatch.displayValue) // average econ rating
                //console.log(compStats.damagePerRound.displayValue) // damage per round comp
                //console.log(compStats)
                console.log(trackerProfile.data.data)
                console.log(compStats)

                //console.log(trackerProfile.data.data.segments[1]) //deathmatch stats
                console.log('-------------------')
                //console.log(trackerProfile.data.data.segments[2]) //escalation stats
                console.log('-------------------')
                //console.log(trackerProfile.data.data.segments[3]) //spike rush stats
                console.log('-------------------')
                //console.log(trackerProfile.data.data.segments[4]) // unrated stats
                //console.log(trackerProfile.data.data.segments[5].attributes)
                //console.log(trackerProfile.data.data.segments[5].metadata) // cypher
                //console.log(trackerProfile.data.data.segments[5].stats) // 
                //console.log(trackerProfile.data.data.segments[6].metadata) // killjoy
                //console.log(trackerProfile.data.data.segments[7].metadata) // sova
                //console.log(trackerProfile.data.data.segments[8].metadata) // sage
                //console.log(trackerProfile.data.data.segments[9])
                //console.log(trackerProfile.data.data.segments[5].stats)

                //console.log(trackerProfile.data.data.segments[14].metadata) //recent matches - escalation
                //console.log(trackerProfile.data.data.segments[15].metadata) // recent matches - spike rush


                // each square represents ~8.33%
                greenSquare = Math.round(compStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "🟩".repeat(greenSquare) + "🟥".repeat(redSquare)


                const statsEmbed1 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Competitive Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + compStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA ', value: "```yaml\n" + compStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'Rank ' + rankEmoji, value: "```grey\n" + compStats.rank.metadata.tierName + "\n```", inline: true },
                        { name: 'Kills', value: "```yaml\n" + compStats.kills.displayValue + "\n```", inline: true },
                        { name: 'Deaths', value: "```yaml\n" + compStats.deaths.displayValue + "```", inline: true },
                        { name: 'Assists', value: "```yaml\n" + compStats.assists.displayValue + "\n```", inline: true },
                        { name: 'Most Kills', value: "```yaml\n" + compStats.mostKillsInMatch.displayValue + "\n```", inline: true },
                        { name: 'Playtime', value: "```yaml\n" + compStats.timePlayed.displayValue + "\n```", inline: true },
                        {
                            name: 'Win Rate - ' + compStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                                + compStats.matchesWon.displayValue + "   |   L: " + compStats.matchesLost.displayValue + "\n```", inline: false
                        },
                    )
                    .setFooter(compStats.rank.metadata.tierName, compStats.rank.metadata.iconUrl);

                const statsEmbed2 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Competitive Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'Kills/Match', value: "```yaml\n" + compStats.killsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Deaths/Match ', value: "```yaml\n" + compStats.deathsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Assists/Match', value: "```yaml\n" + compStats.assistsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + compStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'DMG/Round', value: "```yaml\n" + compStats.damagePerRound.displayValue + "\n```", inline: true },
                        { name: 'Average Econ', value: "```yaml\n" + compStats.econRatingPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Plants', value: "```yaml\n" + compStats.plants.displayValue + "\n```", inline: true },
                        { name: 'Defuses', value: "```yaml\n" + compStats.defuses.displayValue + "\n```", inline: true },
                        { name: 'Aces', value: "```yaml\n" + compStats.aces.displayValue + "\n```", inline: true },
                        { name: 'First Bloods :drop_of_blood:', value: "```yaml\n" + compStats.firstBloods.displayValue + "\n```", inline: true },
                        { name: 'First Deaths :skull_crossbones:', value: "```yaml\n" + compStats.deathsFirst.displayValue + "\n```", inline: true },
                    )

                // Pages
                const statsPages = [
                    statsEmbed1,
                    statsEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '200000' // 20 seconds

                pagination(message, statsPages, flipPage, timeout)

            }

            else if (command === 'lastmatch' || command === 'lm') {
                // console.log(trackerMatch.data.data)
                // console.log('-------------------')
                // //console.log(trackerMatch.data.data.matches) // match history
                // console.log('-------------------')
                //console.log(trackerMatch.data.data.segments[0])
                console.log('-------------------')
                // console.log(trackerMatch.data.data.matches.segments[0])
                //console.log(trackerMatch.data.data)
                console.log('-------------------')
                //console.log(lastMatch)
                console.log('----')
                //console.log(lastMatch.attributes) // useless
                console.log('-------------------')
                //console.log(lastMatch.metadata) // map stuff. mostly useless except for mapname and result
                console.log('-------------------')
                //console.log(lastMatch)
                //console.log(lastMatch.attributes.id)
                //console.log(matchInfo.data.data)
                //console.log(matchInfo.data.data.segments[0]) //red team
                //console.log(matchInfo.data.data.segments[1]) // blue team
                console.log(matchInfo.data.data.segments[2])
                console.log("^^^")

                playerMatchInfo = []
                redTeam = []
                blueTeam = []

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
                    if (playerMatchInfo[x][8] === 'Red')
                        redTeam.push(playerMatchInfo[x])
                    if (playerMatchInfo[x][8] === 'Blue')
                        blueTeam.push(playerMatchInfo[x])
                }

                // Game modes with teams
                if (lastMatch.metadata.modeName !== 'Deathmatch') {
                    playerMatchInfoSorted = []

                    for (x = 0; x < playerMatchInfo.length / 2; x++)
                        playerMatchInfoSorted.push(redTeam[x], blueTeam[x])

                    playerMatchInfo = []
                    playerMatchInfo = playerMatchInfoSorted
                }

                //}
                // console.log(trackerMatch.data.data.matches[0]) // LAST MATCH -> made a variable called lastMatch
                //console.log(lastMatch)
                // console.log('-------------------')
                // console.log(lastMatch.segments) // players last match info
                // console.log('-------------------')
                // console.log(lastMatch.metadata.modeName) //competitive...
                // console.log(lastMatch.metadata.modeImageUrl) // image of the mode
                // console.log(lastMatch.metadata.mapName) // map name
                // console.log(lastMatch.segments[0]) // more detail of player last match
                // console.log(lastMatch.segments[0].metadata.result) // victory/defeat
                // console.log(lastMatch.segments[0].metadata.agentName) // players last match agent
                // console.log(lastMatch.segments[0].metadata.agentImageUrl) // players last match agent image
                // console.log(lastMatch.segments[0].stats.score.displayValue)
                // console.log(lastMatch.segments[0].stats.kills.displayValue) // kills
                // console.log(lastMatch.segments[0].stats.deaths.displayValue) //deaths
                // console.log(lastMatch.segments[0].stats.assists.displayValue) // assists
                // console.log(lastMatch.segments[0].stats.kdRatio.displayValue) // kd
                // console.log(lastMatch.segments[0].stats.plants.displayValue)
                // console.log(lastMatch.segments[0].stats.defuses.displayValue)
                // console.log(lastMatch.segments[0].stats.playtime.displayValue)
                // console.log(lastMatch.segments[0].stats.econRating.displayValue) // econ rating
                // console.log(lastMatch.segments[0].stats.firstBloods.displayValue) // first blood
                // console.log(lastMatch.segments[0].stats.roundsWon.displayValue) // rounds won
                // console.log(lastMatch.segments[0].stats.roundsLost.displayValue) // rounds lost
                // console.log(lastMatch.segments[0].stats.placement.displayValue) // rank on scoreboard
                // console.log(lastMatch.segments[0].stats.headshotsPercentage.displayValue) // headshot %
                // console.log(lastMatch.segments[0].stats.rank.metadata.tierName) // silver 2
                // console.log(lastMatch.segments[0].stats.rank.metadata.iconUrl) // rank img

                const lastMap = lastMatch.metadata.mapName

                if (lastMatch.segments[0].metadata.result === 'victory') {
                    lastMatch.segments[0].metadata.result = 'Victory'
                    var mapImage = assets.maps[lastMap].imgWon
                } else if (lastMatch.segments[0].metadata.result === 'defeat') {
                    lastMatch.segments[0].metadata.result = 'Defeat'
                    var mapImage = assets.maps[lastMap].imgLost
                } else if (lastMatch.segments[0].metadata.result === 'draw') {
                    lastMatch.segments[0].metadata.result = 'Draw'
                    var mapImage = assets.maps[lastMap.imgDraw]
                }

                greenSquare = Math.round(lmStats.roundsWon.displayValue)
                redSquare = Math.round(lmStats.roundsLost.displayValue)

                scoreVisualized = "🟩".repeat(greenSquare) + "\n" + "🟥".repeat(redSquare)

                const lastMatchEmbed1 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle('Last Match Stats - ' + lastMap)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                    .setDescription("`" + lastMatch.metadata.timestamp + "`")
                    .addFields(
                        { name: 'Mode', value: "```yaml\n" + lastMatch.metadata.modeName + "\n```", inline: true },
                        { name: 'Length', value: "```yaml\n" + lmStats.playtime.displayValue + "\n```", inline: true },
                        //{ name: 'Agent ' + agentEmoji, value: "```yaml\n" + lastMatch.segments[0].metadata.agentName + "\n```", inline: true },
                        { name: 'Rank' + rankEmoji, value: "```grey\n" + lmStats.rank.metadata.tierName + "\n```", inline: false },
                        { name: 'K / D / A', value: "```yaml\n" + lmStats.kills.displayValue + "/" + lmStats.deaths.displayValue + "/" + lmStats.assists.displayValue + "\n```", inline: true },
                        { name: 'KDR', value: "```yaml\n" + lmStats.kdRatio.displayValue + "\n```", inline: true },
                        { name: 'ACS', value: "```yaml\n" + lmStats.scorePerRound.displayValue + "\n```", inline: true },
                        { name: 'Econ Rating', value: "```yaml\n" + lmStats.econRating.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + lmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'Score', value: scoreVisualized + "```yaml\n             " + lmStats.roundsWon.displayValue + " - " + lmStats.roundsLost.displayValue + "\n```", inline: false },
                    )
                    .setTimestamp()
                    .setImage(mapImage)

                const lastMatchEmbed2 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle('Last Match Stats - ' + lastMap)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setDescription('Players in your game')

                var count = 0
                var teamColour = ':white_circle:'

                for (x = 0; x < playerMatchInfo.length; x++) {

                    if (playerMatchInfo[x][8] === 'Red')
                        teamColour = ':red_circle:'

                    if (playerMatchInfo[x][8] === 'Blue')
                        teamColour = ':blue_circle:'

                    let name = playerMatchInfo[x][0]
                    let agent = playerMatchInfo[x][1]
                    let rank = playerMatchInfo[x][2]
                    let kills = playerMatchInfo[x][3]
                    let deaths = playerMatchInfo[x][4]
                    let assists = playerMatchInfo[x][5]
                    let kdr = playerMatchInfo[x][6]
                    let acs = playerMatchInfo[x][7]

                    var playerAgentEmoji = assets.agentEmojis[agent].emoji
                    var playerRankEmoji = assets.rankEmojis[rank].emoji

                    count++

                    lastMatchEmbed2.addFields(
                        { name: name + " " + teamColour + " " + playerAgentEmoji + " " + playerRankEmoji, value: "```yaml\nK / D / A / R   | ACS\n" + 
                        kills + " / " + deaths + " / " + assists + " / " + kdr + " | " + parseInt(acs).toFixed(0) + "\n```", inline: true },
                    )

                    // For 2 column formatting
                    if (count == 2) {
                        lastMatchEmbed2.addField('\u200B', '\u200B', true)
                        count = 0
                    }
                }

                // Pages
                const lastMatchPages = [
                    lastMatchEmbed1,
                    lastMatchEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '200000' // 20 seconds

                pagination(message, lastMatchPages, flipPage, timeout)
            }

        } catch (error) {
            message.reply('An unknown error has occurred. Please try again later.')
            throw error;
        }
    }
}
