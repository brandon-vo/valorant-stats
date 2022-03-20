const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { buttons } = require('../components/buttons.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display commands to the user'),

    async execute(interaction) {

        const helpEmbed = new MessageEmbed()
            .setColor("RANDOM")
            .setFooter({ text: 'Developed by CMDRVo' })
            .addFields(
                {
                    name: "\u200B",
                    value:
                        "```md\n" +
                        "#             ValoStats Commands             #" +
                        "\n```",
                },
                { name: 'Stats', value: "```yaml\n/stats\n/unrated\n/lastmatch\n/spikerush\n/deathmatch\n/escalation\n/agent\n/weapon\n/map```", inline: true },
                { name: 'Other', value: "```yaml\n/link\n/unlink\n/linked\n/invite\n/ping\n/help```", inline: true },
                { name: '\u200b', value: "`Connect with /link USERNAME#TAG to use commands easier\n        The Original Valorant Stats Discord Bot       `", inline: false },
            )

        await interaction.reply({
            embeds: [helpEmbed],
            components: [buttons]
        });
    },
};
