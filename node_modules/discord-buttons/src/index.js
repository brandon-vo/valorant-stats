const { Structures, Client } = require('discord.js');
const MessageComponent = require('./v12/Classes/MessageComponent');
const TextChannel = require('./v12/Classes/TextChannel');
const DMChannel = require('./v12/Classes/DMChannel');
const NewsChannel = require('./v12/Classes/NewsChannel');
const Message = require('./v12/Classes/Message');
const { MessageComponentTypes } = require('./v12/Constants');

var version = require('discord.js').version.split('');
if (version.includes('(')) version = version.join('').split('(').pop().split('');
version = parseInt(version[0] + version[1]);

module.exports = (client) => {
  if (version != 12) {
    throw new Error('Your discord.js version must be v12 or higher.');
  }

  if (!(client instanceof Client)) throw new Error('INVALID_CLIENT_PROVIDED: Your discord.js Client is invalid or has not been provided.');

  const message = Structures.get('Message');
  if (!message.createButtonCollector || typeof message.createButtonCollector !== 'function') {
    Structures.extend('TextChannel', () => TextChannel);
    Structures.extend('DMChannel', () => DMChannel);
    Structures.extend('NewsChannel', () => NewsChannel);
    Structures.extend('Message', () => Message);
  }

  client.ws.on('INTERACTION_CREATE', (data) => {
    if (!data.data.component_type) return;

    switch (data.data.component_type) {
      case MessageComponentTypes.BUTTON:
        client.emit('clickButton', new MessageComponent(client, data));
        break;

      case MessageComponentTypes.SELECT_MENU:
        client.emit('clickMenu', new MessageComponent(client, data, true));
        break;

      default:
        client.emit('debug', `Unknown interaction component type, ${data.data.component_type}`);
        break;
    }
  });
};

module.exports.multipleImport = (...clients) => {
  if (version != 12) {
    throw new Error('Your discord.js version must be v12 or higher.');
  }

  const message = Structures.get('Message');
  if (!message.createButtonCollector || typeof message.createButtonCollector !== 'function') {
    Structures.extend('TextChannel', () => TextChannel);
    Structures.extend('DMChannel', () => DMChannel);
    Structures.extend('NewsChannel', () => NewsChannel);
    Structures.extend('Message', () => Message);
  }

  clients.forEach((client) => {
    if (!(client instanceof Client)) throw new Error('INVALID_CLIENT_PROVIDED: Your discord.js Client is invalid or has not been provided.');

    client.ws.on('INTERACTION_CREATE', (data) => {
      if (!data.data.component_type) return;

      switch (data.data.component_type) {
        case MessageComponentTypes.BUTTON:
          client.emit('clickButton', new MessageComponent(client, data));
          break;

        case MessageComponentTypes.SELECT_MENU:
          client.emit('clickMenu', new MessageComponent(client, data, true));
          break;
        default:
          client.emit('debug', `Unknown interaction component type, ${data.data.component_type}`);
          break;
      }
    });
  });
};

module.exports.MessageButton = require(`./v12/Classes/MessageButton`);
module.exports.MessageMenu = require(`./v12/Classes/MessageMenu`);
module.exports.MessageMenuOption = require(`./v12/Classes/MessageMenuOption`);
module.exports.MessageActionRow = require('./v12/Classes/MessageActionRow');
module.exports.MessageComponent = require('./v12/Classes/MessageComponent');
module.exports.Message = Message;
module.exports.ButtonCollector = require(`./v12/Classes/ButtonCollector`);
module.exports.MenuCollector = require(`./v12/Classes/MenuCollector`);
module.exports.APIMessage = require('./v12/Classes/APIMessage').APIMessage;
module.exports.sendAPICallback = require('./v12/Classes/APIMessage').sendAPICallback;
module.exports.DMChannel = DMChannel;
module.exports.NewsChannel = NewsChannel;
module.exports.TextChannel = TextChannel;
module.exports.WebhookClient = require('./v12/Classes/WebhookClient');
module.exports.Util = require('./v12/Util');
module.exports.Constants = require('./v12/Constants');
module.exports.InteractionReply = require(`./v12/Classes/managers/InteractionReply`);
