//////////////////////////////////////////////////
// NodeJs ExpressJs server for Talkbox DHS app.
// 

// Code comes from the samples: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/appengine

"use strict";

var express = require('express');

var app = express();

var db = require('./lib/dblayer.js');

const testdata = require('./lib/testdata.js');

const { createLightship } = require('lightship');

const lightship = createLightship();

app.set('view engine', 'ejs');

app.use(express.static('files'));

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

app.post('/', (req, resp) => {
    resp.send('Got a POST Requst.');
});

app.get('/trans', async (req, resp) => {
    await db.fetchTranslations("");
    resp.send('Fetched translations');
});

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
