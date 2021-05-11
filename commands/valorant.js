const { MessageEmbed, Message } = require('discord.js');
const pagination = require('discord.js-pagination')
const assets = require('../assets.json')
const fs = require('fs')
const axios = require('axios').default;
const { profile, Console } = require('console');

module.exports = {
    name: "valorant",
    aliases: ['stats', 'competitive', 'comp', 'unrated', 'unranked', 'lastmatch', 'lm', 'deathmatch', 'dm', 'escalation', 'spikerush', 'agents', 'agent', 'compare'],
    description: "Get statistics for a Valorant player",
    async execute(message, args, command) {

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

        // # to %23
        var playerID = ID.replace(/#/g, "%23")

        try {

            // Check if account exists
            try {
                trackerProfile = await axios.get(`https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${playerID}`)
                trackerMatch = await axios.get(`https://api.tracker.gg/api/v2/valorant/rap-matches/riot/${playerID}`)

            } catch (error) {
                return message.reply("Please ensure the player you are viewing has logged into tracker.gg! https://tracker.gg/valorant")
            }

            const profileStats = trackerProfile.data.data.segments

            console.log(profileStats)

            for (x = 0; x < 5; x++) {
                if (profileStats[x].metadata.name === 'Competitive' && profileStats[x].type === 'playlist')
                    var compStats = profileStats[x].stats // access overall comp stats
                else if (profileStats[x].metadata.name === 'Deathmatch' && profileStats[x].type === 'playlist')
                    var dmStats = profileStats[x].stats // access overall deathmatch stats
                else if (profileStats[x].metadata.name === 'Escalation' && profileStats[x].type === 'playlist')
                    var escalationStats = profileStats[x].stats // access overall escalation stats
                else if (profileStats[x].metadata.name === 'Spike Rush' && profileStats[x].type === 'playlist')
                    var spikeRushStats = profileStats[x].stats // access overall spike rush stats
                else if (profileStats[x].metadata.name === 'Unrated' && profileStats[x].type === 'playlist')
                    var unratedStats = profileStats[x].stats // access overall unrated stats 
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle // access username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl // access valorant avatar image
            const lastMatch = trackerMatch.data.data.matches[0] // access last match info
            const lmStats = lastMatch.segments[0].stats // access last match stats for the player
            const matchID = lastMatch.attributes.id // match id

            // Set rank emojis and name
            rankEmoji = '<:unranked:839140865666318346>'
            rankName = 'Unranked'
            if (compStats) {
                rankName = compStats.rank.metadata.tierName
                rankEmoji = assets.rankEmojis[rankName].emoji
            }

            // Set agent emoji for the user
            agentEmoji = assets.agentEmojis[lastMatch.segments[0].metadata.agentName].emoji

            if (command === 'stats') {

                if (!compStats)
                    return message.reply('This player has never played a competitive game!')

                // each square represents ~8.33%
                greenSquare = Math.round(compStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                const statsEmbed1 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Competitive Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + compStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA ', value: "```yaml\n" + compStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'Rank ' + rankEmoji, value: "```grey\n" + rankName + "\n```", inline: true },
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
                        { name: 'Avg Combat Score', value: "```yaml\n" + compStats.scorePerRound.displayValue + "\n```", inline: true },
                        { name: 'Plants', value: "```yaml\n" + compStats.plants.displayValue + "\n```", inline: true },
                        { name: 'Defuses', value: "```yaml\n" + compStats.defuses.displayValue + "\n```", inline: true },
                        { name: 'Avg Econ Rating', value: "```yaml\n" + compStats.econRatingPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Aces', value: "```yaml\n" + compStats.aces.displayValue + "\n```", inline: true },
                        { name: 'First Bloods', value: "```yaml\n" + compStats.firstBloods.displayValue + "\n```", inline: true },
                        { name: 'First Deaths', value: "```yaml\n" + compStats.deathsFirst.displayValue + "\n```", inline: true },
                    )

                // Pages
                const statsPages = [
                    statsEmbed1,
                    statsEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '100000'

                pagination(message, statsPages, flipPage, timeout)

            }

            else if (command === 'unrated' || command === 'unranked') {

                if (!unratedStats)
                    return message.reply('This player has never played an unrated game!')

                console.log(unratedStats)

                // each square represents ~8.33%
                greenSquare = Math.round(unratedStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                const unratedEmbed1 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Unrated Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + unratedStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA', value: "```yaml\n" + unratedStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'KAD', value: "```yaml\n" + unratedStats.kADRatio.displayValue + "\n```", inline: true },
                        { name: 'Kills', value: "```yaml\n" + unratedStats.kills.displayValue + "\n```", inline: true },
                        { name: 'Deaths', value: "```yaml\n" + unratedStats.deaths.displayValue + "```", inline: true },
                        { name: 'Assists', value: "```yaml\n" + unratedStats.assists.displayValue + "\n```", inline: true },
                        { name: 'Most Kills', value: "```yaml\n" + unratedStats.mostKillsInMatch.displayValue + "\n```", inline: true },
                        { name: 'Playtime', value: "```yaml\n" + unratedStats.timePlayed.displayValue + "\n```", inline: true },
                        {
                            name: 'Win Rate - ' + unratedStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                                + unratedStats.matchesWon.displayValue + "   |   L: " + unratedStats.matchesLost.displayValue + "\n```", inline: false
                        },
                    )

                const unratedEmbed2 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Unrated Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'Kills/Match', value: "```yaml\n" + unratedStats.killsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Deaths/Match ', value: "```yaml\n" + unratedStats.deathsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Assists/Match', value: "```yaml\n" + unratedStats.assistsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + unratedStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'DMG/Round', value: "```yaml\n" + unratedStats.damagePerRound.displayValue + "\n```", inline: true },
                        { name: 'Avg Combat Score', value: "```yaml\n" + unratedStats.scorePerRound.displayValue + "\n```", inline: true },
                        { name: 'Plants', value: "```yaml\n" + unratedStats.plants.displayValue + "\n```", inline: true },
                        { name: 'Defuses', value: "```yaml\n" + unratedStats.defuses.displayValue + "\n```", inline: true },
                        { name: 'Avg Econ Rating', value: "```yaml\n" + unratedStats.econRatingPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Aces', value: "```yaml\n" + unratedStats.aces.displayValue + "\n```", inline: true },
                        { name: 'First Bloods', value: "```yaml\n" + unratedStats.firstBloods.displayValue + "\n```", inline: true },
                        { name: 'First Deaths', value: "```yaml\n" + unratedStats.deathsFirst.displayValue + "\n```", inline: true },
                    )

                // Pages
                const unratedPages = [
                    unratedEmbed1,
                    unratedEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '100000'

                pagination(message, unratedPages, flipPage, timeout)

            }

            else if (command === 'spikerush') {

                if (!spikeRushStats)
                    return message.reply('This player has never played a spike rush game!')

                // each square represents ~8.33%
                greenSquare = Math.round(spikeRushStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                const spikeRushEmbed1 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Spike Rush Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + spikeRushStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA', value: "```yaml\n" + spikeRushStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'KAD', value: "```yaml\n" + spikeRushStats.kADRatio.displayValue + "\n```", inline: true },
                        { name: 'Kills', value: "```yaml\n" + spikeRushStats.kills.displayValue + "\n```", inline: true },
                        { name: 'Deaths', value: "```yaml\n" + spikeRushStats.deaths.displayValue + "```", inline: true },
                        { name: 'Assists', value: "```yaml\n" + spikeRushStats.assists.displayValue + "\n```", inline: true },
                        { name: 'Most Kills', value: "```yaml\n" + spikeRushStats.mostKillsInMatch.displayValue + "\n```", inline: true },
                        { name: 'Playtime', value: "```yaml\n" + spikeRushStats.timePlayed.displayValue + "\n```", inline: true },
                        {
                            name: 'Win Rate - ' + spikeRushStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                                + spikeRushStats.matchesWon.displayValue + "   |   L: " + spikeRushStats.matchesLost.displayValue + "\n```", inline: false
                        },
                    )

                const spikeRushEmbed2 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Spike Rush Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'Kills/Match', value: "```yaml\n" + spikeRushStats.killsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Deaths/Match ', value: "```yaml\n" + spikeRushStats.deathsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Assists/Match', value: "```yaml\n" + spikeRushStats.assistsPerMatch.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + spikeRushStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'DMG/Round', value: "```yaml\n" + spikeRushStats.damagePerRound.displayValue + "\n```", inline: true },
                        { name: 'Aces', value: "```yaml\n" + spikeRushStats.aces.displayValue + "\n```", inline: true },
                        { name: 'Plants', value: "```yaml\n" + spikeRushStats.plants.displayValue + "\n```", inline: true },
                        { name: 'Defuses', value: "```yaml\n" + spikeRushStats.defuses.displayValue + "\n```", inline: true },
                        { name: '\u200B', value: "```yaml\n" + " " + "\n```", inline: true },
                        { name: 'First Bloods', value: "```yaml\n" + spikeRushStats.firstBloods.displayValue + "\n```", inline: true },
                        { name: 'First Deaths', value: "```yaml\n" + spikeRushStats.deathsFirst.displayValue + "\n```", inline: true },
                    )

                // Pages
                const spikeRushPages = [
                    spikeRushEmbed1,
                    spikeRushEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '100000'

                pagination(message, spikeRushPages, flipPage, timeout)

            }

            else if (command === 'deathmatch' || command === 'dm') {

                if (!dmStats)
                    return message.reply('This player has never played a deathmatch game!')

                // each square represents ~8.33%
                greenSquare = Math.round(dmStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                console.log(dmStats)

                const deathmatchEmbed = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Deathmatch Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + dmStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA ', value: "```yaml\n" + dmStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'KAD ', value: "```yaml\n" + dmStats.kADRatio.displayValue + "\n```", inline: true },
                        { name: 'Kills', value: "```yaml\n" + dmStats.kills.displayValue + "\n```", inline: true },
                        { name: 'Deaths', value: "```yaml\n" + dmStats.deaths.displayValue + "```", inline: true },
                        { name: 'Assists', value: "```yaml\n" + dmStats.assists.displayValue + "\n```", inline: true },
                        //{ name: 'Headshot %', value: "```yaml\n" + dmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'Playtime', value: "```yaml\n" + dmStats.timePlayed.displayValue + "\n```", inline: true },
                        {
                            name: 'Win Rate - ' + dmStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                                + dmStats.matchesWon.displayValue + "   |   L: " + dmStats.matchesLost.displayValue + "\n```", inline: false
                        },
                    )

                message.channel.send(deathmatchEmbed)

            }

            else if (command === 'escalation') {

                if (!escalationStats)
                    return message.reply('This player has never played an escalation game!')

                // each square represents ~8.33%
                greenSquare = Math.round(escalationStats.matchesWinPct.value / 8.33)
                redSquare = 12 - greenSquare

                winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare)

                const escalationEmbed = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle(`Escalation Career Stats`)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .addFields(
                        { name: 'KDR', value: "```yaml\n" + escalationStats.kDRatio.displayValue + "\n```", inline: true },
                        { name: 'KDA ', value: "```yaml\n" + escalationStats.kDARatio.displayValue + "\n```", inline: true },
                        { name: 'KAD ', value: "```yaml\n" + escalationStats.kADRatio.displayValue + "\n```", inline: true },
                        { name: 'Kills', value: "```yaml\n" + escalationStats.kills.displayValue + "\n```", inline: true },
                        { name: 'Deaths', value: "```yaml\n" + escalationStats.deaths.displayValue + "```", inline: true },
                        { name: 'Assists', value: "```yaml\n" + escalationStats.assists.displayValue + "\n```", inline: true },
                        //{ name: 'Headshot %', value: "```yaml\n" + escalationStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'Playtime', value: "```yaml\n" + escalationStats.timePlayed.displayValue + "\n```", inline: true },
                        {
                            name: 'Win Rate - ' + escalationStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                                + escalationStats.matchesWon.displayValue + "   |   L: " + escalationStats.matchesLost.displayValue + "\n```", inline: false
                        },
                    )

                message.channel.send(escalationEmbed)

            }

            else if (command === 'lastmatch' || command === 'lm') {

                try {
                    matchInfo = await axios.get(`https://api.tracker.gg/api/v2/valorant/rap-matches/${matchID}`)
                } catch (error) {
                    return message.reply("There is no match to retrieve. Please try again.")
                }

                const lastMap = lastMatch.metadata.mapName // Map name

                playerMatchInfo = [] // all players
                redTeam = [] // team a
                blueTeam = [] // team b

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

                        playerMatchInfo.push([playerName, playerAgent, playerScore, playerKills, playerDeaths, playerAssists, playerKDR])
                    }


                    playerMatchInfo.sort(function (a, b) { return b[3] - a[3] }) // Sort players by kills

                    var mapImage = assets.maps[lastMap].img // Set map image
                    var deathmatchEmoji = assets.modeEmojis[lastMatch.metadata.modeName].emoji

                    if (lmStats.placement.displayValue === 1)
                        lmStats.placement.displayValue = '1st'
                    else if (lmStats.placement.displayValue === 2)
                        lmStats.placement.displayValue = '2nd'
                    else if (lmStats.placement.displayValue === 3)
                        lmStats.placement.displayValue = '3rd'
                    else
                        lmStats.placement.displayValue = lmStats.placement.displayValue + 'th'

                    console.log(lmStats)

                    const deathmatchEmbed = new MessageEmbed()
                        .setColor('#11806A')
                        .setTitle('Last Match Stats - ' + lastMap + " " + deathmatchEmoji)
                        .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                        .setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                        .setDescription("`" + lastMatch.metadata.timestamp + "`")
                        .setDescription("```\n     " + lastMatch.metadata.modeName + " - " + lmStats.playtime.displayValue + "\n```")
                        .setImage(mapImage)
                        .setFooter("You placed " + lmStats.placement.displayValue)

                    var count = 0

                    for (x = 0; x < playerMatchInfo.length; x++) {

                        let name = playerMatchInfo[x][0]
                        let agent = playerMatchInfo[x][1]
                        let score = playerMatchInfo[x][2]
                        let kills = playerMatchInfo[x][3]
                        let deaths = playerMatchInfo[x][4]
                        let assists = playerMatchInfo[x][5]

                        var username = name.split('#', 2) // username without tag

                        var playerAgentEmoji = assets.agentEmojis[agent].emoji

                        count++

                        deathmatchEmbed.addFields(
                            { name: username[0] + playerAgentEmoji, value: "```yaml\nPts: " + score + "     \n" + kills + " / " + deaths + " / " + assists + "\n```", inline: true },
                        )

                        // For 2 column formatting
                        if (count == 2) {
                            deathmatchEmbed.addField('\u200B', '\u200B', true)
                            count = 0
                        }
                    }

                    return message.channel.send(deathmatchEmbed)
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
                    if (playerMatchInfo[x][8] === 'Red')
                        redTeam.push(playerMatchInfo[x])
                    if (playerMatchInfo[x][8] === 'Blue')
                        blueTeam.push(playerMatchInfo[x])
                }

                // Text format
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

                if (lastMatch.metadata.modeName === 'Normal')
                    lastMatch.metadata.modeName = 'Unrated'

                // Score
                greenSquare = Math.round(lmStats.roundsWon.displayValue)
                redSquare = Math.round(lmStats.roundsLost.displayValue)
                scoreVisualized = "<:greenline:839562756930797598>".repeat(greenSquare) + "\n" + "<:redline:839562438760071298>".repeat(redSquare)

                redTeam.sort(function (a, b) { return b[7] - a[7] }) // Sort team players by ACS
                blueTeam.sort(function (a, b) { return b[7] - a[7] }) // Sort team players by ACS

                var time = lastMatch.metadata.timestamp
                var timeStamp = time.split('T', 2) // get date of match

                var modeEmoji = assets.modeEmojis[lastMatch.metadata.modeName].emoji

                const lastMatchEmbed1 = new MessageEmbed()

                console.log(lmStats)

                // Competitive game embed
                if (lastMatch.metadata.modeName === 'Competitive') {
                    lastMatchEmbed1.setColor('#11806A')
                    lastMatchEmbed1.setTitle('Last Match Stats - ' + lastMap)
                    lastMatchEmbed1.setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
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
                        { name: 'Combat Score', value: "```yaml\n" + lmStats.score.displayValue + "\n```", inline: true },
                        { name: 'ACS', value: "```yaml\n" + lmStats.scorePerRound.displayValue + "\n```", inline: true },
                        { name: 'Econ Rating', value: "```yaml\n" + lmStats.econRating.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + lmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'First Bloods', value: "```yaml\n" + lmStats.firstBloods.displayValue + "\n```", inline: true },
                        { name: 'Score', value: scoreVisualized + "```yaml\n             " + lmStats.roundsWon.displayValue + " - " + lmStats.roundsLost.displayValue + "\n```", inline: false },
                    )
                    lastMatchEmbed1.setImage(mapImage)
                }

                // Other gamemode embeds
                else {
                    lastMatchEmbed1.setColor('#11806A')
                    lastMatchEmbed1.setTitle('Last Match Stats - ' + lastMap)
                    lastMatchEmbed1.setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    lastMatchEmbed1.setThumbnail(lastMatch.segments[0].metadata.agentImageUrl)
                    lastMatchEmbed1.setDescription("`" + lastMatch.metadata.timestamp + "`")
                    lastMatchEmbed1.addFields(
                        { name: 'Mode ' + modeEmoji, value: "```yaml\n" + lastMatch.metadata.modeName + "\n```", inline: true },
                        { name: 'Length', value: "```yaml\n" + lmStats.playtime.displayValue + "\n```", inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                        { name: 'K / D / A', value: "```yaml\n" + lmStats.kills.displayValue + "/" + lmStats.deaths.displayValue + "/" + lmStats.assists.displayValue + "\n```", inline: true },
                        { name: 'KDR', value: "```yaml\n" + lmStats.kdRatio.displayValue + "\n```", inline: true },
                        { name: 'ACS', value: "```yaml\n" + lmStats.scorePerRound.displayValue + "\n```", inline: true },
                        { name: 'Econ Rating', value: "```yaml\n" + lmStats.econRating.displayValue + "\n```", inline: true },
                        { name: 'Headshot %', value: "```yaml\n" + lmStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                        { name: 'Score', value: scoreVisualized + "```yaml\n             " + lmStats.roundsWon.displayValue + " - " + lmStats.roundsLost.displayValue + "\n```", inline: false },
                    )
                    lastMatchEmbed1.setImage(mapImage)
                }

                const lastMatchEmbed2 = new MessageEmbed()
                    .setColor('#11806A')
                    .setTitle('Last Match Stats - ' + lastMap + " | " + lmStats.roundsWon.displayValue + " - " + lmStats.roundsLost.displayValue)
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setDescription('```\n                Players in your game\n```')

                var count = 0

                for (x = 0; x < playerMatchInfo.length / 2; x++) {

                    let nameA = blueTeam[x][0]
                    let agentA = blueTeam[x][1]
                    let rankA = blueTeam[x][2]
                    let killsA = blueTeam[x][3]
                    let deathsA = blueTeam[x][4]
                    let assistsA = blueTeam[x][5]
                    let kdrA = blueTeam[x][6]
                    let acsA = blueTeam[x][7]

                    let nameB = redTeam[x][0]
                    let agentB = redTeam[x][1]
                    let rankB = redTeam[x][2]
                    let killsB = redTeam[x][3]
                    let deathsB = redTeam[x][4]
                    let assistsB = redTeam[x][5]
                    let kdrB = redTeam[x][6]
                    let acsB = redTeam[x][7]

                    var playerAgentEmojiA = assets.agentEmojis[agentA].emoji
                    var playerRankEmojiA = assets.rankEmojis[rankA].emoji

                    var playerAgentEmojiB = assets.agentEmojis[agentB].emoji
                    var playerRankEmojiB = assets.rankEmojis[rankB].emoji

                    count++

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
                        count = 0
                    }
                }

                // Pages
                const lastMatchPages = [
                    lastMatchEmbed1,
                    lastMatchEmbed2
                ]

                const flipPage = ["⬅️", "➡️"]

                const timeout = '100000'

                pagination(message, lastMatchPages, flipPage, timeout)
            }

            else if (command === 'agents' || command === 'agent') {

                if (!compStats)
                    return message.reply('There are no agents to track. This player has never played a competitive game!')

                agentInfo = []
                // get all agents the player played
                for (x = 0; x < profileStats.length; x++ && profileStats.type === 'agent') {
                    if (profileStats[x].type === 'agent') {
                        agentInfo.push([profileStats[x].metadata.name, profileStats[x].stats.timePlayed.value, profileStats[x].stats.timePlayed.displayValue,
                        profileStats[x].stats.kills.displayValue, profileStats[x].stats.deaths.displayValue, profileStats[x].stats.assists.displayValue,
                        profileStats[x].stats.kDRatio.displayValue, profileStats[x].stats.damagePerRound.displayValue, profileStats[x].stats.matchesWinPct.displayValue])
                    }
                }

                agentInfo.sort(function (a, b) { return b[1] - a[1] }) // Sort agents by playtime

                agentLength = agentInfo.length
                if (agentLength > 5)
                    agentLength = 5

                const agentEmbed = new MessageEmbed()
                    .setColor('#11806A')
                    .setAuthor(`${userHandle}`, userAvatar, `https://tracker.gg/valorant/profile/riot/${playerID}/overview`)
                    .setThumbnail(userAvatar)
                    .setDescription("```grey\n      " + "      Top " + agentLength + " - Agents Played" + "\n```")
                    .setFooter('Competitive Agents Only')

                for (i = 0; i < agentLength; i++) {

                    let agentName = agentInfo[i][0]
                    let timePlayed = agentInfo[i][2]
                    let kills = agentInfo[i][3]
                    let deaths = agentInfo[i][4]
                    let assists = agentInfo[i][5]
                    let kdr = agentInfo[i][6]
                    let dmg = agentInfo[i][7]
                    let winRate = agentInfo[i][8]

                    var agentEmoji = assets.agentEmojis[agentName].emoji

                    agentEmbed.addFields(
                        {
                            name: agentName + " " + agentEmoji + "     |     " + timePlayed + "     |     Win Rate: " + parseInt(winRate).toFixed(0) + "%", value: "```yaml\nK:" +
                                kills + " / D:" + deaths + " / A:" + assists + " / R:" + parseFloat(kdr).toFixed(2) + " | DMG/R: " + parseInt(dmg).toFixed(0) + "\n```", inline: false
                        },
                    )
                }

                message.channel.send(agentEmbed)

            }

            else if (command === 'compare') {

                message.reply('Who would you like to compare ' + ID + ' to?')

            }

        } catch (error) {
            message.reply('An unknown error has occurred. Please try again later.')
            throw error;
        }
    }
}
