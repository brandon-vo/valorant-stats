const MessageButton = require('./MessageButton');
const MessageMenu = require('./MessageMenu');
const { MessageComponentTypes } = require('../Constants');
const Util = require('../Util');

class MessageActionRow {
  constructor(data = {}, turnit) {
    this.setup(data, turnit);
  }

  setup(data, turnit = false) {
    this._hasMenu = false;
    this._turnit = turnit;

    this.type = MessageComponentTypes.ACTION_ROW;

    this.components = [];
    if ('component' in data) {
      if (data.type === MessageComponentTypes.BUTTON) {
        Util.checkButton(data);
        this.components.push(new MessageButton(data, turnit));
      } else if (data.type === MessageComponentTypes.SELECT_MENU) {
        if (this.components.length > 0) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

        Util.checkMenu(data);
        this.components.push(new MessageMenu(data, turnit));
        this._hasMenu = true;
      }
    }

    if ('components' in data) {
      if (!Array.isArray(data.components))
        throw new Error('INVALID_ACTION_ROW_COMPONENTS: The typeof components of MessageActionRow must be an Array.');

      data.components.map((c) => {
        if (c.type === MessageComponentTypes.BUTTON) {
          if (this._hasMenu) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

          if (this.components.length > 4) throw new Error('TOO_MUCH_COMPONENTS: You can provide 5 buttons per row');

          Util.checkButton(c);
          return this.components.push(new MessageButton(c, turnit));
        } else if (c.type === MessageComponentTypes.SELECT_MENU) {
          if (this.components.length > 0) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

          return this.components.push(new MessageMenu(c, turnit));
        }
      });
    }

    return this;
  }

  addComponents(...components) {
    components.flat(Infinity).map((c) => {
      if (c.type === MessageComponentTypes.BUTTON) {
        if (this._hasMenu) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

        if (this.components.length > 4) throw new Error('TOO_MUCH_COMPONENTS: You can provide 5 buttons per row');

        Util.checkButton(c);
        return this.components.push(new MessageButton(c, this._turnit));
      } else if (c.type === MessageComponentTypes.SELECT_MENU) {
        if (this.components.length > 0) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

        Util.checkMenu(c);
        return this.components.push(new MessageMenu(c, this._turnit));
      }
    });
    return this;
  }

  addComponent(data) {
    if (data.type === MessageComponentTypes.BUTTON) {
      if (this._hasMenu) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

      if (this.components.length > 4) throw new Error('TOO_MUCH_COMPONENTS: You can provide 5 buttons per row');

      Util.checkButton(data);
      this.components.push(new MessageButton(data, this._turnit));
    } else if (data.type === MessageComponentTypes.SELECT_MENU) {
      if (this.components.length > 0) throw new Error('TOO_MUCH_COMPONENTS: You can use 1 select menu per row, without other components.');

      Util.checkMenu(data);
      this.components.push(new MessageMenu(data, this._turnit));
      this._hasMenu = true;
    }
    return this;
  }

  removeComponents(index, deleteCount) {
    this.components.splice(index, deleteCount);
    return this;
  }

  toJSON() {
    return {
      components: this.components,
      type: MessageComponentTypes.ACTION_ROW,
    };
  }
}

module.exports = MessageActionRow;
