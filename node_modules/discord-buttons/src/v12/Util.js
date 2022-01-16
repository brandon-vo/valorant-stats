const { MessageButtonStyles, MessageButtonStylesAliases, MessageComponentTypes } = require('./Constants');

class Util extends null {
  static resolveStyle(style, turnit) {
    if (!style) throw new TypeError('NO_BUTTON_STYLE: Please provide a button style.');

    if (style === 'gray') style = 'grey';

    if (!MessageButtonStyles[style] && !MessageButtonStylesAliases[style])
      throw new TypeError('INVALID_BUTTON_STYLE: An invalid button style was provided.');

    if (typeof style === (turnit ? 'string' : 'number')) return style;

    return MessageButtonStyles[style] ? MessageButtonStyles[style] : MessageButtonStylesAliases[style];
  }

  static checkButton(data) {
    if (data.type !== MessageComponentTypes.BUTTON) throw new TypeError('INVALID_BUTTON_TYPE: Invalid type.');

    if (!data.style) throw new TypeError('NO_BUTTON_STYLE: Please provide a button style.');

    if (!data.label && !data.emoji) throw new TypeError('NO_BUTTON_LABEL_AND_EMOJI: Please provide a button label and/or an emoji.');

    if ('disabled' in data && typeof data.disabled !== 'boolean')
      throw new TypeError('BUTTON_DISABLED: The button disabled option must be a boolean type. (true/false)');

    if (data.style === MessageButtonStyles['url'] && !data.url)
      throw new TypeError('NO_BUTTON_URL: You provided a url style, but did not provide a URL.');

    if (data.style !== MessageButtonStyles['url'] && data.url) throw new TypeError('BUTTON_STYLE_MISMATCH: A url button must have url style.');

    if (data.style === MessageButtonStyles['url'] && data.custom_id)
      throw new TypeError('BOTH_URL_CUSTOM_ID: A custom id and url cannot both be specified.');

    if (data.style !== MessageButtonStyles['url'] && !data.custom_id) throw new TypeError('NO_BUTTON_ID: Please provide a button id');

    return true;
  }

  static checkMenu(data) {
    if (data.type !== MessageComponentTypes.SELECT_MENU) throw new TypeError('INVALID_MENU_TYPE: Invalid type.');

    if (!data.custom_id) throw new Error('NO_MENU_ID: Please provide a menu id.');

    if (typeof data.custom_id != 'string')
      throw new Error(`INVALID_MENU_ID: The typeof MessageMenu.id must be a string, received ${typeof data.custom_id} instead.`);

    if (data.custom_id.length > 100)
      throw new Error(
        `TOO_MANY_CHARACTERS_OF_MENU_ID: The maximum length of MessageMenu.id is 100 characters, received ${data.custom_id.length} instead.`,
      );

    if (data.placeholder && typeof data.placeholder != 'string')
      throw new Error(`INVALID_MENU_PLACEHOLDER: The typeof MessageMenu.placeholder must be a string, received ${typeof data.placeholder} instead.`);

    if (data.placeholder && data.placeholder.length > 100)
      throw new Error(
        `TOO_MANY_CHARACTERS_OF_MENU_PLACEHOLDER: The maximum length of MessageMenu.placeholder is 100 characters, received ${data.placeholder.length} instead.`,
      );

    if (data.min_values && typeof data.min_values != 'number')
      throw new Error(`INVALID_MENU_MIN_VALUES: The typeof MessageMenu.minValues must be a number, received ${typeof data.min_values} instead.`);

    if (data.min_values && (data.min_values > 25 || data.min_values < 0))
      throw new Error(`INVALID_MENU_MIN_VALUES: MessageMenu.minValues must be above 0 and below 25.`);

    if (typeof data.disabled != 'boolean')
      throw new Error(`INVALID_MENU_DISABLED_OPTION: The typeof MessageMenu.disabled must be boolean, received ${typeof data.disabled} instead.`);

    this.checkMenuOptions(data.options);

    return true;
  }

  static checkMenuOptions(data) {
    if (!Array.isArray(data)) throw new Error('INVALID_OPTIONS: The select menu options must be an array.');

    if (data.length < 1) throw new Error('TOO_LITTLE_MENU_OPTIONS: Please provide at least one MessageMenu option.');

    if (data.length > 25) throw new Error(`TOO_MUCH_MENU_OPTIONS: The limit of MessageMenu.options is 25, you provided ${options.length} options.`);

    let hasDefault = false;
    data.map((d) => {
      if (!d.label) throw new Error('NO_MENU_LABEL: Please provide a menu label.');

      if (typeof d.label != 'string')
        throw new Error(`INVALID_MENU_LABEL: The typeof MessageMenuOption.label must be a string, received ${typeof d.label} instead.`);

      if (d.label.length > 25)
        throw new Error(
          `TOO_MANY_CHARACTERS_OF_MENU_LABEL: The maximum length of MessageMenuOption.label is 25 characters, received ${d.label.length} instead.`,
        );

      if (!d.value) throw new Error('NO_MENU_VALUE: Please provide a menu value.');

      if (typeof d.value != 'string')
        throw new Error(`INVALID_MENU_VALUE: The typeof MessageMenuOption.value must be a string, received ${typeof d.value} instead.`);

      if (d.value.length > 100)
        throw new Error(
          `TOO_MANY_CHARACTERS_OF_MENU_VALUE: The maximum length of MessageMenuOption.value is 100 characters, received ${d.value.length} instead.`,
        );

      if (d.description && typeof d.description != 'string')
        throw new Error(
          `INVALID_MENU_OPTION_DESCRIPTION: The typeof MessageMenuOption.description must be a string, received ${typeof d.description} instead.`,
        );

      if (d.description && d.description.length > 50)
        throw new Error(
          `TOO_MANY_CHARACTERS_OF_MENU_DESCRIPTION: The maximum length of MessageMenuOption.description is 100 characters, received ${d.description.length} instead.`,
        );

      if (typeof d.default != 'boolean')
        throw new Error(`INVALID_MENU_DEFAULT_OPTION: The typeof MessageMenu.default must be boolean, received ${typeof d.default} instead.`);

      return d;
    });

    return true;
  }

  static resolveType(type) {
    return typeof type === 'string' ? MessageComponentTypes[type] : type;
  }

  static resolveMenuValues(m1, m2) {
    return m2 === undefined ? m1 : m2;
  }

  static resolveEmoji(emoji, animated) {
    if (!emoji) return {};
    if (typeof emoji === 'string')
      return /^\d{17,19}$/.test(emoji) ? { id: emoji, animated: typeof animated === 'boolean' ? animated : false } : this.parseEmoji(emoji, animated);
    if (!emoji.id && !emoji.name) return null;
    if (typeof animated === 'boolean') emoji.animated = animated;
    return emoji;
  }

  static parseEmoji(emoji, animated) {
    if (emoji.includes('%')) emoji = decodeURIComponent(text);
    if (!emoji.includes(':')) return { animated: typeof animated === 'boolean' ? animated : false, name: emoji, id: null };
    const match = emoji.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
    return match && { animated: typeof animated === 'boolean' ? animated : Boolean(match[1]), name: match[2], id: match[3] || null };
  }

  static verifyString(data, allowEmpty = true, errorMessage = `Expected a string, got ${data} instead.`, error = Error) {
    if (typeof data !== 'string') throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
  }
}

module.exports = Util;
