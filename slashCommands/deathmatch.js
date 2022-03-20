const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deathmatch')
        .setDescription('Get overall deathmatch stats for a Valorant user')
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
                    embeds: [noAccountEmbed],
                    components: [buttons]
                });
            }
        }

        const playerID = encodeURIComponent(args);

        (async () => {
            trackerProfile = await getProfile(playerID);
            switch (trackerProfile) {
                case '403_error':
                    return await interaction.reply({ embeds: [maintenanceEmbed], components: [buttons] });
                case 'default_error':
                    return await interaction.reply({ embeds: [errorEmbed], components: [buttons] });
                default:
                    profileStats = trackerProfile.data.data.segments;
                    break;
            }

            // // Checking users playlist stats
            for (let x = 0; x < profileStats.length; x++) {
                if (profileStats[x].metadata.name === 'Deathmatch' && profileStats[x].type === 'playlist')
                    var deathmatchStats = profileStats[x].stats; // Access overall deathmatch stats
            }

            if (!deathmatchStats) {
                return await interaction.reply({
                    embeds: [noStatsEmbed],
                    components: [buttons]
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
            greenSquare = Math.round(deathmatchStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const deathmatchEmbed = (new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Deathmatch Career Stats`)
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: 'KDR', value: "```yaml\n" + deathmatchStats.kDRatio.displayValue + "\n```", inline: true },
                    { name: 'KDA ', value: "```yaml\n" + deathmatchStats.kDARatio.displayValue + "\n```", inline: true },
                    { name: 'KAD ', value: "```yaml\n" + deathmatchStats.kADRatio.displayValue + "\n```", inline: true },
                    { name: 'Kills', value: "```yaml\n" + deathmatchStats.kills.displayValue + "\n```", inline: true },
                    { name: 'Deaths', value: "```yaml\n" + deathmatchStats.deaths.displayValue + "```", inline: true },
                    { name: 'Assists', value: "```yaml\n" + deathmatchStats.assists.displayValue + "\n```", inline: true },
                    //{ name: 'Headshot %', value: "```yaml\n" + deathmatchStats.headshotsPercentage.displayValue + "\n```", inline: true },
                    { name: 'Playtime', value: "```yaml\n" + deathmatchStats.timePlayed.displayValue + "\n```", inline: true },
                    {
                        name: 'Win Rate - ' + deathmatchStats.matchesWinPct.displayValue, value: winRate + " ```yaml\n" + "    W: "
                            + deathmatchStats.matchesWon.displayValue + "   |   L: " + deathmatchStats.matchesLost.displayValue + "\n```", inline: false
                    },
                )
            )

            return await interaction.reply({
                embeds: [deathmatchEmbed],
                components: [buttons]
            });
        })()
    }
}