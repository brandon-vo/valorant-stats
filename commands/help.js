const { MessageEmbed } = require("discord.js");
const pagination = require("discord.js-pagination");

module.exports = {
  name: "help",
  description: "Display avaliable commands and other helpful information to the user.",

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
            "2. Track your Valorant stats with the following commands\n```" +
            "```yaml\n" +
            "         Test Server: https://discord.gg/8bY6nFaVEY" +
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
          name: "<:normal:840652327160381460> Competitive Stats `v!stats username#tag` | `v!comp username#tag`",
          value: "Display competitive career stats of a user",
        },
        {
          name: "<:normal:840652327160381460> Unrated Stats `v!unrated username#tag`",
          value: "Display unrated career stats of a user",
        },
        {
          name: "<:spikerush:840652327447035934> Spike Rush Stats `v!sr username#tag` | `v!spikerush username#tag`",
          value: "Display unrated career stats of a user",
        },
        {
          name: "<:deathmatch:840652327231946803> Deathmatch Stats `v!dm username#tag` | `v!deathmatch username#tag`",
          value: "Display deathmatch career stats of a user",
        },
        {
          name: "<:escalation:840652327139540993> Escalation Stats `v!escalation username#tag`",
          value: "Display escalation career stats of a user",
        },
        {
          name: ":leftwards_arrow_with_hook: Last Game `v!lm username#tag`",
          value: "Display last match information of a user",
        },
        {
          name: "<:jett:839142770576851006> Agents Played `v!agent username#tag`",
          value: "Display competitive agent stats of a user",
        },
        {
          name: "<:vandal:861082251508580394> Weapon Stats `v!weapon username#tag`",
          value: "Display competitive weapon stats of a user",
        },
        {
          name: "<:ascent:854916943194619934> Map Stats `v!map username#tag`",
          value: "Display competitive map stats of a user"
        },
        {
          name: ":link: Link Account `v!link username#tag` | `v!unlink` | `v!linked`",
          value: "Link/Unlink a Valorant account to/from your Discord ID",
        },
        {
          name: ":e_mail: Invite Link `v!invite`",
          value: "Get Discord bot invite link",
        },
        { name: ":white_circle: Extra `v!ping` | `v!help`", value: "\u200B" }
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
          name: "Notes",
          value:
            "- The bot must have access to the default permissions in order to function properly\n" + 
            "- You can view stats of a linked user by mentioning their username in the command",
        },
        { name: "KDR", value: "kills ÷ deaths", inline: true },
        { name: "KDA", value: "(kills + (assists ÷ 2)) ÷ deaths", inline: true },
        { name: "KAD", value: "(kills + assists) ÷ deaths", inline: true },
        { name: "Known Bugs", value: "Stats not being retrieved - Try Again", inline: true },
        { name: "Found Bugs? ", value: "Contact CMDRVo#3496 on Discord", inline: true  },
        { name: "Common Mistake", value: "When linking an account to your Discord ID, you must type the command properly.\n" +
        "Do not include `< >` in between your username and tag. Not case sensitive.\n" + 
        "Command: `v!link username#tag`" + "\n" + "Examples: `v!link sen tenz#0505` `v!link CMDRVo#CMDR` `v!link 100t aSUnA#1111`"},
      )
      .setTimestamp();

    const helpPages = [helpEmbed1, helpEmbed2]; // Pages

    const flipPage = ["⬅️", "➡️"]; // Flip Pags

    const timeout = "100000"; // Timeout

    pagination(message, helpPages, flipPage, timeout);
  },
};
