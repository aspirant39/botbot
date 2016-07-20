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
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/menu', [
    function (session) {
       builder.Prompts.choice(session,'What would you like me to do?','Ask|Answer|quit');
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
        session.send("Ask me anything . Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "Prompts.text()\n\nEnter some text and I'll say it back.");
    },
    function (session, results) {
        if (results && results.response) {
            session.send("You entered '%s'", results.response);
            builder.Prompts.number(session, "Prompts.number()\n\nNow enter a number.");
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            session.send("You entered '%s'", results.response);
            session.send("Bot Builder includes a rich choice() prompt that lets you offer a user a list choices to pick from. On Facebook these choices by default surface using buttons if there are 3 or less choices. If there are more than 3 choices a numbered list will be used but you can specify the exact type of list to show using the ListStyle property.");
            builder.Prompts.choice(session, "Prompts.choice()\n\nChoose a list style (the default is auto.)", "auto|inline|list|button|none");
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            var style = builder.ListStyle[results.response.entity];
            builder.Prompts.choice(session, "Prompts.choice()\n\nNow pick an option.", "option A|option B|option C", { listStyle: style });
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            session.send("You chose '%s'", results.response.entity);
            builder.Prompts.confirm(session, "Prompts.confirm()\n\nSimple yes/no questions are possible. Answer yes or no now.");
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.resumed == builder.ResumeReason.completed) {
            session.send("You chose '%s'", results.response ? 'yes' : 'no');
            builder.Prompts.time(session, "Prompts.time()\n\nThe framework can recognize a range of times expressed as natural language. Enter a time like 'Monday at 7am' and I'll show you the JSON we return.");
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            session.send("Recognized Entity: %s", JSON.stringify(results.response));
            builder.Prompts.attachment(session, "Prompts.attachment()\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.");
        } else {
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            var msg = new builder.Message(session)
                .ntext("I got %d attachment.", "I got %d attachments.", results.response.length);
            results.response.forEach(function (attachment) {
                msg.addAttachment(attachment);    
            });
            session.endDialog(msg);
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
