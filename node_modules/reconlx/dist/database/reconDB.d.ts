import mongoose from "mongoose";
import { Client, Collection } from "discord.js";
export declare class reconDB {
    schema: mongoose.Model<reconDBSchema, {}, {}, {}>;
    dbCollection: Collection<string, any>;
    client: Client;
    /**
     * @name reconDB
     * @kind constructor
     * @param {reconDBOptions} options options to use the database
     */
    constructor(mongooseConnectionString: string);
    private ready;
    /**
     * @method
     * @param key  The key, so you can get it with <MongoClient>.get("key")
     * @param value value The value which will be saved to the key
     * @description saves data to mongodb
     * @example <reconDB>.set("test","js is cool")
     */
    set(key: string, value: any): void;
    /**
     * @method
     * @param key They key you wish to delete
     * @description Removes data from mongodb
     * @example <reconDB>.delete("test")
     */
    delete(key: string): void;
    /**
     * @method
     * @param key The key you wish to get data
     * @description Gets data from the database with a key
     * @example <reconDB>.get('key1')
     */
    get(key: string): any;
    /**
     * @method
     * @param key The key you wish to push data to
     * @description Push data to the an array with a key
     * @example
     */
    push(key: string, ...pushValue: any): void;
    /**
     * @method
     * @returns Cached data with discord.js collection
     */
    collection(): Collection<string, any>;
}
export interface reconDBSchema {
    key: string;
    value: any;
}
