module.exports =  (message, server_queue, queue, id) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    server_queue.connection.destroy();
    queue.delete(id)
}