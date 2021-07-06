const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');

const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop', 'list', 'drop', 'loop', 'pause', 'resume'], 
    cooldown: 0,
    description: 'Advanced music bot',
    async execute(message, args, cmd, client){


        //Checking for the voicechannel and permissions.
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissions');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissions');

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id);

        //If the user has used the play command
        if (cmd === 'play'){
            if (!args.length) return message.channel.send('You need to send the second argument!');
            let song = {};

            //If the first argument is a link. Set the song object to have two keys. Title and URl.
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                //If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                } else {
                     message.channel.send('Error finding video.');
                }
            }

            //If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: [],
                    playing: true,
                    loopall: false,
                    loopone: false
                }
                
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                //Establish a connection and play the song with the vide_player function.
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting!');
                    throw err;
                }
            } else{
                server_queue.songs.push(song);
                return message.channel.send(`👍 **${song.title}** added to queue!`);
            }
        }

        else if(cmd === 'skip'){
            skip_song(message, server_queue)
        }
        else if(cmd === 'stop') {
            stop_song(message, server_queue);
        }
        else if(cmd === 'list') {
            list_queue(message, server_queue);
        }
        else if(cmd === 'drop') {
            drop_song(message, args, server_queue)
        }
        else if(cmd === 'loop') {
            loop_song(message, args, server_queue);
        }
        else if(cmd === 'resume') {
            resume_queue(message, server_queue);
        }
        else if(cmd === 'pause') {
            pause_queue(message, server_queue);
        }
    }
    
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = await ytdl(song.url);
    song_queue.connection.play(stream, { seek: 0, volume: 0.5, type: 'opus' })
    .on('finish', () => {
        if(song_queue.loopone){
            video_player(guild, song_queue.songs[0]);
        }
        else if (song_queue.loopall){
            song_queue.songs.push(song_queue.songs[0])
            song_queue.songs.shift(song_queue.songs[0]);
        }
        else{
            song_queue.songs.shift();
        }
        video_player(guild, song_queue.songs[0])        
    });
    await song_queue.text_channel.send(`🎶 Now playing **${song.title}**`)
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue){
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}

const list_queue = (message, server_queue) => {
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

const drop_song = (message, args, server_queue) => {
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
        for(let i = 0; i < server_queue.songs.length; i++){
            if(parseInt(args[0]) - 1 != i) {
                newQueue.push(server_queue.songs[i])
            }
        }
        server_queue.songs = newQueue;
    }
}

const loop_song = (message, args, server_queue) => {
    if(!server_queue.connection) message.channel.send('There is no music playing!')
    if(!message.member.voice.channel) message.channel.send('You have to be in a voice channel to execute this command!')
    else{
        switch(args[0].toLowerCase()){ 
            case 'all':
                server_queue.loopall = !server_queue.loopall;
                server_queue.loopone = false;
    
                if(server_queue.loopall) message.channel.send('Loop all has been turned on!');
                else message.channel.send('Loop all has been turned off!');
    
                break;
            case 'one':
                server_queue.loopone = !server_queue.loopone;
                server_queue.loopall = false;
                
                if(server_queue.loopone) message.channel.send('Loop one has been turned on!');
                else message.chanel.send('Loop one has been turned off!')
    
                break;
            case 'off':
                server_queue.loopall = false;
                server_queue.loopone = false;
                
                message.channel.send('Loop function turned off!');
    
                break;
            default:
                message.channel.send('Specify which kind of loop you want to switch.')
        }
    }
}

const pause_queue = (message, server_queue) => {
    if(!server_queue.connection) message.channel.send('There is no music playing right now!');
    else if(!message.member.voice.channel) message.channel.send('You have to be in a voice channel to execute this command.')
    else if(!server_queue.playing) message.channel.send('The music is already paused.')
    else{        
        server_queue.connection.dispatcher.pause();
        server_queue.playing = false;
        console.log(server_queue)
        message.channel.send('The music was paused!');
    }
}

const resume_queue = (message, server_queue) => {
    if(!server_queue.connection) message.channel.send('There is no music playing right now!');
    else if(!message.member.voice.channel) message.channel.send('You have to be in a voice channel to execute this command.')
    else if(server_queue.playing) message.channel.send('The music is already playing.')
    else{
        server_queue.connection.dispatcher.resume();
        server_queue.playing = true;
        console.log(server_queue);
        message.channel.send('The music will continue now!');
    }
}