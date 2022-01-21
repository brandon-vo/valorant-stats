import { CloseMailSessionOptions, ModMailModelOptions, ModMailOptions } from "./modmail.interface";
import mongoose from "mongoose";
import { Collection, Message } from "discord.js";
export declare class ModMailClient {
    options: ModMailOptions;
    collection: Collection<string, ModMailModelOptions>;
    set: Set<string>;
    model: mongoose.Model<ModMailModelOptions, {}, {}, {}>;
    constructor(options: ModMailOptions);
    ready(): void;
    modmailListener(message: Message): Promise<void | import("mongodb").DeleteResult | Message<boolean>>;
    deleteMail({ channel, reason }: CloseMailSessionOptions): Promise<void>;
}
