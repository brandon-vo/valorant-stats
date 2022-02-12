const DiscordUser = require('../schemas/AccountSchema')
const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link a Valorant account to your Discord ID')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('Your Valorant Username and Tagline (ex: CMDRVo#CMDR)')
                .setRequired(true)),
    async execute(interaction) {

        const args = interaction.options.getString('user');
        const playerID = encodeURI(args).toLowerCase();

        if (!playerID.includes('#'))
            return interaction.reply('You have entered an invalid Valorant username and tag!');

        const accounts = await Account.find({ discordId: interaction.user.id })

        // Check if the user has a linked account and delete it
        if (accounts.length > 0)
            await Account.deleteMany({ discordId: interaction.user.id })

        // Add linked account to Discord ID
        try {
            const newUser = await DiscordUser.create({
                username: interaction.user.username,
                discordId: interaction.user.id,
                valorantAccount: playerID
            })
            interaction.reply('Successfuly linked the Valorant account `' + args + '` to your Discord ID')
        } catch (error) {
            console.log(error)
            return interaction.reply("Failed to link Valorant account to your Discord ID")
        }
    },
};