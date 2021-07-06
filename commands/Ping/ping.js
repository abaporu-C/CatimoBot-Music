module.exports = {
    name: 'ping',
    description: 'tutorial',
    execute(message, args){
        message.channel.send('Pong!');
    }
}