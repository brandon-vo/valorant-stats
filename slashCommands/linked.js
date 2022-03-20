const Account = require('../schemas/AccountSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('linked')
        .setDescription('View your linked Valorant account'),
    async execute(interaction) {

        const accounts = await Account.find({ discordId: interaction.user.id });

        if (accounts.length > 0) {
            const ID = accounts[0].valorantAccount;
            const linkedAccount = decodeURI(ID);

            await interaction.reply({
                content: `Your linked account is: \`${linkedAccount}\``,
                components: [buttons]
            })
        } else {
            await interaction.reply({
                content: 'You do not have an account linked! Use /link USERNAME#TAG to link a Valorant account.',
                components: [buttons]
            });
        }
    },
};