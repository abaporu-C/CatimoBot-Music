module.exports = {
    name: 'leave',
    description: 'Bot leaves voice channel',
    args: false,
    execute(message, args){
        voiceChannel = message.member.voice.channel;

        if(!voiceChannel) return message.channel.send('You need to be on a voice channel to stop the music');

        voiceChannel.leave();

        message.reply(`:vulcan: Tenha uma vida longa e prospera!`)
    }
}