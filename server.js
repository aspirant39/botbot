var builder = require('botbuilder');
var restify = require('restify');
var temp="";
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var intents = new builder.IntentDialog();
bot.use(builder.Middleware.dialogVersion({ version: 3.0, resetCommand: /^@botbotreset/i }));
bot.use(downloadFile(connector));
bot.dialog('/', intents);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
              next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        session.beginDialog('/actions');
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! before anything else, What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.dialog('/ask', [
    function (session) {
        session.send("i will ask you some questions . Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "\n\nAno sa Tagalog ang teeth?");
    },
    function (session, results) {
        if (results && results.response) {
            if (results.response=='utong'){
               session.send("bright man diay ka haha ikaw nalang pag ako!(facepalm)")
               builder.Prompts.text(session, "\n\nKung ang light ay ilaw, ano naman ang lightning?");
            }
            else if(results.response!='cancel'){
               session.send("taka lang man ka hahaha!(facepalm) utong ang tama na answer ui")
               builder.Prompts.text(session, "\n\nKung ang light ay ilaw, ano naman ang lightning?");
            }
            else {
            session.endDialog("You canceled.");
        }
           
        } else if(resutls.response=='cancel') {
            session.endDialog("You canceled.");
        }
         else {
         
        }
    },
    function (session, results) {
        if (results && results.response) {
            if(results.response=="umiilaw"){
               session.send("tsamba! hahahah")
             
            }
            else if(results.response!='cancel'){
                session.send("taka lang man ka hahaha!(facepalm) eh di umiilaw")
                
            }
           else {
            session.endDialog("You canceled.");
        }
            
        } else if(results.response=='cancel') {
            session.endDialog("You canceled.");
        }
         else {
            
        }
    },
     function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/ask');
       }
]);
bot.dialog('/actions', [
    function (session) { 
        session.send("Bots can register global actions, like the 'help' & 'goodbye' actions, that can respond to user input at any time. You can even bind actions to buttons on a card.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "ask", "ask", "Ask")
                    ])
            ]);
        session.send(msg);

        session.endDialog("The 'Current Weather' button on the card above can be pressed at any time regardless of where the user is in the conversation with the bot. The bot can even show the weather after the conversation has ended.");
    }
]);

bot.beginDialogAction('ask', '/ask'); 
var fs = require('fs');
var request = require('request');

function downloadFile(connector) {
   return {
        dialog: function (session, next) {
            session.downloadFile = function downloadFile(url, filename, cb) {
                connector.getAccessToken(function (err, token) {
                   if (!err && token) {
                       var headers = {};
                        if (url.indexOf('skype.com/')) {
                            headers['Authorization'] = 'Bearer ' + token;
                        }
                        request({
                            url: url,
                            headers: headers
                        }).pipe(fs.createWriteStream(filename)).on('close', cb);
                    } else {
                        cb(err);
                    }
                });
            }
            next();
        }
    };
}
