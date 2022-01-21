export interface Message {
    author: {
        displayAvatarURL(): string;
        tag: string;
    };
    createdAt: Date;
    content: string;
    [key: string]: any;
}
export interface TranscriptOptions {
    guild: {
        name: string;
        iconURL(): string;
        [key: string]: any;
    };
    channel: {
        name: string;
        [key: string]: any;
    };
    messages: Message[];
}
