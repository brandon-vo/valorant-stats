const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
  client.handleCommands = async (path) => {
    client.commandArray = [];

    const commandFiles = fs.readdirSync(`${path}`).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`../.${path}/${file}`);
      client.commands.set(command.data.name, command);
      client.commandArray.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(
      process.env.DEV ? process.env.DISCORD_TOKEN_DEV : process.env.DISCORD_TOKEN
    );

    (async () => {
      try {
        await rest.put(
          process.env.DEV
            ? Routes.applicationGuildCommands(process.env.APPLICATION_ID_DEV, process.env.GUILD_ID)
            : Routes.applicationCommands(process.env.APPLICATION_ID), // Prod
          { body: client.commandArray }
        );
        console.log('Reloaded slash commands');
      } catch (error) {
        console.error(error);
      }
    })();
  };
};
