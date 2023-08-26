const { MessageEmbed } = require('discord.js');

// Used for mullti-page embeds
const createEmbed = (title, fields, author) => {
  return new MessageEmbed()
    .setColor('#11806A')
    .setTitle(title)
    .setAuthor(author)
    .setThumbnail(author.iconURL)
    .addFields(fields);
};

module.exports = { createEmbed };
