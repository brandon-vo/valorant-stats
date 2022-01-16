const WebhookClient = require('./WebhookClient');
const Message = require('./Message');
const InteractionReply = require('./managers/InteractionReply');
const { InteractionReplyTypes } = require('../Constants');
const { APIMessage } = require('./APIMessage');

class MessageComponent {
  constructor(client, data, menu) {
    this.client = client;

    this.id = data.data.custom_id;

    if (menu) this.values = data.data.values || [];

    this.version = data.version;

    this.token = data.token;

    this.discordID = data.id;

    this.applicationID = data.application_id;

    this.guild = data.guild_id ? client.guilds.cache.get(data.guild_id) : undefined;

    this.channel = client.channels.cache.get(data.channel_id);

    this.clicker = {
      id: data.guild_id ? data.member.user.id : data.user.id,
      user: this.client.users.resolve(data.guild_id ? data.member.user.id : data.user.id),
      member: this.guild ? this.guild.members.resolve(data.member.user.id) : undefined,
      fetch: async () => {
        this.clicker.user = await this.client.users.fetch(data.guild_id ? data.member.user.id : data.user.id);
        if (this.guild) {
          this.clicker.member = await this.guild.members.fetch(data.member.user.id);
        }
        return true;
      },
    };

    this.message = new Message(client, data.message, this.channel);

    this.reply = new InteractionReply(client, this, new WebhookClient(data.application_id, data.token, client.options));

    this.message.update = async function (content, options) {
      if (options === null && options !== undefined) options = { components: null };

      const { data: d } = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this, content, options).resolveData();

      return await this.client.api.interactions(data.id, data.token).callback.post({
        headers: {
          ContentType: 'application/json',
        },
        data: {
          data: d,
          type: InteractionReplyTypes.UPDATE_MESSAGE,
        },
      });
    };
  }
}

module.exports = MessageComponent;
