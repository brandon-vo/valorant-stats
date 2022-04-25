const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed, noStatsEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playtime')
        .setDescription('Get the total playtime of a VALORANT user')
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
                    var compStats = profileStats[x].stats; // Access overall comp stats
                else if (profileStats[x].metadata.name === 'Deathmatch' && profileStats[x].type === 'playlist')
                    var dmStats = profileStats[x].stats // Access overall deathmatch stats
                else if (profileStats[x].metadata.name === 'Escalation' && profileStats[x].type === 'playlist')
                    var escalationStats = profileStats[x].stats; // Access overall escalation stats
                else if (profileStats[x].metadata.name === 'Spike Rush' && profileStats[x].type === 'playlist')
                    var spikeRushStats = profileStats[x].stats; // Access overall spike rush stats
                else if (profileStats[x].metadata.name === 'Unrated' && profileStats[x].type === 'playlist')
                    var unratedStats = profileStats[x].stats; // Access overall unrated stats 
                else if (profileStats[x].metadata.name === 'Replication' && profileStats[x].type === 'playlist')
                    var replicationStats = profileStats[x].stats; // Access overall replication stats
                else if (profileStats[x].metadata.name === 'Snowball Fight' && profileStats[x].type === 'playlist')
                    var snowballStats = profileStats[x].stats; // Access overall snowball fight stats
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle; // Username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl; // Avatar image

            const author = {
                name: `${userHandle}`,
                iconURL: userAvatar,
                url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`
            };

            let totalPlaytimeValue = 0;
            if (compStats)
                totalPlaytimeValue += compStats.timePlayed.value;
            if (dmStats)
                totalPlaytimeValue += dmStats.timePlayed.value;
            if (escalationStats)
                totalPlaytimeValue += escalationStats.timePlayed.value;
            if (spikeRushStats)
                totalPlaytimeValue += spikeRushStats.timePlayed.value
            if (unratedStats)
                totalPlaytimeValue += unratedStats.timePlayed.value;
            if (replicationStats)
                totalPlaytimeValue += replicationStats.timePlayed.value;
            if (snowballStats)
                totalPlaytimeValue += snowballStats.timePlayed.value;

            let playtimeHours = Math.floor(totalPlaytimeValue / (1000 * 60 * 60));
            let playtimeMinutes = Math.floor(totalPlaytimeValue / (1000 * 60)) - (playtimeHours * 60);
            let totalPlaytime = playtimeHours + 'h ' + playtimeMinutes + 'm';

            const playtimeEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .addFields({ name: 'Total Playtime', value: "```yaml\n" + `${totalPlaytime}` + "\n```" },)
                .setFooter({ text: 'All game modes' })

            return await interaction.reply({
                embeds: [playtimeEmbed],
                components: [buttons]
            });
        })()
    }
}