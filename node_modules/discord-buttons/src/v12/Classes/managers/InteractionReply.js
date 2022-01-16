const { InteractionReplyTypes } = require('../../Constants');
const { sendAPICallback } = require('../APIMessage');
const ButtonCollector = require('../ButtonCollector');
const MenuCollector = require('../MenuCollector');

class InteractionReply {
  constructor(client, component, webhook) {
    this.client = client;

    this.component = component;

    this.webhook = webhook;

    this.has = false;

    this.isEphemeral = false;

    this.message = undefined;
  }

  send = async (content, options) => {
    if (this.has) throw new Error('BUTTON_ALREADY_REPLIED: This button already has already been replied to.');

    if (options === null && options !== undefined) options = { components: null };

    if (typeof options === 'boolean' && options === true) options = { flags: 1 << 6 };

    let apiMessage;
    if (content instanceof sendAPICallback) {
      apiMessage = content.resolveData();
    } else {
      apiMessage = sendAPICallback.create(this, content, options).resolveData();
    }

    if (Array.isArray(apiMessage.data.content)) {
      apiMessage.data.content = apiMessage.data.content[0];
    }

    const { data, files } = await apiMessage.resolveFiles();

    if (data.flags === 1 << 6) this.isEphemeral = true;

    await this.client.api.interactions(this.component.discordID, this.component.token).callback.post({
      data: {
        data: data,
        type: InteractionReplyTypes.CHANNEL_MESSAGE_WITH_SOURCE,
      },
      files,
    });
    this.has = true;
    return this;
  };

  edit = async (content, options) => {
    if (!this.has) throw new Error('BUTTON_HAS_NO_REPLY: This button does not have a reply.');

    if (options === null && options !== undefined) options = { components: null };

    return await this.webhook.editMessage('@original', content, options);
  };

  defer = async (ephemeral = false) => {
    if (this.has) throw new Error('BUTTON_ALREADY_REPLIED: This button already has already been replied to.');

    if (ephemeral) this.isEphemeral = true;

    await this.client.api.interactions(this.component.discordID, this.component.token).callback.post({
      data: {
        data: {
          flags: ephemeral ? 1 << 6 : null,
        },
        type: InteractionReplyTypes.DEFFERED_UPDATE_MESSAGE,
      },
    });
    this.has = true;
    return this;
  };

  think = async (ephemeral = false) => {
    if (this.has) throw new Error('BUTTON_ALREADY_REPLIED: This button already has already been replied to.');

    if (ephemeral) this.isEphemeral = true;

    await this.client.api.interactions(this.component.discordID, this.component.token).callback.post({
      data: {
        data: {
          flags: ephemeral ? 1 << 6 : null,
        },
        type: InteractionReplyTypes.DEFFERED_CHANNEL_MESSAGE_WITH_SOURCE,
      },
    });
    this.has = true;
    return this;
  };

  fetch = async () => {
    if (this.isEphemeral) throw new Error('REPLY_EPHEMERAL: The reply of this button is ephemeral.');
    this.message = this.webhook.fetchMessage('@original').then((d) => this.client.actions.MessageCreate.handle(d).message);
    return this.message;
  };

  delete = async () => {
    if (!this.has) throw new Error('BUTTON_HAS_NO_REPLY: This button does not have a reply.');
    if (this.isEphemeral) throw new Error('REPLY_EPHEMERAL: The reply of this button is ephemeral.');
    return await this.webhook.deleteMessage('@original');
  };
}

module.exports = InteractionReply;
