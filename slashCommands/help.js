const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display website to user'),

    async execute(interaction) {

        await interaction.reply("https://valostats.netlify.app/")
    },

};
