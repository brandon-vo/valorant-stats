const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // await delay(90);
    const guildSizes = await client.shard.fetchClientValues('guilds.cache.size');
    const totalGuilds = guildSizes.reduce((prev, curr) => prev + curr, 0);
    client.user.setActivity(`${totalGuilds} servers | /help`, { type: ActivityType.Watching });

    // Servers with atleast 1000 members
    client.guilds.cache
      .filter((guild) => guild.memberCount >= 1000)
      .forEach((largeGuild) => {
        console.log(largeGuild.memberCount + ' | ' + largeGuild.name + ' | ' + largeGuild.id);
      });
    console.log('ValoStats is online');
  },
};

// i forgot why we needed a delay
// function delay(t) {
//   return new Promise(function (resolve) {
//     setTimeout(resolve, t * 1000);
//   });
// }
