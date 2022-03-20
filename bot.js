require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const mongoose = require('mongoose');
const { AutoPoster } = require('topgg-autoposter');
const poster = AutoPoster(process.env.TOPGG_TOKEN, client);
client.commands = new Collection();

const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
//const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

(async () => {

	// for (const file of commandFiles) {
	// 	const command = require(`./commands/${file}`);
	// 	client.commands.set(command.name, command);
	// };

	for (const file of functions) {
		require(`./functions/${file}`)(client);
	};

	mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(() => {
		console.log('Connected to MongoDB')
	}).catch((error) => console.error(error));

	poster.on('posted', (stats) => {
		console.log(`Posted to Top.gg | ${stats.serverCount} servers`)
	});

	client.handleEvents(eventFiles, "./events");
	client.handleCommands("./slashCommands");

	client.login(process.env.DISCORD_TOKEN);

})();