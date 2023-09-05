require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const { AutoPoster } = require('topgg-autoposter');
const { Api } = require('@top-gg/sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const functions = fs.readdirSync('./functions/bot').filter((file) => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

const poster = AutoPoster(process.env.TOPGG_TOKEN, client);
client.topgg = new Api(process.env.TOPGG_TOKEN, this);

(async () => {
  for (const file of functions) {
    require(`./functions/bot/${file}`)(client);
  }

  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => console.error(error));

  if (!process.env.DEV) {
    poster.on('posted', (stats) => {
      console.log(`Posted to Top.gg | ${stats.serverCount} servers`);
    });
  }

  client.handleEvents(eventFiles, './events');
  client.handleCommands('./commands');

  client.login(process.env.DEV ? process.env.DISCORD_TOKEN_DEV : process.env.DISCORD_TOKEN);
})();
