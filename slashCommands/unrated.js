const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { getRow, editGetRow, timeout } = require('../components/pages');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unrated')
        .setDescription('Get overall unrated stats for a VALORANT user')
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
                if (profileStats[x].metadata.name == 'Unrated' && profileStats[x].type == 'playlist')
                    var unratedStats = profileStats[x].stats; // Access overall unrated stats 
            }

            if (!unratedStats) {
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
            greenSquare = Math.round(unratedStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const embeds = [];
            const pages = {};

            // Embed page 1
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Unrated Career Stats`)
                .setAuthor(author)
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
            )

            // Embed page 2
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Unrated Career Stats`)
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: 'Kills/Match', value: "```yaml\n" + unratedStats.killsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Deaths/Match ', value: "```yaml\n" + unratedStats.deathsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Assists/Match', value: "```yaml\n" + unratedStats.assistsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Headshot %', value: "```yaml\n" + unratedStats.headshotsPercentage.displayValue + "\n```", inline: true },
                    { name: 'DMG/Round', value: "```yaml\n" + unratedStats.damagePerRound.displayValue + "\n```", inline: true },
                    { name: 'Avg Combat Score', value: "```yaml\n" + unratedStats.scorePerRound.displayValue + "\n```", inline: true },
                    { name: 'Plants', value: "```yaml\n" + unratedStats.plants.displayValue + "\n```", inline: true },
                    { name: 'Defuses', value: "```yaml\n" + unratedStats.defuses.displayValue + "\n```", inline: true },
                    { name: 'Avg Econ Rating', value: "```yaml\n" + unratedStats.econRatingPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Aces', value: "```yaml\n" + unratedStats.aces.displayValue + "\n```", inline: true },
                    { name: 'First Bloods', value: "```yaml\n" + unratedStats.firstBloods.displayValue + "\n```", inline: true },
                    { name: 'First Deaths', value: "```yaml\n" + unratedStats.deathsFirst.displayValue + "\n```", inline: true },
                )
            )

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