import { ChatInputApplicationCommandData, Client, CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
export interface RunOptions {
    client: Client;
    interaction: CommandInteraction & {
        member: GuildMember;
    };
    args: Array<string>;
}
export declare type RunFunction = (options: RunOptions) => any;
export declare type CommandOptions = {
    userPermissions?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;
export declare class Command {
    constructor(commandOptions: CommandOptions);
}
