const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('linked')
        .setDescription('View your linked Valorant account'),
    async execute(interaction) {

        const accounts = await Account.find({ discordId: interaction.user.id });

        if (accounts.length > 0) {
            const ID = accounts[0].valorantAccount;
            const linkedAccount = decodeURI(ID);

            interaction.reply(`Your linked account is: \`${linkedAccount}\``);
        } else {
            interaction.reply('You do not have an account linked! Use /link USERNAME#TAG to link a Valorant account.');
        }
    },
};