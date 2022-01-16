const { APIMessage: dAPIMessage, MessageEmbed } = require('discord.js');
const { MessageComponentTypes } = require('../Constants.js');
const MessageActionRow = require('./MessageActionRow');
const MessageButton = require('./MessageButton');
const MessageMenu = require('./MessageMenu');

class APIMessage extends dAPIMessage {
  resolveData() {
    if (this.data) {
      return this;
    }

    super.resolveData();

    if (this.options.content instanceof MessageEmbed) {
      this.data.embed = this.options.content;
      this.data.embeds.push(this.options.content);
      this.data.content = undefined;
    }

    let components = [];
    let hasActionRow = false;
    let hasComponent = false;
    if (MessageComponentTypes[this.options.type]) {
      hasComponent = true;
      if (this.options.type === MessageComponentTypes.ACTION_ROW) {
        components.push(new MessageActionRow(this.options));
        hasActionRow = true;
      } else if (this.options.type === MessageComponentTypes.BUTTON || this.options.type === MessageComponentTypes.SELECT_MENU) {
        components.push(new MessageActionRow().addComponents(this.options));
      }
    }

    if (this.options.component) {
      hasComponent = true;
      if (Array.isArray(this.options.component)) {
        if (hasActionRow === false) {
          let buttons = [];
          this.options.component.map((c) => {
            if (c instanceof MessageActionRow) {
              components.push(new MessageActionRow(c));
            } else if (c instanceof MessageButton) {
              buttons.push(c);
            } else if (c instanceof MessageMenu) {
              components.push(new MessageActionRow().addComponent(c));
            }
          });
          if (buttons.length > 0) components.push(new MessageActionRow().addComponents(buttons));
        }
      } else {
        let buttons = [];
        if (this.options.component instanceof MessageActionRow) {
          components.push(new MessageActionRow(this.options.component));
        } else if (this.options.component instanceof MessageButton) {
          buttons.push(this.options.component);
        } else if (this.options.component instanceof MessageMenu) {
          components.push(new MessageActionRow().addComponent(this.options.component));
        }
        if (buttons.length > 0) components.push(new MessageActionRow().addComponents(buttons));
      }
    }

    if (this.options.components) {
      hasComponent = true;
      if (Array.isArray(this.options.components)) {
        if (hasActionRow === false) {
          let buttons = [];
          this.options.components.map((c) => {
            if (c instanceof MessageActionRow) {
              components.push(new MessageActionRow(c));
            } else if (c instanceof MessageButton) {
              buttons.push(c);
            } else if (c instanceof MessageMenu) {
              components.push(new MessageActionRow().addComponent(c));
            }
          });
          if (buttons.length > 0) components.push(new MessageActionRow().addComponents(buttons));
        }
      } else {
        let buttons = [];
        if (this.options.components instanceof MessageActionRow) {
          components.push(new MessageActionRow(this.options.components));
        } else if (this.options.components instanceof MessageButton) {
          buttons.push(this.options.components);
        } else if (this.options.components instanceof MessageMenu) {
          components.push(new MessageActionRow().addComponent(this.options.components));
        }
        if (buttons.length > 0) components.push(new MessageActionRow().addComponents(buttons));
      }
    }

    if (this.options.buttons) {
      hasComponent = true;
      components.push(new MessageActionRow().addComponents(this.options.buttons));
    }

    if (this.options.button) {
      hasComponent = true;
      components.push(new MessageActionRow().addComponents(this.options.button));
    }

    if (this.options.menus) {
      hasComponent = true;
      Array.isArray(this.options.menus)
        ? this.options.menus.map((m) => components.push(new MessageActionRow().addComponent(m)))
        : components.push(new MessageActionRow().addComponent(this.options.menus));
    }

    if (this.options.menu) {
      hasComponent = true;
      Array.isArray(this.options.menu)
        ? this.options.menu.map((m) => components.push(new MessageActionRow().addComponent(m)))
        : components.push(new MessageActionRow().addComponent(this.options.menu));
    }

    if (
      this.options.components === null ||
      this.options.component === null ||
      this.options.buttons === null ||
      this.options.button === null ||
      this.options.menus === null ||
      this.options.menu === null
    ) {
      hasComponent = true;
      components = [];
    }

    if (components.length > 5) components.length = 5;

    if (typeof components.length == 'number' && hasComponent === true) this.data.components = components.length === 0 ? [] : components;

    return this;
  }
}

class sendAPICallback extends APIMessage {
  resolveData() {
    if (this.data) {
      return this;
    }

    super.resolveData();

    if (this.options.flags) {
      this.data.flags = parseInt(this.options.flags);
    }

    if (typeof this.options.ephemeral === 'boolean' && this.options.ephemeral === true) {
      this.data.flags = 1 << 6;
    }

    return this;
  }
}

module.exports = {
  APIMessage,
  sendAPICallback,
};
