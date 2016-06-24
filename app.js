const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');

const botService = new skype.BotService({
    messaging: {
        botId: '',
        serverUrl : 'https://apis.skype.com',
        requestTimeout : 15000,
        appId:process.env.BOTFRAMEWORK_APPID,
        appSecret:process.env.BOTFRAMEWORK_APPSECRET
    }
});

botService.on('contactAdded', (bot, data) => {
    console.log("bot replay");
    bot.reply('Hello ${data.fromDisplayName}!', true);
});

botService.on('personalMessage', (bot, data) => {
    console.log("person replay");
    bot.reply('Hey ${data.from}. Thank you for your message: "${data.content}".', true);
});

const server = restify.createServer();

server.use(skype.ensureHttps(true));
server.use(skype.verifySkypeCert({}));
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));
server.post('/api/messages', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);
