import { Client, ColorResolvable, TextChannel, User } from "discord.js";
export interface StartOptions {
    /**
     * Channel for the giveaway to be in
     */
    channel: TextChannel;
    /**
     * Duration of this giveaway
     */
    time: number;
    /**
     * Person that hosted the giveaway
     */
    hostedBy: User;
    /**
     * Description of the giveaway
     */
    description: string;
    /**
     * Amount of winners for the giveaway
     */
    winners: number;
    /**
     * Prize for the  giveaway
     */
    prize: string;
}
export interface GiveawayClientSchema {
    MessageID: string;
    EndsAt: number;
    Guild: string;
    Channel: string;
    winners: number;
    prize: string;
    description: string;
    hostedBy: string;
    Activated: boolean;
}
export interface GiveawayClientOptions {
    /**
     * discord.js client
     */
    client: Client;
    /**
     * mongodb compass connection string
     */
    mongooseConnectionString: string;
    /**
     * reaction emoji
     */
    emoji?: string;
    /**
     * default color for embeds
     */
    defaultColor?: ColorResolvable;
}
