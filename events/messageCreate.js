const { buttons } = require('../components/buttons');
const { useSlashEmbed } = require('../components/embeds');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

    if (message.content.startsWith(process.env.PREFIX)) {
      return message.channel.send({
        embeds: [useSlashEmbed],
        components: [buttons],
      });
    }

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find((a) => a.aliases && a.aliases.includes(commandName));

    try {
      command.execute(message, args, commandName);
    } catch (error) {
      console.error(error);
    }
  },
};
