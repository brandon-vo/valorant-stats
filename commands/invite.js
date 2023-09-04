const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { buttons } = require('../components/buttons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the invite link to this Discord bot'),

  async execute(interaction) {
    const inviteEmbed = new MessageEmbed()
      .setColor('RANDOM')
      .setFooter({ text: 'Developed by CMDRVo' })
      .addFields({
        name: 'Invite',
        value:
          '```ansi\n\u001b[2;31m' +
          'https://discord.com/api/oauth2/authorize?client_id=833535533287866398&permissions=431644736576&scope=bot%20applications.commands' +
          '\n```',
        inline: true,
      });

    await interaction.reply({
      embeds: [inviteEmbed],
      components: [buttons],
    });
  },
};
