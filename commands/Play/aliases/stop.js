module.exports =  (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if (server_queue.connection.dispatcher){
        server_queue.songs = [];
        server_queue.connection.dispatcher.destroy();
        server_queue.voice_channel.leave();
    }
    else{
        server_queue.connection.disconnect();
        server_queue.voice_channel.leave();
    } 
}