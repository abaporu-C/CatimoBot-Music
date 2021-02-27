const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
const ffmpegPathTo = require('ffmpeg-static')
 
module.exports = {
    name: 'play',
    description: 'Joins and plays a video from youtube',
    agrs: true,
    usage: '^play <youtube search>',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
 
        if (!voiceChannel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');
        if (!args.length) return message.channel.send('You need to send the second argument!');
 
        const validURL = (str) =>{
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex.test(str)){
                return false;
            } else {
                return true;
            }
        }
 
        if(validURL(args[0])){
 
            const connection = await voiceChannel.join();

            async function play(connection, url) {
                connection.play(await ytdl(url), { type: 'opus', volume: 0.8 }).on('finish', () => {
                    voiceChannel.leave();
                });
            }

            play(connection, args[0]);
 
            await message.reply(`:thumbsup: Now Playing ***Your Link!***`)
 
            return
        }
 
        
        const connection = await voiceChannel.join();
 
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
 
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
 
        }
 
        const video = await videoFinder(args.join(' '));
 
        if(video){

            async function play(connection, url) {
                connection.play(await ytdl(url), { type: 'opus', volume: 0.8 }).on('finish', () => {
                    voiceChannel.leave();
                });
            }
            
            play(connection, video.url);

            await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
        } else {
            message.channel.send('No video results found');
        }
    }
}