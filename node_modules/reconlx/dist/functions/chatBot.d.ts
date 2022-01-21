import { Message } from "discord.js";
export interface ChatBotOptions {
    /**
     * discord.js message class
     */
    message: Message;
    /**
     * input for the chatBot
     */
    input: string;
    /**
     * defaults to author's id
     */
    uuid: string;
}
/**
 * @method
 * @description An easy chatbot without api key
 */
export declare const chatBot: (options: ChatBotOptions) => Promise<string>;
