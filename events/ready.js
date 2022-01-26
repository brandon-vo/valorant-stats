module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        let serverCount = client.guilds.cache.size * 3;
        console.log(`Online | ${client.guilds.cache.size} servers`);
        client.user.setActivity(`${serverCount} servers | v!help`, { type: "WATCHING" });

        // client.guilds.cache.filter(g => g.memberCount > 1000).forEach((guild) => {
        //     console.log(guild.memberCount + ' | ' + guild.name + ' | ' + guild.id);
        // });

    },
};