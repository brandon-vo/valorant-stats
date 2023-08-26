const { ShardingManager } = require('discord.js');
require('dotenv').config();

const manager = new ShardingManager('./bot.js', {
  totalShards: 'auto',
  token: process.env.DISCORD_TOKEN,
  respawn: true,
});

manager.on('shardCreate', (shard) => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn().catch((e) => console.log(e));
