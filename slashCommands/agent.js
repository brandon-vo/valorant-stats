const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const assets = require('../assets.json');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agent')
        .setDescription('Get top 5 agent stats for a Valorant user')
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
            switch (trackerProfile) {
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
                    profileStats = trackerProfile.data.data.segments;
                    break;
            }


            // // Checking users playlist stats
            for (let x = 0; x < profileStats.length; x++) {
                if (profileStats[x].metadata.name === 'Competitive' && profileStats[x].type === 'playlist')
                    var compStats = profileStats[x].stats;
            }

            if (!compStats) {
                return await interaction.reply({
                    embeds: [noStatsEmbed],
                    components: [buttons],
                    ephemeral: true
                });
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle; // Username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl; // Avatar image

            const author = {
                name: `${userHandle}`,
                iconURL: userAvatar,
                url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`
            };

            agentInfo = []
            // Get all agents the player played
            for (let x = 0; x < profileStats.length; x++ && profileStats.type === 'agent') {
                if (profileStats[x].type === 'agent') {
                    agentInfo.push([profileStats[x].metadata.name, profileStats[x].stats.timePlayed.value, profileStats[x].stats.timePlayed.displayValue,
                    profileStats[x].stats.kills.displayValue, profileStats[x].stats.deaths.displayValue, profileStats[x].stats.assists.displayValue,
                    profileStats[x].stats.kDRatio.displayValue, profileStats[x].stats.damagePerRound.displayValue, profileStats[x].stats.matchesWinPct.displayValue])
                }
            }

            agentInfo.sort(function (a, b) { return b[1] - a[1] }) // Sort agents by playtime

            // Limit maximum amount of agents to show as 5
            agentLength = agentInfo.length;
            if (agentLength > 5)
                agentLength = 5;

            const agentEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .setDescription("```grey\n      " + "      Top " + agentLength + " - Agents Played" + "\n```")
                .setFooter({ text: 'Competitive Agents Only' })

            for (let i = 0; i < agentLength; i++) {

                let agentName = agentInfo[i][0]
                let timePlayed = agentInfo[i][2]
                let kills = agentInfo[i][3]
                let deaths = agentInfo[i][4]
                let assists = agentInfo[i][5]
                let kdr = agentInfo[i][6]
                let dmg = agentInfo[i][7]
                let winRate = agentInfo[i][8]

                var agentEmoji = ":white_small_square:"

                let availableAgentEmojis = [
                    'Astra', 'Breach', 'Brimstone', 'Cypher',
                    'Jett', 'Killjoy', 'Omen', 'Phoenix', 'Raze', 'Reyna',
                    'Sage', 'Skye', 'Sova', 'Viper', 'Yoru', 'KAY/O',
                    'Chamber', 'Neon'
                ]
                if (availableAgentEmojis.includes(agentName)) {
                    var agentEmoji = assets.agentEmojis[agentName].emoji
                }

                agentEmbed.addFields(
                    {
                        name: agentName + " " + agentEmoji + "     |     " + timePlayed
                            + "     |     Win Rate: " + parseInt(winRate).toFixed(0) + "%", value: "```yaml\nK:" +
                                kills + " / D:" + deaths + " / A:" + assists + " / R:" + parseFloat(kdr).toFixed(2)
                                + " | DMG/R: " + parseInt(dmg).toFixed(0) + "\n```", inline: false
                    },
                )
            }

            await interaction.reply({
                embeds: [agentEmbed],
                components: [buttons]
            })
        })()
    }
}