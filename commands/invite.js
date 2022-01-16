const { MessageEmbed } = require('discord.js')
const { MessageButton } = require('discord-buttons')

module.exports = {
    name: "invite",
    description: "Give user the Discord bot invite link",

    execute(message) {

        var inviteButton = new MessageButton()
            .setStyle("LINK")
            .setLabel("Join Server")
            .setURL("https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=3224894528&scope=bot"
            )
        message.channel.send('https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=3224894528&scope=bot', inviteButton);

    }

}