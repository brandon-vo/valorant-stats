module.exports = {
	name: 'ping',
	description: 'Ping command to test bot response',
	async execute(message) {
		var sendMessage = await message.channel.send('Pong! :ping_pong:');
		sendMessage.edit(`Hello, ${message.member.user}`);
		message.react('✅')
	},
};