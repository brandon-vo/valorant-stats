const { EmbedBuilder } = require('discord.js');
const { getRow, editGetRow, timeout } = require('../components/pages');
const { buttons } = require('../components/buttons');

async function handlePages(interaction, embeds, author) {
  const pages = {};
  const randomID = Math.floor(Math.random() * 99999999);

  let collector;
  const id = interaction.user.id;
  pages[id] = pages[id] || 0;
  const embed = embeds[pages[id]];

  const filter = (i) => i.user.id === interaction.user.id;

  let navButtons = getRow(id, pages, embeds, randomID);

  if (typeof navButtons === 'number') {
    const cooldownEmbed = new EmbedBuilder()
      .setColor('#11806A')
      .setAuthor(author)
      .setThumbnail(author.userAvatar)
      .addFields({
        name: ':warning: You are on cooldown!',
        value: 'Please wait ' + navButtons + ' more seconds before using this command.',
      });

    return await interaction.editReply({
      embeds: [cooldownEmbed],
      components: [buttons],
      ephemeral: true,
    });
  }

  reply = await interaction.editReply({
    embeds: [embed],
    components: [navButtons],
    fetchReply: true,
  });
  collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: timeout,
  });

  collector.on('collect', (btnInt) => {
    if (!btnInt) {
      return;
    }
    btnInt.deferUpdate();
    if (btnInt.customId !== 'previous' + randomID && btnInt.customId !== 'next' + randomID) {
      return;
    }
    if (btnInt.customId === 'previous' + randomID && pages[id] > 0) {
      pages[id]--;
    } else if (btnInt.customId === 'next' + randomID && pages[id] < embeds.length - 1) {
      pages[id]++;
    }
    if (reply) {
      interaction.editReply({
        embeds: [embeds[pages[id]]],
        components: [editGetRow(id, pages, embeds, randomID)],
      });
    }
  });

  // Disable arrow buttons after timeout done
  collector.on('end', () => {
    interaction.editReply({
      embeds: [embeds[pages[id]]],
      components: [editGetRow(id, pages, embeds, randomID, (timedOut = true))],
    });
  });
}

module.exports = { handlePages };
