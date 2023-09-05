const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const buttons = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel('Invite')
    .setURL(
      'https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=431644736576&scope=bot%20applications.commands'
    )
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Server')
    .setURL('https://discord.gg/8bY6nFaVEY')
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Vote')
    .setURL('https://top.gg/bot/833535533287866398')
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Website')
    .setURL('https://valostats.netlify.app/')
    .setStyle(ButtonStyle.Link)
);

const helpButtons = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel('Invite')
    .setURL(
      'https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=431644736576&scope=bot%20applications.commands'
    )
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Server')
    .setURL('https://discord.gg/8bY6nFaVEY')
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Vote')
    .setURL('https://top.gg/bot/833535533287866398')
    .setStyle(ButtonStyle.Link),
  new ButtonBuilder()
    .setLabel('Tracker.gg')
    .setURL('https://tracker.gg/valorant')
    .setStyle(ButtonStyle.Link)
);

const voteButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel('Click me to vote!')
    .setURL('https://top.gg/bot/833535533287866398')
    .setStyle(ButtonStyle.Link)
);

module.exports = { buttons, helpButtons, voteButton };
