const DiscordUser = require('../schemas/AccountSchema')
const Account = require('../schemas/AccountSchema')
const mongoose = require('mongoose')

module.exports = {
    name: 'unlink',
    description: 'Unlink Valorant account from your Discord ID',
    async execute(message, args) {

        const accounts = await Account.find({ discordId: message.author.id })

        // // Check if the user has a linked account and delete it
        if (accounts.length > 0) 
            await Account.deleteMany({ discordId: message.author.id })
        
        // Remove linked account from Discord ID
        try {
            const newUser = await DiscordUser.remove({
                username: message.author.username,
                discordId: message.author.id,
                valorantAccount: null
            })
            message.reply('Successfuly unlinked Valorant account from your Discord ID')
        } catch (error) {
            console.log(error)
            return message.reply("Failed to unlink Valorant account from your Discord ID")
        }
    },
};