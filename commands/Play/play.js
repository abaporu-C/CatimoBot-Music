const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const skip_song = require('./aliases/skip.js');
const stop_song = require('./aliases/stop.js');
const list_queue = require('./aliases/list.js');
const drop_song = require('./aliases/drop.js');
const resume_queue = require('./aliases/resume.js');
const pause_queue = require('./aliases/pause.js');
const loop_song = require('./aliases/loop');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, AudioPlayerStatus } = require('@discordjs/voice');

const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop', 'list', 'drop', 'loop', 'resume', 'pause'], 
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
        let server_queue = queue.get(message.guild.id);

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
                    audio_player: null,
                    songs: [],
                    playing: true,
                    loopall: false,
                    loopone: false
                }
                
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                queue.set(message.guild.id, queue_constructor);            
                queue_constructor.songs.push(song);
    
                //Establish a connection and play the song with the video_player function.
                try {
                    const connection = await joinVoiceChannel({
                        channelId: voice_channel.id,
                        guildId: voice_channel.guild.id,
                        adapterCreator: voice_channel.guild.voiceAdapterCreator,
                    });
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    server_queue = undefined;
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
            stop_song(message, server_queue, queue, message.guild.id);
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

    

    //audio stream
    const stream = await ytdl(song.url, {
        filter: "audioonly",
        fmt: "ebml",
    });

    //audio player creation
    const audio_player = await createAudioPlayer({
        behaviors:{
            noSubscriber: NoSubscriberBehavior.Pause
        }
    });

    //error handling
    audio_player.on('error', async (err) => {
        console.error(err)
        console.log(song_queue)
        await song_queue.text_channel.send(`There was a connection error and the stream was interrupted.`)
        if(song_queue.connection) song_queue.connection.destroy();
        queue.delete(guild.id);
    })

    audio_player.on(AudioPlayerStatus.Idle, async () => {
                
        
        if (song_queue.loopall){
            song_queue.songs.push(song_queue.songs[0])
            song_queue.songs.shift(song_queue.songs[0])
        }
        else if(!song_queue.loopone) song_queue.songs.shift(song_queue.songs[0])

        //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
        if (!song_queue.songs[0]) {            
            song_queue.connection.destroy();
            queue.delete(guild.id);
            return;
        }

        const newStream = await ytdl(song_queue.songs[0].url, {
            filter: "audioonly",
            fmt: "ebml",
        });

        const newResource = await createAudioResource(newStream, {
            inputType: StreamType.WebmOpus,
            metadata: {
                title: song.title
            }
        });

        await song_queue.audio_player.play(newResource)
        await song_queue.text_channel.send(`🎶 Now playing **${song_queue.songs[0].title}**`)
    })

    song_queue.audio_player = await audio_player;

    //creating audio resrouce
    const resource = await createAudioResource(stream, {
        inputType: StreamType.WebmOpus,
        metadata: {
            title: song.title
        }
    });    
        
    //playing the audio resource
    
    await song_queue.connection.subscribe(await song_queue.audio_player) 
    
    await song_queue.audio_player.play(await resource)

    await song_queue.text_channel.send(`🎶 Now playing **${song.title}**`)
}