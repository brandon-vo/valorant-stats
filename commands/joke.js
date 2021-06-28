const fetch = require('node-fetch')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: "joke",
  description: "Display a joke to a user",
  async execute(message) {

    let joke = await fetch('http://official-joke-api.appspot.com/random_joke').then(res => res.json())

    const jokeEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setTitle(`Here is your joke`)
      .addFields(
        { name: 'Setup', value: "`" + joke.setup + "`" },
        { name: 'Punchline', value: "`" + joke.punchline + "`" },
      )
      .setTimestamp()

    message.channel.send(jokeEmbed);

  }
}