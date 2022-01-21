import { Client, ColorResolvable, Message, MessageOptions, MessagePayload, Snowflake, User } from "discord.js";
declare type msg = string | MessagePayload | MessageOptions;
export interface ModMailOptions {
    /**
     * connection string for mongoose
     */
    mongooseConnectionString: string;
    /**
     * main guild id
     */
    guildId: Snowflake;
    /**
     * category to create modmail channels in
     */
    category: Snowflake;
    /**
     * your discord.js client
     */
    client: Client;
    /**
     * a role that can view modmail tickets
     */
    modmailRole?: Snowflake;
    /**
     * a channel where transcripts are sent to
     */
    transcriptChannel?: Snowflake;
    /**
     * custom messages
     */
    custom?: {
        /**
         * sourcebin language for transcript
         */
        language?: string;
        /**
         * color for embeds
         */
        embedColor?: ColorResolvable;
        /**
         * initial message to created channel when a new mail is opened
         */
        channel?: (user: User) => msg;
        /**
         * inital message sent to user when the user created a new modmail
         */
        user?: (user: User) => msg;
        /**
         * how do you want your message to look?
         */
        saveMessageFormat?: (message: Message) => string;
    };
}
export interface ModMailModelOptions {
    User: Snowflake;
    Channel: Snowflake;
    Messages: string[];
}
export interface CloseMailSessionOptions {
    channel: Snowflake;
    reason: string;
}
export {};
