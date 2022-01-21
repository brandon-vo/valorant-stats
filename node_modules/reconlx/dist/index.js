"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.chatBot = exports.StarboardClient = exports.ModMailClient = exports.pagination = exports.generateTranscript = exports.GiveawayClient = exports.reconDB = void 0;
// reconDB
var reconDB_1 = require("./database/reconDB");
Object.defineProperty(exports, "reconDB", { enumerable: true, get: function () { return reconDB_1.reconDB; } });
// giveaways
var giveaways_1 = require("./giveaways");
Object.defineProperty(exports, "GiveawayClient", { enumerable: true, get: function () { return giveaways_1.GiveawayClient; } });
// transcript
var transcripts_1 = require("./transcripts");
Object.defineProperty(exports, "generateTranscript", { enumerable: true, get: function () { return transcripts_1.generateTranscript; } });
// pagination
var pagination_1 = require("./pagination");
Object.defineProperty(exports, "pagination", { enumerable: true, get: function () { return pagination_1.pagination; } });
// modmail
var modmail_1 = require("./modmail");
Object.defineProperty(exports, "ModMailClient", { enumerable: true, get: function () { return modmail_1.ModMailClient; } });
// starboard
var starboard_1 = require("./starboard");
Object.defineProperty(exports, "StarboardClient", { enumerable: true, get: function () { return starboard_1.StarboardClient; } });
// functions
var chatBot_1 = require("./functions/chatBot");
Object.defineProperty(exports, "chatBot", { enumerable: true, get: function () { return chatBot_1.chatBot; } });
// structures
var command_1 = require("./structures/command");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return command_1.Command; } });
//# sourceMappingURL=index.js.map