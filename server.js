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
        session.send('Hello %s :^)!', session.userData.name);
        session.beginDialog('/menu');
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! before anything else, What is your name(think)?');
    },
    function (session, results) {
        session.userData.name = results.response.slice(62,results.response.length);
        session.endDialog();
    }
]);
bot.dialog('/menu', [
    function (session) {
       session.sendTyping("sddsdsd");
       builder.Prompts.text(session,'\n\nWhat would you like me to do? Choices: Ask | Answer | quit :');
      
   },
   function (session, results) {
      if(results.response.length>62){
      temp=results.response.slice(62,results.response.length);
      temp=temp.trim();
      }
      else{
         temp=results.response;
      }
        if (results.response && temp != 'quit') {
            switch (temp) {
                case 'Ask':
                    session.beginDialog('/Ask');
                    break;
                case 'Answer':
                    session.beginDialog('/Answer');
                    break;
                 default:
                    session.send("(headbang)");
                    break;
            }
            }
        else {
            session.send("good bye! (wave)");
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
        builder.Prompts.text(session, "\n\nAno sa Tagalog ang teeth :^) ?");
    },
    function (session, results) {
       if(results.response.length>62){
      temp=results.response.slice(62,results.response.length);
      temp=temp.trim();
      }
      else{
         temp=results.response;
      }
        if (results && temp) {
            if (temp=='utong'){
               session.send("bright man diay ka haha ikaw nalang pag ako!(facepalm)")
               builder.Prompts.text(session, "\n\nKung ang light ay ilaw, ano naman ang lightning (think)?");
            }
            else if(temp!='cancel'){
               session.send("taka lang man ka hahaha!(facepalm) utong ang tama na answer ui (n)")
               builder.Prompts.text(session, "\n\nKung ang light ay ilaw, ano naman ang lightning (think) ?");
            }
            else {
            session.endDialog("You canceled.");
        }
           
        } else if(temp=='cancel') {
            session.endDialog("You canceled.");
        }
         else {
         
        }
    },
    function (session, results) {
       if(results.response.length>62){
      temp=results.response.slice(62,results.response.length);
      temp=temp.trim();
      }
      else{
         temp=results.response;
      }
        if (results && temp) {
            if(temp=="umiilaw"){
               session.send("tsamba!(sarcastic)")
             
            }
            else if(temp!='cancel'){
                session.send("taka lang man ka hahaha!(facepalm)(n) eh di umiilaw")
                
            }
           else {
            session.endDialog("You canceled.");
        }
            
        } else if(temp=='cancel') {
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
        builder.Prompts.text(session, "\n\nwhat would you like to ask me (think)?");
    },
    function (session, results) {
        if(results.response.length>62){
      temp=results.response.slice(62,results.response.length);
      temp=temp.trim();
      }
      else{
         temp=results.response;
      }
        if (results && temp) {
            if(temp=='Author'){
                 session.send("Si kuan ay! Si Ralph gud (facepalm)");
              
            }
            else if(temp=='Version'){
                 session.send("Version 007(facepalm)");
                
            }
            else if(temp!='cancel'){
               session.send("Ambot lang ui(facepalm)");
            }
            else{
               session.endDialog("You canceled.");
            }
            
        } else if(temp=='cancel') {
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
