const fs = require('fs');
require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Check for Javascript file in the command folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Check through all files in the commands folder
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("VALORANT | $help"); 
});

client.on('message', async message => {
    if(!message.content.startsWith(process.env.PREFIX) || message.author.bot) return; // Return nothing if there is no prefix or if the bot is messaging

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(a => a.aliases && a.aliases.includes(commandName))

	try {
		command.execute(message, args, commandName)
	} catch (error) {
        console.log(error);
	}

});

client.login(process.env.DISCORD_TOKEN);
