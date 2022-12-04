"use strict";

var express = require('express');

var app = express();

app.get('/', (req, resp) => {
    return resp.send('TALKBOX DHS OK');
});

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
