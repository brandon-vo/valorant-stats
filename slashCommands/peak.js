const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const assets = require('../assets.json');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('peak')
        .setDescription('Get the peak rating of a VALORANT user')
        .addStringOption(option =>
            option.setName('username-tag')
                .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
                .setRequired(false)),
    async execute(interaction) {

        let args = interaction.options.getString('username-tag');
        let account = await Account.find({ discordId: interaction.user.id });
        if (account.length < 1) {
            return await interaction.reply({
                embeds: [noAccountEmbed],
                components: [buttons],
                ephemeral: true
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

            // Set rank emojis and name
            let rankName = '';
            let rankEmoji = '';
            if (compStats) {
                rankName = compStats.peakRank.metadata.tierName;
                rankEmoji = assets.rankEmojis[rankName].emoji;
                if (rankName.includes('Immortal') || rankName.includes('Radiant')) {
                    rankName = rankName + ' ' + (compStats.peakRank.value ? compStats.peakRank.value + ' RR' : '');
                }
            }

            const peakEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setAuthor(author)
                .setThumbnail(compStats.peakRank.metadata.iconUrl)
                .addFields(
                    {
                        name: compStats.peakRank.displayName + ' - ' + compStats.peakRank.metadata.actName + ' ' + rankEmoji,
                        value: "```\n" + rankName + "\n```", inline: true
                    },
                )
                .setFooter({text: 'According to Tracker.gg'})

            return await interaction.reply({
                embeds: [peakEmbed],
                components: [buttons]
            });
        })()
    }
}