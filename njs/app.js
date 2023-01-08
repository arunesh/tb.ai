//////////////////////////////////////////////////
// NodeJs ExpressJs server for Talkbox DHS app.
// 


"use strict";

var express = require('express');
var app = express();
var db = require('./lib/dblayer.js');
var session = require('express-session');

const testdata = require('./lib/testdata.js');
const { createLightship } = require('lightship');
const lightship = createLightship();
const oneDay = 1000 * 60 * 60 * 24;


///////////////////////
// Setup ExpressJs routes.
app.set('view engine', 'ejs');
app.use(express.static('files'));


// Parser to parse req.body field for certain "Content-Type" header field values:
// body-parser is an ExpressJs middleware to parse various types of encodings including JSON, Raw, Text and URL-encoded. Express provides this
// as a built-in now, no need to explicity add. http://expressjs.com/en/5x/api.html#express.urlencoded
// It does not do multi-part.
// More here: http://expressjs.com/en/resources/middleware/body-parser.html
// Valid values for the Content-Type field in the request header: https://www.ibm.com/docs/en/order-management?topic=services-specifying-http-headers
//
// parsing the incoming data per above comments.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session middleware to manage cookie-based user sessions.
// https://www.npmjs.com/package/express-session
app.use(session({
    secret: "Your secret key",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
});


app.get('/', (req, resp) => {
    resp.redirect('/login.html');
});

app.get('/transtest', (req, resp) => {
    resp.render('translations.ejs', {rowlist: testdata.trans});
});

app.get('/translations.html', async (req, resp) => {
    const translations = await db.fetchTranslations("");
    console.log("Fetched translations:" + translations);
    resp.render('translations.ejs', {rowlist: translations});
});

app.get('/users.html', async (req, resp) => {
    const users = await db.fetchUsers();
    console.log("Fetched users:" + users);
    resp.render('users.ejs', {rowlist: users});
});

app.get('/teams.html', async (req, resp) => {
    const teams = await db.fetchTeams();
    console.log("Fetched teams:" + teams);
    resp.render('teams.ejs', {rowlist: teams});
    //resp.send('Teams: ' + JSON.stringify(teams));
});

app.post('/', (req, resp) => {
    resp.send('Got a POST Requst.');
});

app.get('/trans', async (req, resp) => {
    await db.fetchTranslations("");
    resp.send('Fetched translations');
});

/////////////////////
// Start the server
const PORT = parseInt(process.env.PORT) || 8080;

console.log("Current port = " + PORT);

db.helloDb();

// app.listen is the blocking call. 
const server = app.listen(PORT, () => {
    console.log(lightship);
    lightship.then((actualLightship) => {
        actualLightship.signalReady()
        console.log("Lightship activated.");
    });
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});


process.on('SIGTERM', () => {
    console.log("SIGTERM signal received; closing HTTP server");
    server.close(() => {
        console.log("HTTP Server closed");
        db.closeDbLayer();
    });
    process.exit();
});


// Good one on module.exports vs exports: https://www.sitepoint.com/understanding-module-exports-exports-node-js/

module.exports = app;


// References:
//
// Samples: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/appengine
