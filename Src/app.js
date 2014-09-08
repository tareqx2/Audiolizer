express = require('express');

app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/../node_modules'));