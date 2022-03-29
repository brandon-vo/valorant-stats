const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('replication')
        .setDescription('Get overall replication stats for a Valorant user')
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
                if (profileStats[x].metadata.name === 'Replication' && profileStats[x].type === 'playlist')
                    var replicationStats = profileStats[x].stats; // Access overall replication stats
            }

            if (!replicationStats) {
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

            // Each square represents ~8.33%
            greenSquare = Math.round(replicationStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const replicationEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Replication Career Stats`)
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: 'KDR', value: "```yaml\n" + replicationStats.kDRatio.displayValue + "\n```", inline: true },
                    { name: 'KDA ', value: "```yaml\n" + replicationStats.kDARatio.displayValue + "\n```", inline: true },
                    { name: 'KAD ', value: "```yaml\n" + replicationStats.kADRatio.displayValue + "\n```", inline: true },
                    { name: 'Kills', value: "```yaml\n" + replicationStats.kills.displayValue + "\n```", inline: true },
                    { name: 'Deaths', value: "```yaml\n" + replicationStats.deaths.displayValue + "```", inline: true },
                    { name: 'Assists', value: "```yaml\n" + replicationStats.assists.displayValue + "\n```", inline: true },
                    { name: 'Headshot %', value: "```yaml\n" + replicationStats.headshotsPercentage.displayValue + "\n```", inline: true },
                    { name: 'Playtime', value: "```yaml\n" + replicationStats.timePlayed.displayValue + "\n```", inline: true },
                    {
                        name: 'Win Rate - ' + replicationStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                            + replicationStats.matchesWon.displayValue + "   |   L: " + replicationStats.matchesLost.displayValue + "\n```", inline: false
                    },
                )

            return await interaction.reply({
                embeds: [replicationEmbed],
                components: [buttons]
            });
        })()
    }
}