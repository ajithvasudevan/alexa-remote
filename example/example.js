var fs = require('fs');
let Alexa = require('../alexa-remote');
let alexa = new Alexa();

var forceRefreshCookie = false;
var cookieAutoRefreshPeriod = 7;   // days

let cookie = { };
var cookieFound = false;
var fileString;
try {
    fileString = fs.readFileSync('authFile.json').toString();
    cookie = JSON.parse(fileString);
    cookieFound = true;
} catch(e) {
    console.log(e.message);
    console.log('No existing cookie found. Will start webserver at http://localhost:3001');
}
function logger(data) {
    if(!data.includes('Alexa-Remote: Response:') && !data.includes('Alexa-Remote: Activity data') && !data.includes('Alexa-Remote WS-MQTT: Command')) console.log(new Date() + ': ' + data);
}

alexa.init({
        cookie: cookie,  // cookie if already known, else can be generated using email/password
        //email: '',    // optional, amazon email for login to get new cookie
        //password: '', // optional, amazon password for login to get new cookie
        proxyOnly: true,
        proxyOwnIp: 'localhost',
        proxyPort: 3001,
        proxyLogLevel: 'info',
        bluetooth: true,
        logger: logger, // optional
        alexaServiceHost: 'alexa.amazon.in', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
        amazonPage: 'amazon.in', // optional, override Amazon-Login-Page for cookie determination and referer for requests
        useWsMqtt: true, // optional, true to use the Websocket/MQTT direct push connection
        cookieRefreshInterval: cookieAutoRefreshPeriod*24*60*60*1000 // optional, cookie refresh intervall, set to 0 to disable refresh
    },
    function (err) {
        if (err) {
            console.log (err);
            return;
        } else {
            console.log('alexa-remote initialized successfully');
            if(!cookieFound || forceRefreshCookie) fs.writeFileSync('authFile.json', JSON.stringify(alexa.cookieData));
        }
       
        alexa.addListener('ws-device-activity', function(data) {
            console.log(new Date() + ': ALEXA-COMMAND ********************************************************************** ' + data.description.summary);
        })
    }
);
