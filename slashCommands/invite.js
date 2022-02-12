const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link to this Discord bot'),

    async execute(interaction) {

        const inviteButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Invite Bot")
                .setURL("https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=3224894528&scope=bot")
                .setStyle("LINK"),
            new MessageButton()
                .setLabel("Test Server")
                .setURL("https://discord.gg/8bY6nFaVEY")
                .setStyle("LINK"),
            new MessageButton()
                .setLabel("Vote")
                .setURL("https://top.gg/bot/833535533287866398")
                .setStyle("LINK"),
            new MessageButton()
                .setLabel("Website")
                .setURL("https://valostats.netlify.app/")
                .setStyle("LINK"),
        )

        const inviteEmbed = new MessageEmbed()
            .setColor("RANDOM")
            .setFooter({ text: 'Developed by CMDRVo' })
            .addFields(
                {
                    name: 'Invite', value: "```diff\n" + "https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=3224894528&scope=bot"
                        + "\n```", inline: true
                },
            )

        await interaction.reply({
            embeds: [inviteEmbed],
            components: [inviteButton]
        });

    }

}