const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { getRow, editGetRow, timeout } = require('../components/pages');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spikerush')
        .setDescription('Get overall spike rush stats for a Valorant user')
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
                if (profileStats[x].metadata.name === 'Spike Rush' && profileStats[x].type === 'playlist')
                    var spikeRushStats = profileStats[x].stats; // Access overall spike rush stats
            }

            if (!spikeRushStats) {
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
            greenSquare = Math.round(spikeRushStats.matchesWinPct.value / 8.33);
            redSquare = 12 - greenSquare;

            // Setting the win rate visual bar
            winRate = "<:greenline:839562756930797598>".repeat(greenSquare) + "<:redline:839562438760071298>".repeat(redSquare);

            const embeds = [];
            const pages = {};

            // Embed page 1
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Spike Rush Career Stats`)
                .setAuthor(author)
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
            )

            // Embed page 2
            embeds.push(new MessageEmbed()
                .setColor('#11806A')
                .setTitle(`Spike Rush Career Stats`)
                .setAuthor(author)
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