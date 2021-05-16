const DiscordUser = require('../schemas/AccountSchema')
const Account = require('../schemas/AccountSchema')
const mongoose = require('mongoose')

module.exports = {
    name: 'link',
    description: 'Link Valorant account to your Discord ID',
    async execute(message, args) {

        if (!args[0])
            return message.reply('Please include your Valorant username and tag (USERNAME#TAG)')

        // Space to %20
        var str = args[0];
        for (i = 1; i < args.length; i++)
            str += '%20' + args[i];

        // Convert characters to lowercase
        var ID = str.toLowerCase();

        // # to %23
        var playerID = ID.replace(/#/g, "%23")

        const accounts = await Account.find({ discordId: message.author.id })

        // Check if the user has a linked account and delete it
        if (accounts.length > 0) 
            await Account.deleteMany({ discordId: message.author.id })
        
        // Add linked account to Discord ID
        try {
            const newUser = await DiscordUser.create({
                username: message.author.username,
                discordId: message.author.id,
                valorantAccount: playerID
            })
            message.reply('Successfuly linked Valorant account to your Discord ID')
        } catch (error) {
            console.log(error)
            return message.reply("Failed to link Valorant account to your Discord ID")
        }
    },
};