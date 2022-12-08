//////////////////////////////////////////////////
// NodeJs ExpressJs server for Talkbox DHS app.
// 

// Code comes from the samples: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/appengine

"use strict";

var express = require('express');

var app = express();

app.use(express.static('files'));

app.get('/', (req, resp) => {
    return resp.send('TALKBOX DHS OK');
});

app.post('/', (req, resp) => {
    return resp.send('Got a POST Requst.');
});
// Start the server
const PORT = parseInt(process.env.PORT) || 8080;


console.log("Running port = " + PORT);


// app.listen is the blocking call. 
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


// Good one on module.exports vs exports: https://www.sitepoint.com/understanding-module-exports-exports-node-js/

module.exports = app;
