var builder = require('botbuilder');
var restify = require('restify');

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
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));
bot.use(downloadFile(connector));
bot.dialog('/', intents);

intents.onDefault([
    function (session, args, next) {
       session.send("type and Ask|Answer|cancel|quit");
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        session.beginDialog('/menu');
        
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

bot.dialog('/menu', [
    function (session) {
       builder.Prompts.choice(session,'\n\nWhat would you like me to do?','Ask|Answer|quit');
   },
   function (session, results) {
        if (results.response && results.response.entity != 'quit') {
            switch (results.response.entity) {
                case 'Ask':
                    session.beginDialog('/Ask');
                    break;
                case 'Answer':
                    session.beginDialog('/Answer');
                    break; 

            }
        } else {
         
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
       }
]);
bot.dialog('/Ask', [
    function (session) {
        session.send("i will ask you some questions . Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "Prompts.text()\n\nAno sa Tagalog ang teeth?");
    },
    function (session, results) {
        if (results && results.response) {
            if (results.response=='utong'){
               session.send("bright man diay ka haha ikaw nalang pag ako!(facepalm)")
               builder.Prompts.text(session, "\n\nKung ang light ay ilaw, ano naman ang lightning?");
            }
            else{
               session.send("taka lang man ka hahaha!(facepalm) utong ang tama na answer ui")
               builder.Prompts.text(session, "Prompts.number()\n\nKung ang light ay ilaw, ano naman ang lightning?");
            }
           
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            if(results.response=='umiilaw'){
               session.send("tsamba! hahahah")
              
            }
            else{
                session.send("taka lang man ka hahaha!(facepalm) eh di umiilaw")
                
            }
            
        } else {
            session.endDialog("You canceled.");
        }
    }
]);

bot.dialog('/Answer', [
    function (session) {
        session.send("Ask me anything. Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "\n\nwhat would you like to ask me?");
    },
    function (session, results) {
        if (results && results.response) {
            if(results.response=='Author'){
                 session.send("Si kuan ay! Si Ralph gud (facepalm)");
              
            }
            else if(results.response=='Version'){
                 session.send("Version 007(facepalm)'");
                
            }
            else{
               session.send("Ambot lang ui(facepalm)");
            }
            
        } else {
            session.endDialog("You canceled.");
        }
    }
]);

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
