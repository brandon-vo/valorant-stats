require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const mongoose = require('mongoose');
const { AutoPoster } = require('topgg-autoposter');
const poster = AutoPoster(process.env.TOPGG_TOKEN, client);
client.commands = new Collection();

// Check for Javascript file
const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
//const slashCommandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

// Check through all files in the commands folder
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
};

for (const file of functions) {
	require(`./functions/${file}`)(client);
};

// for (const file of slashCommandFiles) {
// 	const command = require(`./slashCommands/${file}`);
// 	commands.push(command.data.toJSON());
// 	client.commands.set(command.data.name, command);
// };

// Connecting to database
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to MongoDB Database')
}).catch((error) => console.error(error))

// Alert post to Top.gg
poster.on('posted', (stats) => {
	console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
});

client.handleEvents(eventFiles, "./events");
//client.handleCommands(slashCommandFiles, "./slashCommands");
client.login(process.env.DISCORD_TOKEN);