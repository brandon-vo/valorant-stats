module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        let serverCount = client.guilds.cache.size * 3;
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setActivity(`${serverCount} servers | v!help`, { type: "WATCHING" });

        // client.guilds.cache.filter(g => g.memberCount > 1000).forEach((guild) => {
        //     console.log(guild.memberCount + ' | ' + guild.name + ' | ' + guild.id);
        // });


        // client.on("ready", () => {
        //     (async () => {
        //         try {
        //             if (1 = 2) {//(process.env.ENV === "production") {
        //                 await rest.put(Routes.applicationCommands(CLIENT_ID), {
        //                     body: commands
        //                 });
        //                 console.log("Registered commands globally")
        //             } else {
        //                 await rest.put(Routes.applicationGuildCommands(GUILD_ID), {
        //                     body: commands
        //                 });
        //                 console.log("Registered commands locally")
        //             }
        //         } catch (error) {
        //             console.error(error);
        //         }
        //     })();
        // })
    },
};