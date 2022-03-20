module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        await delay(90);
        const req = await client.shard.fetchClientValues("guilds.cache.size");
        const total = req.reduce((p, n) => p + n, 0);
        client.user.setActivity(`${total} servers | /help`, { type: "WATCHING" });

        // client.guilds.cache.filter(g => g.memberCount > 1000).forEach((guild) => {
        //     console.log(guild.memberCount + ' | ' + guild.name + ' | ' + guild.id);
        // });

    },
};

function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
}