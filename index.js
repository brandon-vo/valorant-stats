const { ShardingManager } = require('discord.js');
require('dotenv').config()

const manager = new ShardingManager('./bot.js', { token: process.env.DISCORD_TOKEN});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();

manager.on('message', (shard, message) => {
    console.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});