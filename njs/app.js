//////////////////////////////////////////////////
// NodeJs ExpressJs server for Talkbox DHS app.
// 

// Code comes from the samples: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/appengine

"use strict";

var express = require('express');

var app = express();

var db = require('./lib/dblayer.js');

app.set('view engine', 'ejs');

app.use(express.static('files'));

app.get('/', (req, resp) => {
    resp.send('TALKBOX DHS OK');
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
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


// Good one on module.exports vs exports: https://www.sitepoint.com/understanding-module-exports-exports-node-js/

module.exports = app;
