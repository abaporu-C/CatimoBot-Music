module.exports = (message, server_queue) => {
    if(!server_queue.connection) message.channel.send('There is no music playing right now!');
    else if(!message.member.voice.channel) message.channel.send('You have to be in a voice channel to execute this command.')
    else if(server_queue.playing) message.channel.send('The music is already playing.')
    else{
        server_queue.connection.dispatcher.resume();
        server_queue.playing = true;        
        message.channel.send('The music will continue now!');
    }
}