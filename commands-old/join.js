module.exports = {
    name: "join",
    description: "Joins users voice channel",

    execute(message) {

        var voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) return message.reply('You are not in a voice channel');

        voiceChannel.join()
    }

}