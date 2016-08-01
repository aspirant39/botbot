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
bot.use(builder.Middleware.dialogVersion({ version: 3.0, resetCommand: /^reset/i }));
bot.use(downloadFile(connector));
bot.dialog('/', intents);

intents.onDefault([
    function (session, args, next) {
       session.send("Type and send - Ask | Answer | cancel | quit");
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
       session.sendTyping();
       builder.Prompts.choice(session,'\n\nWhat would you like me to do?','"+process.env.MICROSOFT_APP_ID+" Ask|Answer|cards|carousel|quit');
      
   },
   function (session, results) {
      if(results.response.entity.length>7){
      temp=results.response.entity.slice(7,results.response.entity.length-1);
      temp=temp.trim();
      session.send('Hello %s', results.response.entity.indexof("@botbot"));
      }
      else{
         temp=results.response.entity;
      }
        if (results.response && temp != 'quit') {
            switch (temp) {
                case 'Ask':
                    session.beginDialog('/Ask');
                    break;
                case 'Answer':
                    session.beginDialog('/Answer');
                    break;
               case 'cards':
                    session.beginDialog('/cards');
                    break;
               case 'carousel':
                     session.beginDialog('/carousel');
                     break;
            }
            }
        else {
            session.send("good bye! (wave)");
            session.endDialog();
        }
    },
    function (session, results) {
       session.send("Result: %s",temp);
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
       }
]);
bot.dialog('/Ask', [
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
        session.replaceDialog('/Ask');
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
                 session.send("Version 007(facepalm)");
                
            }
            else if(results.response!='cancel'){
               session.send("Ambot lang ui(facepalm)");
            }
            else{
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
        session.replaceDialog('/Answer');
       }
]);

bot.dialog('/cards', [
    function (session) {
        session.send("You can use Hero & Thumbnail cards to send the user a visually rich information...");

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
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.send(msg);

        msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market"))
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/carousel', [
    function (session) {
        session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:100", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:101", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("EMP Museum")
                    .text("<b>EMP Musem</b> is a leading-edge nonprofit museum, dedicated to the ideas and risk-taking that fuel contemporary popular culture.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/320px-Night_Exterior_EMP.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/800px-Night_Exterior_EMP.jpg"))
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/EMP_Museum", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:102", "Select")
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
    },
    function (session, results) {
        if (results.response) {
            var action, item;
            var kvPair = results.response.entity.split(':');
            switch (kvPair[0]) {
                case 'select':
                    action = 'selected';
                    break;
            }
            switch (kvPair[1]) {
                case '100':
                    item = "the <b>Space Needle</b>";
                    break;
                case '101':
                    item = "<b>Pikes Place Market</b>";
                    break;
                case '101':
                    item = "the <b>EMP Museum</b>";
                    break;
            }
            session.endDialog('You %s "%s"', action, item);
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
