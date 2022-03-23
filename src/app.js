const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('config.json');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
})

app.get('/Add', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/add.html'));
})

app.get('/Search', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/search.html'));
})

app.get('/img/:image', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/img/' + req.params.image));

})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})