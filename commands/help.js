const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "help",
    description: "Display avaliable commands to the user.",

    execute(message) {

        const helpEmbed = new MessageEmbed()
            .setColor('#11806A')
            .setAuthor('Valorant Stats', 'https://bit.ly/32GAtTp')
            .addFields(
<<<<<<< HEAD
                { name: 'Career Stats', value: "`$stats`: Display career stats of a user" },
                { name: 'Last 20 Matches', value: "`$last20` `$l20`: Display stats for the last 20 matches of a user" },
                { name: 'Last Game', value: "`$lastmatch` `$lm`: Display last match information of a user" },
                { name: 'Link Account', value: "`$link`: Link a Valorant account to your Discord ID"},
                { name: 'Extra', value: "`$joke` `$ping` `$help` `$join` `$leave`" },
=======
                { name: 'Career Stats', value: "`v!stats`: Display career stats of a user" },
                //{ name: 'Last 20 Matches', value: "`v!last20` `v!l20`: Display stats for the last 20 matches of a user" },
                { name: 'Last Game', value: "`v!lastmatch` `v!lm`: Display last match information of a user" },
                { name: 'Link Account (bug)', value: "`v!link`: Link a Valorant account to your Discord ID" },
                { name: 'Invite', value: "`v!invite`: Get Discord bot invite link" },
                { name: 'Extra', value: "`v!joke` `v!ping` `v!help` `v!join` `v!leave`" },
>>>>>>> 0fa1075 (Update Bot)
            )
            .setTimestamp()

        message.channel.send(helpEmbed);

    }

}
