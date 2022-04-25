const DiscordUser = require('../schemas/AccountSchema')
const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');
const { linkEmbed } = require('../components/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link a VALORANT account to your Discord ID')
        .addStringOption(option =>
            option.setName('username-tag')
                .setDescription('Your VALORANT Username and Tagline (ex: CMDRVo#CMDR)')
                .setRequired(true)),
    async execute(interaction) {

        const args = interaction.options.getString('username-tag');
        const playerID = encodeURI(args).toLowerCase();

        if (!playerID.includes('#'))
            return await interaction.reply('You have entered an invalid Valorant username and tag!');

        const accounts = await Account.find({ discordId: interaction.user.id });

        // Check if the user has a linked account and delete it
        if (accounts.length > 0) {
            await Account.deleteMany({ discordId: interaction.user.id })
        }
        // Add linked account to Discord ID
        try {
            await DiscordUser.create({
                username: interaction.user.username,
                discordId: interaction.user.id,
                valorantAccount: playerID
            })

            await interaction.reply({
                embeds: [linkEmbed(args)],
                components: [buttons]
            });
        } catch (error) {
            console.log(error)
            return await interaction.reply({
                content: 'Failed to link Valorant account to your Discord ID',
                components: [buttons]
            });
        }
    }
}