const { AudioPlayerState } = require('@discordjs/voice')

module.exports = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue){
        return message.channel.send(`There are no songs in queue 😔`);
    }

    server_queue.audio_player.stop();
}