const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snowball')
        .setDescription('Get overall snowball fight stats for a VALORANT user')
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
                if (profileStats[x].metadata.name === 'Snowball Fight' && profileStats[x].type === 'playlist')
                    var snowballStats = profileStats[x].stats; // Access overall snowball fight stats
            }

            if (!snowballStats) {
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
            greenSquare = Math.round(snowballStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const snowballEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Snowball Fight Career Stats`)
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: 'KDR', value: "```yaml\n" + snowballStats.kDRatio.displayValue + "\n```", inline: true },
                    { name: 'KDA ', value: "```yaml\n" + snowballStats.kDARatio.displayValue + "\n```", inline: true },
                    { name: 'KAD ', value: "```yaml\n" + snowballStats.kADRatio.displayValue + "\n```", inline: true },
                    { name: 'Kills', value: "```yaml\n" + snowballStats.kills.displayValue + "\n```", inline: true },
                    { name: 'Deaths', value: "```yaml\n" + snowballStats.deaths.displayValue + "```", inline: true },
                    { name: 'Assists', value: "```yaml\n" + snowballStats.assists.displayValue + "\n```", inline: true },
                    //{ name: 'Headshot %', value: "```yaml\n" + snowballStats.headshotsPercentage.displayValue + "%\n```", inline: true },
                    { name: 'Playtime', value: "```yaml\n" + snowballStats.timePlayed.displayValue + "\n```", inline: true },
                    {
                        name: 'Win Rate - ' + snowballStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                            + snowballStats.matchesWon.displayValue + "   |   L: " + snowballStats.matchesLost.displayValue + "\n```", inline: false
                    },
                )

            return await interaction.reply({
                embeds: [snowballEmbed],
                components: [buttons]
            });
        })()
    }
}