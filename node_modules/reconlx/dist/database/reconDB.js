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
exports.reconDB = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const discord_js_1 = require("discord.js");
class reconDB {
    schema = mongoose_1.default.model("recondb-collection", new mongoose_1.Schema({
        key: String,
        value: mongoose_1.default.SchemaTypes.Mixed,
    }));
    dbCollection = new discord_js_1.Collection();
    client;
    /**
     * @name reconDB
     * @kind constructor
     * @param {reconDBOptions} options options to use the database
     */
    constructor(mongooseConnectionString) {
        if (mongoose_1.default.connection.readyState !== 1) {
            if (!mongooseConnectionString)
                throw new Error("There is no established  connection with mongoose and a mongoose connection is required!");
            mongoose_1.default.connect(mongooseConnectionString);
        }
        this.ready();
    }
    async ready() {
        await this.schema.find({}).then((data) => {
            data.forEach(({ key, value }) => {
                this.dbCollection.set(key, value);
            });
        });
    }
    /**
     * @method
     * @param key  The key, so you can get it with <MongoClient>.get("key")
     * @param value value The value which will be saved to the key
     * @description saves data to mongodb
     * @example <reconDB>.set("test","js is cool")
     */
    set(key, value) {
        if (!key || !value)
            return;
        this.schema.findOne({ key }, async (err, data) => {
            if (err)
                throw err;
            if (data)
                data.value = value;
            else
                data = new this.schema({ key, value });
            data.save();
            this.dbCollection.set(key, value);
        });
    }
    /**
     * @method
     * @param key They key you wish to delete
     * @description Removes data from mongodb
     * @example <reconDB>.delete("test")
     */
    delete(key) {
        if (!key)
            return;
        this.schema.findOne({ key }, async (err, data) => {
            if (err)
                throw err;
            if (data)
                await data.delete();
        });
        this.dbCollection.delete(key);
    }
    /**
     * @method
     * @param key The key you wish to get data
     * @description Gets data from the database with a key
     * @example <reconDB>.get('key1')
     */
    get(key) {
        if (!key)
            return;
        return this.dbCollection.get(key);
    }
    /**
     * @method
     * @param key The key you wish to push data to
     * @description Push data to the an array with a key
     * @example
     */
    push(key, ...pushValue) {
        const data = this.dbCollection.get(key);
        const values = pushValue.flat();
        if (!Array.isArray(data))
            throw Error(`You cant push data to a ${typeof data} value!`);
        data.push(pushValue);
        this.schema.findOne({ key }, async (err, res) => {
            res.value = [...res.value, ...values];
            res.save();
        });
    }
    /**
     * @method
     * @returns Cached data with discord.js collection
     */
    collection() {
        return this.dbCollection;
    }
}
exports.reconDB = reconDB;
//# sourceMappingURL=reconDB.js.map