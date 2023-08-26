const { MessageActionRow, MessageButton } = require('discord.js');

let count = {};
const timeout = 1000 * 30;

const getRow = (id, pages, embeds, randomID) => {
  const row = new MessageActionRow();

  row.addComponents(
    new MessageButton()
      .setLabel('Vote')
      .setURL('https://top.gg/bot/833535533287866398')
      .setStyle('LINK')
  );
  row.addComponents(
    new MessageButton()
      .setLabel('<')
      .setStyle('SUCCESS')
      .setCustomId('previous' + randomID)
      .setDisabled(pages[id] === 0)
  );
  row.addComponents(
    new MessageButton()
      .setLabel('>')
      .setStyle('SUCCESS')
      .setCustomId('next' + randomID)
      .setDisabled(pages[id] === embeds.length - 1)
  );
  row.addComponents(
    new MessageButton()
      .setLabel('Website')
      .setURL('https://valostats.netlify.app/')
      .setStyle('LINK')
  );

  if (count[id]) {
    let timeLeft = Math.round(timeout / 1000 - (new Date().getTime() - count[id]) / 1000);
    return timeLeft;
  }

  count[id] = new Date().getTime();

  setTimeout(() => (count[id] = null), timeout);

  return row;
};

const editGetRow = (id, pages, embeds, randomID) => {
  const row = new MessageActionRow();

  row.addComponents(
    new MessageButton()
      .setLabel('Vote')
      .setURL('https://top.gg/bot/833535533287866398')
      .setStyle('LINK')
  );
  row.addComponents(
    new MessageButton()
      .setLabel('<')
      .setStyle('SUCCESS')
      .setCustomId('previous' + randomID)
      .setDisabled(pages[id] === 0)
  );
  row.addComponents(
    new MessageButton()
      .setLabel('>')
      .setStyle('SUCCESS')
      .setCustomId('next' + randomID)
      .setDisabled(pages[id] === embeds.length - 1)
  );
  row.addComponents(
    new MessageButton()
      .setLabel('Website')
      .setURL('https://valostats.netlify.app/')
      .setStyle('LINK')
  );

  return row;
};

module.exports = { getRow, editGetRow, timeout };
