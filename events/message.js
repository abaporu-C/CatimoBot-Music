module.exports = {
	name: 'message',
	execute(message, client) {
        const {prefix} = require('../config.json');
		if (message.member.user.bot || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName) && !client.commands.find(a => a.aliases && a.aliases.includes(commandName))) return;

        const command = client.commands.get(commandName) || client.commands.find(a => a.aliases && a.aliases.includes(commandName));

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }

        try {
	        command.execute(message, args, commandName, client);
        } catch (error) {
	        console.error(error);
	        message.reply('there was an error trying to execute that command!');
        }
	},
};