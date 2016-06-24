var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET 
};

var bot = new builder.BotConnectorBot(botConnectorOptions);
bot.add('/', function (session) {
    
    //respond with user's message
    session.send("You said " + session.message.text);
});
bot.on('contactAdded', (bot, data) => {
    bot.reply(`Hello ${data.fromDisplayName}!`, true);
});

bot.on('personalMessage', (bot, data) => {
    bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
});
bot.on('groupMessage', (bot, data) => {
    bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
});

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
