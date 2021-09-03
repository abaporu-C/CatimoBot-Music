module.exports = (message, server_queue) => {
    if(!server_queue.connection) message.channel.send('There is no music playing right now!');
    else if(!message.member.voice.channel) message.channel.send('You have to be in a voice channel to execute this command.')
    else if(!server_queue.playing) message.channel.send('The music is already paused.')
    else{        
        server_queue.audio_player.pause();
        server_queue.playing = false;
        message.channel.send('The music was paused!');
    }
}