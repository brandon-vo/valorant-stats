const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose')
require('dotenv').config()
client.commands = new Discord.Collection();

// Connecting to database
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to MongoDB Database')
}).catch((error) => console.log(error))

// Check for Javascript file in the command folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Check through all files in the commands folder
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Set bot activity
client.on('ready', () => {
	let server_count = client.guilds.cache.size * 3;
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`${server_count} servers | v!help`, { type: "WATCHING" }) 
	// let activities = [ `${client.guilds.cache.size} servers`, `${client.channels.cache.size} chnls`, `${client.users.cache.size} users` ], i = 0;
	// setInterval(() => client.user.setActivity(`${activities[i ++ % activities.length]} | v!help`, { type: "WATCHING"}),`5000`)
})

// Checking messages and executing commands
client.on('message', async message => {
	if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return; // Return nothing if there is no prefix or if the bot is messaging

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(a => a.aliases && a.aliases.includes(commandName))

	try {
		command.execute(message, args, commandName)
	} catch (error) {
		console.error(error);
	}

});

// Login to bot
client.login(process.env.DISCORD_TOKEN);