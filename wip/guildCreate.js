module.exports = {
    name: 'guildCreate', // work in progress
    async execute(guild, client) {
        let channelToSend;

        guild.channels.cache.forEach((channel) => {
            if (
                channel.type === "text" &&
                !channelToSend &&
                channel.permissionsFor(guild.me).has("SEND_MESSAGES")
            ) channelToSend = channel;
        })
        if (!channelToSend) return;

        channelToSend.send(
            "Thanks for the invite!" +
            " \n To get started, connect your account to https://tracker.gg/valorant" +
            " \n You will want to use `v!link username#tag` to link your account" +
            " \n Use `v!help` for a list of commands." +
            " \n Need help? Join the test server: https://discord.gg/8bY6nFaVEY" +
            " \n Please consider voting for my bot here: https://bit.ly/valostats-topgg" +
            " \n Developed by CMDRVo"
        )
    },
};