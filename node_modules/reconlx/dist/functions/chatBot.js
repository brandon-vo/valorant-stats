"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBot = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * @method
 * @description An easy chatbot without api key
 */
const chatBot = (options) => {
    const { message, input, uuid } = options;
    const baseUrl = `https://api.monkedev.com/fun/chat`;
    return new Promise(async (ful, rej) => {
        try {
            const res = await axios_1.default.get(`${baseUrl}?msg=${encodeURIComponent(input)}&uid=${uuid || message.author.id}`);
            if (!res.data)
                rej("an error occured!");
            ful(res.data);
        }
        catch (err) {
            rej(err);
        }
    });
};
exports.chatBot = chatBot;
//# sourceMappingURL=chatBot.js.map