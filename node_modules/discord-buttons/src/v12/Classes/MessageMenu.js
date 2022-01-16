const { MessageComponentTypes } = require('../Constants.js');
const Util = require('../Util');
const MessageMenuOption = require('./MessageMenuOption');

class MessageMenu {
  constructor(data = {}, turnit) {
    this.setup(data, turnit);
  }

  setup(data, turnit = false) {
    this.type = MessageComponentTypes.SELECT_MENU;

    this.placeholder = 'placeholder' in data ? data.placeholder : null;

    if (turnit) this.maxValues = data.max_values;
    else this.max_values = data.maxValues || data.max_values;

    if (turnit) this.minValues = data.min_values;
    else this.min_values = data.minValues || data.min_values;

    this.disabled = typeof data.disabled === 'boolean' ? data.disabled : false;

    if (turnit) this.hash = data.hash;

    this.options = [];
    if ('option' in data) {
      this.options.push(new MessageMenuOption(data.option));
    }

    if ('options' in data) {
      data.options.map((c) => {
        this.options.push(new MessageMenuOption(c));
      });
    }

    let id;
    if (data.id || data.custom_id) id = data.id || data.custom_id;

    turnit ? (this.id = id) : (this.custom_id = id);

    return this;
  }

  setPlaceholder(label) {
    this.placeholder = label;
    return this;
  }

  setID(id) {
    this.custom_id = Util.verifyString(id);
    return this;
  }

  setMaxValues(number) {
    this.max_values = number;
    return this;
  }

  setMinValues(number) {
    this.min_values = number;
    return this;
  }

  setDisabled(disable = true) {
    this.disabled = typeof disable === 'boolean' ? disable : true;
    return this;
  }

  addOption(option) {
    this.options.push(new MessageMenuOption(option));
    return this;
  }

  addOptions(...options) {
    this.options.push(...options.flat(Infinity).map((c) => new MessageMenuOption(c)));
    return this;
  }

  removeOptions(index, deleteCount) {
    this.components.splice(index, deleteCount);
    return this;
  }

  toJSON() {
    return {
      type: MessageComponentTypes.SELECT_MENU,
      placeholder: this.placeholder,
      custom_id: this.custom_id,
      max_values: this.max_values,
      min_values: this.min_values,
      options: this.options,
      disabled: this.disabled || false,
    };
  }
}

module.exports = MessageMenu;
