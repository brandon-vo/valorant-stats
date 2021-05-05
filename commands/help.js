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
                { name: 'Career Stats `v!stats <username#tag>`', value: "Display competitive career stats of a user" },
                { name: 'Last Game `v!lm <username#tag>`', value: "Display last match information of a user" },
                { name: 'Link Account `v!link <username#tag>` (bug)', value: "Link a Valorant account to your Discord ID" },
                { name: 'Invite Link `v!invite`', value: "Get Discord bot invite link" },
                { name: 'Extra `v!joke` `v!ping` `v!help`', value: "\u200B" },
            )
            .setTimestamp()

        message.channel.send(helpEmbed);

    }

}
