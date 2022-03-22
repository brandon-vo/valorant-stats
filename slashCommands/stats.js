const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { getRow, editGetRow, timeout } = require('../components/pages');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const assets = require('../assets.json');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get overall competitive stats for a Valorant user')
        .addStringOption(option =>
            option.setName('username-tag')
                .setDescription('Your Valorant Username and Tagline (ex: CMDRVo#CMDR)')
                .setRequired(false)),
    async execute(interaction) {

        let args = interaction.options.getString('username-tag');
        let account = await Account.find({ discordId: interaction.user.id });
        if (account.length < 1) {
            return await interaction.reply({
                embeds: [noAccountEmbed],
                components: [buttons]
            });
        }

        if (!args) {
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
                if (profileStats[x].metadata.name === 'Competitive' && profileStats[x].type === 'playlist')
                    var compStats = profileStats[x].stats;
            }

            if (!compStats) {
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

            // Set rank emojis and name
            let rankName = '';
            let rankEmoji = '';
            if (compStats) {
                rankName = compStats.rank.metadata.tierName;
                rankEmoji = assets.rankEmojis[rankName].emoji;
                if (rankName.includes('Immortal') || rankName.includes('Radiant')) {
                    rankName = rankName + ' #' + (compStats.rank.rank ? compStats.rank.rank : '') + '\n' + compStats.rank.value + ' RR';
                }
            }

            // Each square represents ~8.33%
            greenSquare = Math.round(compStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const embeds = [];
            const pages = {};

            // Embed page 1
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Competitive Career Stats`)
                .setAuthor(author)
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
            )

            // Embed page 2
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Competitive Career Stats`)
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: 'Kills/Match', value: "```yaml\n" + compStats.killsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Deaths/Match ', value: "```yaml\n" + compStats.deathsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Assists/Match', value: "```yaml\n" + compStats.assistsPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Headshot %', value: "```yaml\n" + compStats.headshotsPercentage.displayValue + "\n```", inline: true },
                    { name: 'DMG/Round', value: "```yaml\n" + compStats.damagePerRound.displayValue + "\n```", inline: true },
                    { name: 'Avg Combat Score', value: "```yaml\n" + compStats.scorePerRound.displayValue + "\n```", inline: true },
                    { name: 'Plants', value: "```yaml\n" + compStats.plants.displayValue + "\n```", inline: true },
                    { name: 'Defuses', value: "```yaml\n" + compStats.defuses.displayValue + "\n```", inline: true },
                    { name: 'Avg Econ Rating', value: "```yaml\n" + compStats.econRatingPerMatch.displayValue + "\n```", inline: true },
                    { name: 'Aces', value: "```yaml\n" + compStats.aces.displayValue + "\n```", inline: true },
                    { name: 'First Bloods', value: "```yaml\n" + compStats.firstBloods.displayValue + "\n```", inline: true },
                    { name: 'First Deaths', value: "```yaml\n" + compStats.deathsFirst.displayValue + "\n```", inline: true },
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
                    components: [buttons]
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