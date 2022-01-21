import { Client, MessageReaction, Collection, Snowflake } from "discord.js";
import { starMessageData, StarboardClientOptions, StarboardGuild } from "./starboard.interfaces";
export declare class StarboardClient {
    client: Client;
    guilds: StarboardGuild[];
    cache: Collection<Snowflake, starMessageData[]>;
    constructor(options: StarboardClientOptions);
    config: {
        guilds: {
            set: (StarboardGuilds: StarboardGuild[]) => void;
            add: (StarboardGuild: StarboardGuild) => void;
        };
    };
    private cacheData;
    private validGuild;
    private getData;
    private generateEdit;
    listener(reaction: MessageReaction): Promise<void>;
}
