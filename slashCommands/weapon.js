const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons, helpButtons } = require('../components/buttons');
const { noAccountEmbed, maintenanceEmbed, errorEmbed } = require('../components/embeds');
const Account = require('../schemas/AccountSchema');
const { getWeapon, getProfile } = require('../api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weapon')
        .setDescription('Get top 5 weapon stats for a Valorant user')
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
            trackerWeapon = await getWeapon(playerID);
            switch (trackerWeapon) {
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
                    weaponStats = trackerWeapon.data.data; // Weapon stats
                    break;
            }

            const userHandle = trackerProfile.data.data.platformInfo.platformUserHandle; // Username and tag
            const userAvatar = trackerProfile.data.data.platformInfo.avatarUrl; // Avatar image

            const author = {
                name: `${userHandle}`,
                iconURL: userAvatar,
                url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`
            };

            topWeapons = []

            for (let x = 0; x < weaponStats.length; x++) {
                weaponName = weaponStats[x].metadata.name
                weaponKills = weaponStats[x].stats.kills.displayValue
                weaponKillsValue = weaponStats[x].stats.kills.value
                weaponDeathsBy = weaponStats[x].stats.deaths.displayValue
                weaponHeadshotPct = weaponStats[x].stats.headshotsPercentage.displayValue
                weaponDamageRound = weaponStats[x].stats.damagePerRound.displayValue
                weaponFirstBloodCount = weaponStats[x].stats.firstBloods.displayValue
                weaponLongestKillDistance = weaponStats[x].stats.longestKillDistance.value

                topWeapons.push([weaponName, weaponKills, weaponKillsValue, weaponDeathsBy, weaponHeadshotPct,
                    weaponDamageRound, weaponFirstBloodCount, weaponLongestKillDistance]);
            }

            topWeapons.sort(function (a, b) { return b[2] - a[2] }); // Sort weapons by kills

            // Top 5 weapons only
            weaponLength = topWeapons.length;
            if (weaponLength > 5) {
                weaponLength = 5;
            }

            const weaponEmbed = new MessageEmbed()
                .setColor('#11806A')
                .setAuthor(author)
                .setThumbnail(userAvatar)
                .setDescription("```grey\n      " + "      Top " + weaponLength + " - Weapon Stats" + "\n```")
                .setFooter({ text: 'Competitive Weapons Only' })

            for (let i = 0; i < weaponLength; i++) {

                let weaponName = topWeapons[i][0]
                let weaponKills = topWeapons[i][1]
                let weaponDeathsBy = topWeapons[i][3]
                let weaponHeadshot = topWeapons[i][4]
                let weaponDamage = topWeapons[i][5]
                let weaponFirstBlood = topWeapons[i][6]
                let weaponKillDistance = topWeapons[i][7]

                weaponEmbed.addFields(
                    {
                        name: weaponName + "     |     First Bloods: " + weaponFirstBlood + "     |     "
                            + "Longest Kill Dist: " + parseInt(weaponKillDistance / 100).toFixed(0) + " m",
                        value: "```yaml\nK:" + weaponKills + " / D:" + weaponDeathsBy + " | HS: "
                            + weaponHeadshot + " | DMG/R: " + weaponDamage + "\n```", inline: false
                    },
                )
            }

            await interaction.reply({
                embeds: [weaponEmbed],
                components: [buttons]
            });
        })()
    }
}