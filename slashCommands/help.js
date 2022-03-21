const { SlashCommandBuilder } = require('@discordjs/builders');
const { helpButtons } = require('../components/buttons.js');
const { helpEmbed } = require('../components/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display commands to the user'),

    async execute(interaction) {

        await interaction.reply({
            embeds: [helpEmbed],
            components: [helpButtons]
        });
    },
};
