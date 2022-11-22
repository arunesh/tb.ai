"use strict";

var express = require('express');

var app = express();

app.get('/', (req, resp) => {
    return resp.send('OK');
});
