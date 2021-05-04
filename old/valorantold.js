const { MessageEmbed, Message } = require('discord.js');
const fetch = require('node-fetch')
const pagination = require('discord.js-pagination')
const assets = require('../assets.json')
const link = require('../accounts.json')
const fs = require('fs')

module.exports = {
    name: "valorant",
    aliases: ['stats', 'last20', 'l20', 'lastmatch', 'lm'],
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
            return message.reply('Please include your Valorant username and tag (USERNAME-TAG)')

        // Convert characters to lowercase
        var ID = str.toLowerCase();

        try {

            // Check if account exists
            try {
                playerLink = `https://valorant.iesdev.com/player/${ID}`
                playerData = await fetch(playerLink)
                playerData = await playerData.json()


                const subjectID = playerData.subject;

                matchLink = `https://valorant.iesdev.com/matches/${subjectID}?offset=0&queue=`
                matchData = await fetch(matchLink)
                matchData = await matchData.json()
            } catch (error) {
                message.reply("Please ensure the player you are viewing has the Blitz application installed! https://blitz.gg/")
                return
            }

            const username = playerData.name;
            const careerPath = playerData.stats.overall.career;
            const last20Path = playerData.stats.overall.last20;
            const lastMatch = matchData.data[0];

            // Rank name and image
            const rankNum = playerData.rank
            const rankName = assets.ranks[rankNum].name
            const rankImage = assets.ranks[rankNum].img

            if (command === 'stats') {

                const statsEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Career Stats - ${username}`)
                    .setURL(`https://blitz.gg/valorant/profile/${str}`)
                    .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp', `https://blitz.gg/valorant/profile/${str}`)
                    .setThumbnail(rankImage)
                    .addFields(
                        { name: 'KDR :dart:', value: "`" + (parseInt(careerPath.kills) / parseInt(careerPath.deaths)).toFixed(2) + "`", inline: true },
                        { name: 'Playtime :clock4:', value: "`" + (careerPath.playtimeMillis / 3600000).toFixed(1) + " hours" + "`", inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                        { name: 'Kills :fire:', value: "`" + careerPath.kills + "`", inline: true },
                        { name: 'Deaths :skull_crossbones:', value: "`" + careerPath.deaths + "`", inline: true },
                        { name: 'Assists :boom:', value: "`" + careerPath.assists + "`", inline: true },
                        { name: 'Wins :trophy:', value: "`" + careerPath.wins + "`", inline: true },
                        { name: 'Losses :x:', value: "`" + (careerPath.matches - careerPath.wins - careerPath.ties) + "`", inline: true },
                        { name: 'Ties :ticket:', value: "`" + careerPath.ties + "`", inline: true },
                    )
                    .setFooter(rankName, rankImage);
                message.channel.send(statsEmbed);
            }

            else if (command === 'last20' || command === 'l20') {

                if (playerData.subject === null) return message.reply('There was an error retrieving your match history')

                const last20Embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Last 20 Stats - ${username}`)
                    .setURL(`https://blitz.gg/valorant/profile/${str}`)
                    .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp', `https://blitz.gg/valorant/profile/${str}`)
                    .setThumbnail(rankImage)
                    .addFields(
                        { name: 'KDR :dart:', value: "`" + (parseInt(last20Path.kills) / parseInt(last20Path.deaths)).toFixed(2) + "`" },
                        { name: 'Kills :fire:', value: "`" + last20Path.kills + "`", inline: true },
                        { name: 'Deaths :skull_crossbones:', value: "`" + last20Path.deaths + "`", inline: true },
                        { name: 'Assists :boom:', value: "`" + last20Path.assists + "`", inline: true },
                        { name: 'Wins :trophy:', value: "`" + last20Path.wins + "`", inline: true },
                        { name: 'Losses :x:', value: "`" + (last20Path.matches - last20Path.wins - last20Path.ties) + "`", inline: true },
                        { name: 'Ties :ticket:', value: "`" + last20Path.ties + "`", inline: true },
                    )
                    .setFooter(rankName, rankImage);
                message.channel.send(last20Embed);
            }

            else if (command === 'lastmatch' || command === 'lm') {

                if (playerData.subject === null) return message.reply('There was an error retrieving your match history')

                // Last map
                const lastMap = lastMatch.map
                lastMatch.map = assets.maps[lastMap].name

                // Define gamemodes
                if (lastMatch.mode === 'bomb')
                    if (lastMatch.ranked === false)
                        if (lastMatch.queue === 'unrated' || lastMatch.queue === 'newmap')
                            lastMatch.mode = 'Unrated'
                        else
                            lastMatch.mode = 'Custom'
                    else
                        lastMatch.mode = 'Competitive'

                if (lastMatch.mode === 'quickbomb')
                    lastMatch.mode = 'Spike Rush'

                if (lastMatch.mode === 'deathmatch')
                    lastMatch.mode = 'Deathmatch'

                if (lastMatch.mode === 'gungame')
                    lastMatch.mode = 'Escalation'


                // Store info for each player in the last match
                playerMatchInfo = []
                redTeam = []
                blueTeam = []

                // Get all people in the last match 
                for (x = 0; x < lastMatch.players.length; x++) {

                    lastMatchPlayer = lastMatch.players[x]

                    playerMatchInfo.push([lastMatchPlayer.gameName, lastMatchPlayer.teamId, lastMatchPlayer.stats.kills, lastMatchPlayer.stats.deaths, lastMatchPlayer.stats.assists, lastMatchPlayer.characterId])

                    const lastAgent = lastMatchPlayer.characterId
                    const lastAgentName = assets.agents[lastAgent].name

                    // Set agent played for each player in the last match
                    playerMatchInfo[x][5] = lastAgentName

                    // Get users stats and information
                    if (playerMatchInfo[x][0] === username) {
                        playerTeam = lastMatchPlayer.teamId // For standard games, this will give either blue or red
                        playerKills = lastMatchPlayer.stats.kills // Get players kills
                        playerDeaths = lastMatchPlayer.stats.deaths // Get players deaths 
                        playerAssists = lastMatchPlayer.stats.assists // Get players assists
                        playerScore = lastMatchPlayer.stats.score // Get players score

                        agentImage = assets.agents[lastAgent].img // Set thumbnail image

                    }

                    if (playerMatchInfo[x][1] === 'Red')
                        redTeam.push([playerMatchInfo[x][0], playerMatchInfo[x][1], playerMatchInfo[x][2], playerMatchInfo[x][3], playerMatchInfo[x][4], playerMatchInfo[x][5]])

                    if (playerMatchInfo[x][1] === 'Blue')
                        blueTeam.push([playerMatchInfo[x][0], playerMatchInfo[x][1], playerMatchInfo[x][2], playerMatchInfo[x][3], playerMatchInfo[x][4], playerMatchInfo[x][5]])
                }

                // Sort red and blue teams into one array with alternating team colours
                if (lastMatch.mode === 'Competitive' || lastMatch.mode === 'Unrated' || lastMatch.mode === 'Custom' || lastMatch.mode === 'Spike Rush' || lastMatch.mode === 'Escalation') {

                    playerMatchInfoSorted = []
                    for (x = 0; x < playerMatchInfo.length / 2; x++)
                        playerMatchInfoSorted.push(redTeam[x], blueTeam[x])

                    playerMatchInfo = []
                    playerMatchInfo = playerMatchInfoSorted
                }

                // For deathmatch games
                if (lastMatch.mode === 'Deathmatch') {
                    scoreResult = playerScore // Use player score instead of score results if the game is deathmatch
                    for (x = 0; x < lastMatch.teams.length; x++)
                        if (lastMatch.teams[x].teamId === playerTeam)
                            deathmatchResults = lastMatch.players[x].won // Result is either true or false
                    if (deathmatchResults === true)
                        var mapImage = assets.maps[lastMap].imgWon
                    else
                        var mapImage = assets.maps[lastMap].imgLost
                }


                // Set rounds won by both teams
                redTeamRoundsWon = lastMatch.teams[0].roundsWon
                blueTeamRoundsWon = lastMatch.teams[1].roundsWon

                // Determine which team won
                if (playerTeam === 'Red') { // Player is on red team

                    var scoreResult = redTeamRoundsWon + " - " + blueTeamRoundsWon // Format score

                    if (lastMatch.teams[0].won === true) {
                        var mapImage = assets.maps[lastMap].imgWon
                    } else if (lastMatch.teams[0].won === false) {
                        var mapImage = assets.maps[lastMap].imgLost
                    } else {
                        var mapImage = assets.maps[lastMap].imgDraw
                    }
                }

                if (playerTeam === 'Blue') { // Player is on blue team

                    var scoreResult = blueTeamRoundsWon + " - " + redTeamRoundsWon // Format score

                    if (lastMatch.teams[1].won === true) {
                        var mapImage = assets.maps[lastMap].imgWon
                    } else if (lastMatch.teams[1].won === false) {
                        var mapImage = assets.maps[lastMap].imgLost
                    } else {
                        var mapImage = assets.maps[lastMap].imgDraw
                    }
                }

                const lastMatchEmbed1 = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Last Match Stats - ${username}`)
                    .setURL(`https://blitz.gg/valorant/profile/${str}`)
                    .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp', `https://blitz.gg/valorant/profile/${str}`)
                    .setThumbnail(agentImage)
                    .addFields(
                        { name: 'Map :map:', value: "`" + lastMatch.map + "`", inline: true },
                        { name: 'Mode :gear:', value: "`" + lastMatch.mode + "`", inline: true },
                        { name: 'Length :timer:', value: "`" + (lastMatch.length / 60000).toFixed(1) + ' minutes' + "`", inline: true },
                        { name: 'Score :bar_chart:', value: "`" + scoreResult + "`", inline: true },
                        { name: 'KDR :dart:', value: "`" + (playerKills / playerDeaths).toFixed(2) + "`", inline: true },
                        { name: 'Rank: :medal: ', value: "`" + rankName + "`", inline: true },
                        { name: 'Kills :fire:', value: "`" + playerKills + "`", inline: true },
                        { name: 'Deaths :skull_crossbones:', value: "`" + playerDeaths + "`", inline: true },
                        { name: 'Assists :boom:', value: "`" + playerAssists + "`", inline: true },
                    )
                    .setTimestamp()
                    .setImage(mapImage)
                    .setFooter(rankName, rankImage)

                const lastMatchEmbed2 = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Last Match Stats - ${username}`)
                    .setURL(`https://blitz.gg/valorant/profile/${str}`)
                    .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp', `https://blitz.gg/valorant/profile/${str}`)
                    .setDescription(':grey_exclamation: Players in your game')

                var count = 0

                for (x = 0; x < lastMatch.players.length; x++) {

                    if (playerMatchInfo[x][1] === 'Red')
                        teamColour = ':red_circle:'

                    if (playerMatchInfo[x][1] === 'Blue')
                        teamColour = ':blue_circle:'

                    let name = playerMatchInfo[x][0]
                    let kills = playerMatchInfo[x][2]
                    let deaths = playerMatchInfo[x][3]
                    let assists = playerMatchInfo[x][4]
                    let agent = playerMatchInfo[x][5]

                    count++

                    lastMatchEmbed2.addFields(
                        { name: name + " " + teamColour, value: "`K / D / A / R\n" + kills + " / " + deaths + " / " + assists + " / " + (kills / deaths).toFixed(1) + "\nAgent: " + agent + "`", inline: true },
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