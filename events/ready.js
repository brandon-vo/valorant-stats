const { ActivityType } = require('discord.js');
const Account = require('../schemas/AccountSchema');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // TODO: Get guild sizes without hardcoded delay
    process.env.DEV ? await delay(5) : await delay(90);

    let linkedCount;
    try {
      linkedCount = await Account.countDocuments({});
    } catch (err) {
      console.error(err);
    }

    const guildSizes = await client.shard.fetchClientValues('guilds.cache.size');
    const totalGuilds = guildSizes.reduce((prev, curr) => prev + curr, 0);
    const activities = [`${totalGuilds} servers | /help`, `${linkedCount} users | /help`];

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
