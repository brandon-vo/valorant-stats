const { MessageActionRow, MessageButton } = require('discord.js');

const buttons = new MessageActionRow().addComponents(
    new MessageButton()
        .setLabel("Invite")
        .setURL("https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=431644736576&scope=bot%20applications.commands")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Server")
        .setURL("https://discord.gg/8bY6nFaVEY")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Vote")
        .setURL("https://top.gg/bot/833535533287866398")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Website")
        .setURL("https://valostats.netlify.app/")
        .setStyle("LINK"),
);

const helpButtons = new MessageActionRow().addComponents(
    new MessageButton()
        .setLabel("Invite")
        .setURL("https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=431644736576&scope=bot%20applications.commands")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Server")
        .setURL("https://discord.gg/8bY6nFaVEY")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Vote")
        .setURL("https://top.gg/bot/833535533287866398")
        .setStyle("LINK"),
    new MessageButton()
        .setLabel("Tracker.gg")
        .setURL("https://tracker.gg/valorant")
        .setStyle("LINK"),
);

module.exports = { buttons, helpButtons };