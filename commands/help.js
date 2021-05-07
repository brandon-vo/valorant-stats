const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "help",
    description: "Display avaliable commands to the user.",

    execute(message) {

        const helpEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor('Bot Commands', 'https://bit.ly/32GAtTp')
            .addFields(
                {name: 'How to use this Discord bot', value: "```fix\n" + "1. Sign in with your Riot ID on https://tracker.gg/valorant\n"
                + "2. Track your Valorant stats with the following commands \n```"},
                { name: 'Competitive Stats `v!stats <username#tag>` `v!comp <username#tag>`', value: "Display competitive career stats of a user" },
                { name: 'Unrated Stats `v!unrated <username#tag>`', value: "Display unrated career stats of a user" },
                { name: 'Spike Rush Stats `v!spikerush <username#tag>`', value: "Display unrated career stats of a user" },
                { name: 'Deathmatch Stats `v!dm <username#tag>` `v!deathmatch <username#tag>`', value: "Display deathmatch career stats of a user" },
                { name: 'Escalation Stats `v!escalation <username#tag>`', value: "Display escalation career stats of a user" },
                { name: 'Last Game `v!lm <username#tag>`', value: "Display last match information of a user" },
                { name: 'Link Account `v!link <username#tag>` (does not save at the moment)', value: "Link a Valorant account to your Discord ID" },
                { name: 'Invite Link `v!invite`', value: "Get Discord bot invite link" },
                { name: 'Extra `v!joke` `v!ping` `v!help`', value: "\u200B" },
            )
            .setTimestamp()

        message.channel.send(helpEmbed);

    }

}
