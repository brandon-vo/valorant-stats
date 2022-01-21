import mongoose from "mongoose";
import { Collection } from "discord.js";
import { GiveawayClientOptions, GiveawayClientSchema, StartOptions } from "./giveaways.interfaces";
export declare class GiveawayClient {
    schema: mongoose.Model<GiveawayClientSchema, {}, {}, {}>;
    options: GiveawayClientOptions;
    collection: Collection<string, GiveawayClientSchema>;
    /**
     * @name GiveawayClient
     * @kind constructor
     * @description Initialzing the giveaway client
     */
    constructor(options: GiveawayClientOptions);
    private ready;
    /**
     * @method
     * @description Starts a giveaway
     */
    start(options: StartOptions): void;
    /**
     * @method
     * @param {String} MessageID Message ID for the giveaway
     * @param {Boolean} getWinner Choose a winner?
     * @description End a giveaway, choose a winner (optional)
     */
    end(MessageID: string, getWinner: boolean): void;
    /**
     * @method
     * @description Picks a new winner!
     */
    reroll(MessageID: string): Promise<unknown>;
    /**
     * @method
     * @param {Boolean} activatedOnly display activated giveaways only?
     * @param {Boolean} all display giveaways of  all guilds?
     * @param {Message} message message if (all = false)
     * @description Get data on current giveaways hosted by the bot
     */
    getCurrentGiveaways(activatedOnly: boolean, all: boolean, message: any): Promise<unknown>;
    /**
     * @method
     * @param {Boolean} all Get data from all guilds?
     * @param {String} guildID guild id if all=false
     * @description Removes (activated = false) giveaways
     */
    removeCachedGiveaways(all: boolean, guildID: any): void;
    private getReactions;
    private getMessage;
    private getChannel;
    private checkWinners;
}
