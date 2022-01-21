"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModMailClient = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const discord_js_1 = require("discord.js");
const sourcebin_1 = require("sourcebin");
class ModMailClient {
    options;
    collection = new discord_js_1.Collection();
    set = new Set();
    model = mongoose_1.default.model("reconlx-modmail", new mongoose_1.Schema({
        User: String,
        Channel: String,
        Messages: Array,
    }));
    constructor(options) {
        if (mongoose_1.default.connection.readyState !== 1) {
            if (!options.mongooseConnectionString)
                throw new Error("There is no established  connection with mongoose and a mongoose connection is required!");
            mongoose_1.default.connect(options.mongooseConnectionString);
            this.options = options;
        }
    }
    ready() {
        this.model.find({}).then((data) => {
            data.forEach((x) => {
                this.collection.set(x.User, x);
            });
        });
    }
    async modmailListener(message) {
        if (message.author.id === this.options.client.user.id)
            return;
        const sendMessage = async (channel, user) => {
            const content = () => {
                const context = [];
                const attachment = message.attachments.first();
                if (message.content)
                    context.push(message.content);
                if (attachment)
                    context.push(`[${attachment.url || attachment.proxyURL}]`);
                return context.join("  ");
            };
            // saving messages
            const data = await this.model.findOne({ User: user });
            if (data) {
                data.Messages = [
                    ...data.Messages,
                    `${message.author.tag} :: ${content()}`,
                ];
                data.save().catch((err) => { });
            }
            return channel.send(content()).catch(console.log);
        };
        if (message.channel.type === "DM") {
            const createMail = async () => {
                const user = message.author;
                if (this.set.has(user.id))
                    return;
                const guild = this.options.client.guilds.cache.get(this.options.guildId);
                message.author.send(this.options.custom?.user?.(user) ||
                    `Hi by dming me you are creating a modmail with **${guild.name}** staff team!`);
                this.set.add(user.id);
                const createdChannel = await guild.channels.create(`${user.username}`, {
                    type: "GUILD_TEXT",
                    parent: this.options.category,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: ["VIEW_CHANNEL"],
                        },
                        this.options.modmailRole
                            ? {
                                id: this.options.modmailRole,
                                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                            }
                            : null,
                    ],
                });
                createdChannel
                    .send(this.options.custom?.channel?.(user) || {
                    content: `<@&${this.options.modmailRole}>\n**${user.tag}** (${user.id}) has created a new ticket`,
                })
                    .then((m) => m.pin());
                const props = {
                    User: user.id,
                    Channel: createdChannel.id,
                    Messages: [
                        this.options.custom?.saveMessageFormat?.(message) ||
                            `${message.author.tag} :: ${message.content}`,
                    ],
                };
                new this.model(props).save();
                this.collection.set(props.User, props);
                sendMessage(createdChannel, props.User);
                this.set.delete(props.User);
            };
            const data = this.collection.get(message.author.id);
            if (!data)
                return createMail();
            const channel = this.options.client.channels.cache.get(data.Channel);
            if (!channel)
                return this.model.deleteMany({ Channel: data.Channel });
            await sendMessage(channel, data.User);
        }
        else if (message.channel.parentId === this.options.category) {
            const data = this.collection.find((x) => x.Channel === message.channelId);
            if (!data)
                return message.channel.send("an error occured, user is not found please delete this channel!");
            const user = this.options.client.users.cache.get(data.User);
            await sendMessage(user, user.id);
        }
    }
    async deleteMail({ channel, reason }) {
        const data = this.collection.find((x) => x.Channel === channel);
        const mailChannel = this.options.client.channels.cache.get(channel);
        if (data) {
            const modelData = await this.model.findOne({ User: data.User });
            const user = await this.options.client.users.fetch(data.User);
            if (this.options.transcriptChannel) {
                const transcriptChannel = this.options.client.channels.cache.get(this.options.transcriptChannel);
                const url = (await sourcebin_1.create([
                    {
                        content: modelData.Messages.join("\n"),
                        language: this.options.custom?.language || "AsciiDoc",
                        name: `Transcript [${user.tag}] ${new Date().toLocaleString()}`,
                    },
                ])).url;
                const embed = new discord_js_1.MessageEmbed()
                    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
                    .setColor(this.options.custom?.embedColor || "RANDOM")
                    .setTimestamp()
                    .setDescription([
                    `Message Count: ${modelData.Messages?.length || 0}`,
                    `Close Reason: ${reason || "No reason provided"}`,
                ].join("\n"));
                const components = [
                    new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                        .setURL(url)
                        .setLabel("Transcript")
                        .setStyle("LINK")),
                ];
                mailChannel.delete();
                transcriptChannel.send({ embeds: [embed], components });
                this.collection.delete(data.User);
                await modelData.delete();
            }
        }
    }
}
exports.ModMailClient = ModMailClient;
//# sourceMappingURL=modmail.js.map