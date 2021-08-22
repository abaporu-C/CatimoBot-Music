module.exports =  (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if (server_queue.connection.dispatcher){
        server_queue.songs = [];
        server_queue.connection.dispatcher.destroy();
    }
    else server_queue.connection.disconnect();
}