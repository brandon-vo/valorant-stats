"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawayClient = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const discord_js_1 = require("discord.js");
class GiveawayClient {
    schema = mongoose_1.default.model("reconlx-giveaways", new mongoose_1.default.Schema({
        MessageID: String,
        EndsAt: Number,
        Guild: String,
        Channel: String,
        winners: Number,
        prize: String,
        description: String,
        hostedBy: String,
        Activated: Boolean,
    }));
    options;
    collection = new discord_js_1.Collection();
    /**
     * @name GiveawayClient
     * @kind constructor
     * @description Initialzing the giveaway client
     */
    constructor(options) {
        const { client, mongooseConnectionString, defaultColor, emoji } = options;
        if (mongoose_1.default.connection.readyState !== 1) {
            if (!options.mongooseConnectionString)
                throw new Error("There is no established  connection with mongoose and a mongoose connection is required!");
            mongoose_1.default.connect(options.mongooseConnectionString);
        }
        this.options = {
            client,
            mongooseConnectionString,
            defaultColor: defaultColor || "#FF0000",
            emoji: emoji || "🎉",
        };
        this.ready();
    }
    ready() {
        this.schema.find().then((data) => {
            if (!data?.length)
                return;
            data.forEach((value) => {
                this.collection.set(value.MessageID, value);
            });
        });
        this.checkWinners();
    }
    /**
     * @method
     * @description Starts a giveaway
     */
    start(options) {
        const { channel, time, winners, prize, description, hostedBy } = options;
        const desc = [
            `Giveaway ends at ${new Date(Date.now() + time).toLocaleString()}\n` + `Hosted by: ${hostedBy}`,
        ];
        if (description)
            desc.push(`Description: ${description}`);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`${prize}`)
            .setDescription(desc.join("\n"))
            .setFooter(`${winners} winner(s)`)
            .setColor(this.options.defaultColor)
            .setTimestamp();
        channel.send({ embeds: [embed] }).then((msg) => {
            msg.react(this.options.emoji);
            const values = {
                MessageID: msg.id,
                EndsAt: Date.now() + time,
                Guild: msg.guild.id,
                Channel: msg.channel.id,
                winners,
                prize,
                description,
                hostedBy: hostedBy.id,
                Activated: true,
            };
            const newGiveawaySchema = new this.schema(values);
            newGiveawaySchema.save();
            this.collection.set(values.MessageID, values);
        });
    }
    /**
     * @method
     * @param {String} MessageID Message ID for the giveaway
     * @param {Boolean} getWinner Choose a winner?
     * @description End a giveaway, choose a winner (optional)
     */
    end(MessageID, getWinner) {
        this.schema.findOne({ MessageID, Activated: true }, async (err, data) => {
            const giveawayChannel = this.options.client.channels.cache.get(data.Channel);
            if (err)
                throw err;
            if (!data)
                throw new Error("There are no giveaways currently running with " +
                    MessageID +
                    " id");
            if (getWinner) {
                this.getReactions(data.Channel, data.MessageID, data.winners).then((reactions) => {
                    const winners = reactions
                        .map((user) => user)
                        .join(", ");
                    giveawayChannel.send(`Congrats ${winners} you have won **${data.prize}**`);
                });
            }
            else {
                const oldMessage = await this.getMessage(data.Channel, data.MessageID);
                oldMessage.edit({
                    embeds: [
                        new discord_js_1.MessageEmbed().setTitle("Giveaway ended!"),
                    ],
                });
            }
            data.Activated = false;
            data.save();
            this.collection.delete(MessageID);
        });
    }
    /**
     * @method
     * @description Picks a new winner!
     */
    reroll(MessageID) {
        return new Promise((ful, rej) => {
            const filtered = this.collection.filter((value) => value.Activated === false);
            const data = filtered.get(MessageID);
            if (!data)
                rej("The giveaway does not exist or has not been ended yet");
            const giveawayChannel = this.getChannel(data.Channel);
            this.getReactions(data.Channel, MessageID, data.winners).then((reactions) => {
                const winner = reactions.map((user) => user).join(", ");
                giveawayChannel.send(`Giveway has been rerolled, ${winner} ${reactions.size === 1 ? "is" : "are"} the new winner for **${data.prize}**`);
            });
        });
    }
    /**
     * @method
     * @param {Boolean} activatedOnly display activated giveaways only?
     * @param {Boolean} all display giveaways of  all guilds?
     * @param {Message} message message if (all = false)
     * @description Get data on current giveaways hosted by the bot
     */
    getCurrentGiveaways(activatedOnly = true, all = false, message) {
        return new Promise((ful, rej) => {
            if (all) {
                if (activatedOnly) {
                    ful(this.collection.filter((value) => value.Activated === true));
                }
                else {
                    ful(this.collection);
                }
            }
            else {
                if (activatedOnly) {
                    ful(this.collection.filter((value) => value.Guild === message.guild.id &&
                        value.Activated === true));
                }
                ful(this.collection.filter((value) => value.Guild === message.guild.id));
            }
        });
    }
    /**
     * @method
     * @param {Boolean} all Get data from all guilds?
     * @param {String} guildID guild id if all=false
     * @description Removes (activated = false) giveaways
     */
    removeCachedGiveaways(all = false, guildID) {
        if (!all) {
            this.schema.find({ Guild: guildID, Activated: false }, async (err, data) => {
                if (err)
                    throw err;
                if (data)
                    data.forEach((data) => {
                        data.delete();
                    });
            });
            const filtered = this.collection.filter((value) => value.Activated === false && value.Guild === guildID);
            filtered.forEach((value) => {
                this.collection.delete(value.MessageID);
            });
        }
        else {
            this.schema.find({ Activated: false }, async (err, data) => {
                if (err)
                    throw err;
                if (data)
                    data.forEach((data) => {
                        data.delete();
                    });
            });
            const filtered = this.collection.filter((value) => value.Activated === false);
            filtered.forEach((value) => {
                this.collection.delete(value.MessageID);
            });
        }
    }
    getReactions(channelID, messageID, amount) {
        return new Promise((ful, rej) => {
            this.options.client.channels.cache.get(channelID).messages
                .fetch(messageID)
                .then((msg) => {
                msg.reactions.cache
                    .get(this.options.emoji)
                    .users.fetch()
                    .then((users) => {
                    const real = users.filter((user) => !user.bot);
                    if (amount && !real.size >= amount)
                        rej("Not Enough Reactions, winner was not decided");
                    ful(real.random(amount));
                });
            });
        });
    }
    getMessage(channel, message) {
        return this.options.client.channels.cache.get(channel).messages.fetch(message);
    }
    getChannel(value) {
        return this.options.client.channels.cache.get(value);
    }
    checkWinners() {
        setInterval(() => {
            const endedGiveaways = this.collection.filter((value) => value.EndsAt < Date.now() && value.Activated === true);
            if (endedGiveaways.size === 0)
                return;
            endedGiveaways.forEach(async (giveaway) => {
                const giveawayChannel = this.getChannel(giveaway.Channel);
                this.getReactions(giveaway.Channel, giveaway.MessageID, giveaway.winners)
                    .then((reactions) => {
                    const winners = reactions
                        .map((user) => user)
                        .join(", ");
                    giveawayChannel.send(`Congrats ${winners} you have won **${giveaway.prize}**`);
                })
                    .catch((err) => {
                    giveawayChannel.send(`No winner was determined for giveaway -> https://discord.com/channels/${giveaway.Guild}/${giveaway.Channel}/${giveaway.MessageID}`);
                });
                const oldMessage = await this.getMessage(giveaway.Channel, giveaway.MessageID);
                oldMessage.edit({
                    embeds: [new discord_js_1.MessageEmbed().setTitle("Giveaway Ended!")],
                });
                this.collection.get(giveaway.MessageID).Activated = false;
                const props = {
                    MessageID: giveaway.MessageID,
                    Activated: true,
                };
                const data = await this.schema.findOne(props);
                if (data)
                    data.Activated = false;
                data.save();
            });
        }, 5000);
    }
}
exports.GiveawayClient = GiveawayClient;
//# sourceMappingURL=giveaways.js.map