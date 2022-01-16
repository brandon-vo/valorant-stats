const { Collector } = require('discord.js');
const Collection = require('discord.js').Collection;
const { Events } = require('discord.js').Constants;

class MenuCollector extends Collector {
  constructor(data, filter, options = {}) {
    super(data.client, filter, options);

    this.message = data;

    this.users = new Collection();

    this.total = 0;

    this.empty = this.empty.bind(this);
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this);

    this.client.incrementMaxListeners();
    this.client.on('clickMenu', this.handleCollect);
    this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);
    this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);

    this.once('end', () => {
      this.client.removeListener('clickMenu', this.handleCollect);
      this.client.removeListener(Events.MESSAGE_DELETE, this._handleMessageDeletion);
      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });

    this.on('collect', async (menu) => {
      this.total++;
      if (!menu.clicker.user) await menu.clicker.fetch();
      this.users.set(menu.clicker.user.id, menu.clicker.user);
    });
  }

  collect(menu) {
    if (this.message) {
      return menu.message.id === this.message.id ? menu.discordID : null;
    }
    return menu.channel.id === this.channel.id ? menu.discordID : null;
  }

  dispose(menu) {
    if (this.message) {
      return menu.message.id === this.message.id ? menu.discordID : null;
    }
    return menu.channel.id === this.channel.id ? menu.discordID : null;
  }

  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  endReason() {
    if (this.options.max && this.total >= this.options.max) return 'limit';
    if (this.options.maxMenus && this.collected.size >= this.options.maxMenus) return 'menuLimit';
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return 'userLimit';
    return null;
  }

  _handleMessageDeletion(message) {
    if (message.id === this.message.id) {
      this.stop('messageDelete');
    }
  }

  _handleChannelDeletion(channel) {
    if (channel.id === this.message.channel.id) {
      this.stop('channelDelete');
    }
  }

  _handleGuildDeletion(guild) {
    if (this.message.guild && guild.id === this.message.guild.id) {
      this.stop('guildDelete');
    }
  }
}

module.exports = MenuCollector;
