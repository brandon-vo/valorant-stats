module.exports = {
    name: "leave",
    description: "Leaves users voice channel",

    execute(message) {

        var voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) return message.reply('You are not in the same voice channel as me');

        voiceChannel.leave()
    }

}