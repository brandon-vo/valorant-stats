const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const mongoose = require('mongoose')
require('dotenv').config();
client.commands = new Collection();
const { AutoPoster } = require('topgg-autoposter')
const poster = AutoPoster(process.env.TOPGG_TOKEN, client)

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
};

poster.on('posted', (stats) => {
	console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
});

// Set bot activity
client.on('ready', () => {
	let serverCount = client.guilds.cache.size * 3;
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`${serverCount} servers | v!help`, { type: "WATCHING" });
	// let activities = [ `${serverCount} servers`, `${client.users.cache.size} users` ], i = 0;
	// setInterval(() => client.user.setActivity(`${activities[i ++ % activities.length]} | v!help`, { type: "WATCHING"}),`5000`)
});

// Checking messages and executing commands
client.on('messageCreate', async message => {
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

// source: https://stackoverflow.com/questions/51447954/sending-a-message-the-first-channel-with-discord-js/53286788
client.on("guildCreate", guild => {
	let channelID;
	let channels = guild.channels.cache;

	channelLoop:
	for (let key in channels) {
		let c = channels[key];
		if (c[1].type === "text") {
			channelID = c[0];
			break channelLoop;
		}
	}
	// temp
	let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
	channel.send("Thanks for the invite! \n To get started, connect your account to https://tracker.gg/valorant" +
		" \n You will want to use `v!link username#tag` to link your account" +
		" \n Use `v!help` for a list of commands." +
		" \n Need help? Join the test server: https://discord.gg/8bY6nFaVEY" +
		" \n Please consider voting for my bot here: https://bit.ly/valostats-topgg" +
		" \n Developed by CMDRVo")
});

// Login to bot
client.login(process.env.DISCORD_TOKEN);