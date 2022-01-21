"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarboardClient = void 0;
const discord_js_1 = require("discord.js");
class StarboardClient {
    client;
    guilds;
    cache = new discord_js_1.Collection();
    constructor(options) {
        this.client = options.client;
        this.guilds = options.Guilds || [];
        this.client.on("ready", () => this.cacheData());
    }
    config = {
        guilds: {
            set: (StarboardGuilds) => {
                this.guilds = StarboardGuilds;
                this.cacheData();
            },
            add: (StarboardGuild) => {
                const filtered = (this.guilds || []).filter((x) => x.id === StarboardGuild.id);
                this.guilds = [...filtered, StarboardGuild];
                this.cacheData();
            },
        },
    };
    cacheData() {
        this.guilds.forEach(async (guild) => {
            const channel = this.client.channels.cache.get(guild.options.starboardChannel);
            if (!channel)
                return;
            const messages = await channel.messages.fetch({ limit: 100 });
            if (!messages)
                return;
            const value = messages.reduce((accumulator, message) => {
                if (message.author.id !== this.client.user.id)
                    return accumulator;
                const starCount = message.content.match(/(?<=\*\*)\d*(?=\*\*)/)?.[0];
                const origin = message.embeds?.[0]?.footer?.text.match(/\d*/)?.[0];
                if (!starCount || !origin)
                    return accumulator;
                const data = {
                    id: message.id,
                    origin,
                };
                return [...accumulator, data];
            }, []);
            this.cache.set(guild.id, value);
        });
    }
    validGuild(guild) {
        return this.guilds.some((x) => x.id === guild);
    }
    getData(guildId) {
        return this.guilds.find((x) => x.id === guildId);
    }
    generateEdit(starCount, message) {
        return {
            content: `⭐ **${starCount}** ${message.channel}`,
            embeds: [
                new discord_js_1.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setColor("#fcc444")
                    .setDescription(message.content)
                    .addField("Source", `[Jump!](${message.url})`)
                    .setImage(message.attachments.first()?.url || null)
                    .setFooter(`${message.id} • ${message.createdAt.toLocaleDateString()}`),
            ],
        };
    }
    async listener(reaction) {
        if (!this.validGuild)
            return;
        if (reaction.message.partial)
            await reaction.message.fetch();
        if (reaction.partial)
            await reaction.fetch();
        const { guildId, id } = reaction.message;
        if (reaction.emoji.name !== "⭐" ||
            reaction.count < this.getData(guildId)?.options.starCount)
            return;
        const data = this.cache.get(guildId) || [];
        const starboardChannel = this.client.channels.cache.get(this.guilds.find((x) => x.id === guildId)?.options.starboardChannel);
        const getMessage = data.find((x) => x.origin === id);
        const generateEdit = this.generateEdit(reaction.count, reaction.message);
        const sendMessage = () => {
            starboardChannel?.send(generateEdit).then((m) => {
                this.cache.set(reaction.message.guildId, [
                    ...data,
                    { id: m.id, origin: reaction.message.id },
                ]);
            });
        };
        if (getMessage) {
            starboardChannel.messages
                .fetch(getMessage.id)
                .then((publishedMessage) => {
                publishedMessage.edit(generateEdit);
            })
                .catch(sendMessage);
        }
        else
            sendMessage();
    }
}
exports.StarboardClient = StarboardClient;
//# sourceMappingURL=starboard.js.map