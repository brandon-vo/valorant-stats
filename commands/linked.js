const Account = require('../schemas/AccountSchema')
require('dotenv').config()

module.exports = {
    name: 'linked',
    description: 'Check linked account',
    async execute(message) {

        const accounts = await Account.find({ discordId: message.author.id })

        if (accounts.length > 0) {
            var ID = accounts[0].valorantAccount
            var linked = ID.replace(/%23/g, '#')
            var linkedAccount = linked.replace(/%20/g, ' ')

            message.reply('Your linked account is: `' + linkedAccount + '`');
        } else {
            message.reply('You do not have an account linked! Use v!link USERNAME#TAG to link a Valorant account.');
        }
    },
};