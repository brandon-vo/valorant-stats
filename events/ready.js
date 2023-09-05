const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    await delay(90); // 90s delay. TODO: Get guild sizes without hardcoded delay

    // TODO: Find out how to fetch guilds.cache.size in here since broadcastEval doesn't need to wait with a delay
    const totalMembers = await client.shard.broadcastEval((c) =>
      c.guilds.cache.map((guild) => guild.members.cache.size)
    );
    const guildSizes = await client.shard.fetchClientValues('guilds.cache.size');
    const totalGuilds = guildSizes.reduce((prev, curr) => prev + curr, 0);
    const activities = [`${totalGuilds} servers | /help`, `${totalMembers[0][0]} users | /help`];

    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * activities.length);
      const newActivity = activities[randomIndex];

      client.user.setActivity(`${newActivity}`, { type: ActivityType.Watching });
    }, 10000);

    // Servers with atleast 1000 members
    client.guilds.cache
      .filter((guild) => guild.memberCount >= 1000)
      .forEach((largeGuild) => {
        console.log(largeGuild.memberCount + ' | ' + largeGuild.name + ' | ' + largeGuild.id);
      });
    console.log('ValoStats is online');
  },
};

function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t * 1000);
  });
}
