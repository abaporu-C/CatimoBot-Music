const skip_song = require('./skip.js');

module.exports =  (message, args, server_queue) => {
    if(!args[0]){
        message.channel.send('You have to call this command with a song number');
    } else if(isNaN(parseInt(args[0])) || parseInt(args[0]) < 1) {
        message.channel.send('You have to enter a NUMBER bigger than zero to drop a song of the list.');
    } else if(parseInt(args[0]) > server_queue.songs.length) {
        message.channel.send('There is no such number in the list.')
    } else if(parseInt(args[0]) === 1){
        skip_song(message, server_queue);
    } else {
        newQueue = [];

        //creates a new song queue without the song dropped.
        for(let i = 0; i < server_queue.songs.length; i++){
            if(parseInt(args[0]) - 1 != i) {
                newQueue.push(server_queue.songs[i])
            }                
        }
                
        server_queue.songs = newQueue;
    }
}