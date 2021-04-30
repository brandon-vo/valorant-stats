const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "help",
    description: "Display avaliable commands to the user.",

    execute(message) {

        const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp')
            .addFields(
                { name: 'Career Stats', value: "`$stats`: Display career stats of a user" },
                { name: 'Last 20 Matches', value: "`$last20` `$l20`: Display stats for the last 20 matches of a user" },
                { name: 'Last Game', value: "`$lastmatch` `$lm`: Display last match information of a user" },
                { name: 'Extra', value: "`$joke` `$ping` `$help` `$join` `$leave`" },
            )
            .setTimestamp()

        message.channel.send(helpEmbed);

    }

}