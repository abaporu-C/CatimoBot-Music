module.exports =  (message, args, server_queue) => {
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
                message.channel.send('Specify which kind of loop you want to switch. ^loop (all/one/off)')
        }
    }
}