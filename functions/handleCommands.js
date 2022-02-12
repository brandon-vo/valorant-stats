const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const clientId = '833535533287866398';
const guildId = '227161871105523715';

module.exports = (client) => {
    client.handleCommands = async (path) => {

        client.commandArray = [];

        const commandFiles = fs.readdirSync(`${path}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`.${path}/${file}`);
            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        };

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        (async () => {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: client.commandArray },
                );

                console.log('Reloaded slash commands');
            } catch (error) {
                console.error(error);
            }
        })();
    };
};