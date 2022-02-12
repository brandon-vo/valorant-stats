const DiscordUser = require('../schemas/AccountSchema');
const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink a Valorant account from your Discord ID'),
    async execute(interaction) {

        const accounts = await Account.find({ discordId: interaction.user.id })

        // // Check if the user has a linked account and delete it
        if (accounts.length > 0)
            await Account.deleteMany({ discordId: interaction.user.id })

        // Remove linked account from Discord ID
        try {
            const newUser = await DiscordUser.deleteOne({
                username: interaction.user.username,
                discordId: interaction.user.id,
                valorantAccount: null
            })
            interaction.reply('Successfuly unlinked the Valorant account from your Discord ID');
        } catch (error) {
            console.error(error);
            return interaction.reply("Failed to unlink the Valorant account from your Discord ID");
        }
    },
};