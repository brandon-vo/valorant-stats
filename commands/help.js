const { MessageEmbed } = require("discord.js");
const pagination = require("discord.js-pagination");

module.exports = {
  name: "help",
  description:
    "Display avaliable commands and other helpful information to the user.",

  execute(message) {
    const helpEmbed1 = new MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Help Menu", "https://bit.ly/32GAtTp")
      .addFields(
        {
          name: "How to use this Discord bot",
          value:
            "```fix\n" +
            "1. Sign in with your Riot ID on https://tracker.gg/valorant\n" +
            "2. Track your Valorant stats with the following commands\n" +
            "Test Server: https://discord.gg/8bY6nFaVEY" +
            "\n```",
        },
        {
          name: "\u200B",
          value:
            "```md\n" +
            "#                      Bot Commands                        #" +
            "\n```",
        },
        {
          name: "Competitive Stats `v!stats username#tag` `v!comp username#tag`",
          value: "Display competitive career stats of a user",
        },
        {
          name: "Unrated Stats `v!unrated username#tag`",
          value: "Display unrated career stats of a user",
        },
        {
          name: "Spike Rush Stats `v!sr username#tag` `v!spikerush username#tag`",
          value: "Display unrated career stats of a user",
        },
        {
          name: "Deathmatch Stats `v!dm username#tag` `v!deathmatch username#tag`",
          value: "Display deathmatch career stats of a user",
        },
        {
          name: "Escalation Stats `v!escalation username#tag`",
          value: "Display escalation career stats of a user",
        },
        {
          name: "Last Game `v!lm username#tag`",
          value: "Display last match information of a user",
        },
        {
          name: "Agents Played `v!agents username#tag`",
          value: "Display agent stats of a user",
        },
        {
          name: "Weapon Stats `v!weapons username#tag` `v!guns username#tag`",
          value: "Display weapon stats of a user",
        },
        {
          name: "Map Stats `v!map username#tag` `v!maps username#tag`",
          value: "Display map stats of a user"
        },
        {
          name: "Link Account `v!link username#tag`",
          value: "Link a Valorant account to your Discord ID",
        },
        {
          name: "Unlink Account `v!unlink`",
          value: "Unlink a Valorant account from your Discord ID",
        },
        {
          name: "Check Linked Account `v!linked`",
          value: "Check which Valorant account is linked to your Discord ID",
        },
        {
          name: "Invite Link `v!invite`",
          value: "Get Discord bot invite link",
        },
        { name: "Extra `v!joke` `v!ping` `v!help`", value: "\u200B" }
      )
      .setTimestamp();

    const helpEmbed2 = new MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Help Menu", "https://bit.ly/32GAtTp")
      .addFields(
        {
          name: "\u200B",
          value:
            "```md\n" +
            "#                         Other                           #" +
            "\n```",
        },
        {
          name: "Note",
          value:
            "The bot must have access to the default permissions in order to function properly",
        },
        { name: "KDR", value: "kills / deaths", inline: true },
        { name: "KDA", value: "(kills + (assists/2)) / deaths", inline: true },
        { name: "KAD", value: "(kills / assists) + deaths", inline: true },
        {
          name: "Known Bugs",
          value:
            "Stats not being retrieved by the bot - Try again later",
        },
        { name: "Found Bugs? ", value: "Contact CMDRVo#3496 on Discord" }
      )
      .setTimestamp();

    const helpPages = [helpEmbed1, helpEmbed2]; // Pages

    const flipPage = ["⬅️", "➡️"]; // Flip Pags

    const timeout = "100000"; // Timeout

    pagination(message, helpPages, flipPage, timeout);
  },
};
