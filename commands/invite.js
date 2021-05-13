const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "invite",
    description: "Give user the Discord bot invite link",

    execute(message) {

        message.channel.send('https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=3224894528&scope=bot');

    }

}