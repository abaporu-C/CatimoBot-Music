module.exports =  (message, server_queue) => {
    if(server_queue){
        let songList = "The song list is:\n";
        for(let i = 0; i < server_queue.songs.length; i++){
            songList += `${(i + 1)} - ${server_queue.songs[i].title}\n`; 
        }
        message.channel.send(songList);
    } else{
        message.channel.send("There is no queue yet! Use the <^play> command to add one song to the song queue!")
    }
}