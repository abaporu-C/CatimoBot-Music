//Utilities
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const {prefix, token} = require('./config.json');
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));


for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}


client.login(token);