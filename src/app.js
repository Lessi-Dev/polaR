const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Youtube = require("youtube-api")
const config = require('./config');
var readline = require('readline');
var {google} = require('googleapis');
const ytdl = require('ytdl-core');
const yt = require('youtube-search-without-api-key');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
//mongoose.connect('mongodb://mongo/polaR', { useNewUrlParser: true });


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
})

app.get('/Add', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/add.html'));
})

app.get('/Search', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/search.html'));
})

app.get('/SearchResults/:Input',async (req, res) => {
    const input = req.params.Input;
    const videos = await yt.search(input);
    res.send(videos);
})

app.get('/DownloadTrack/:token', async (req, res) => {
  const id = req.params.token;
  let stream = ytdl(id, {
    quality: 'highestaudio',
  });
  let start = Date.now();
  ffmpeg(stream)
    .audioBitrate(128)
    .save(`./downloads/${id}.mp3`)
    .on('progress', p => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${p.targetSize}kb downloaded`);
    })
    .on('end', () => {
      console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
    });
  });

app.get('/AudioFile/:id', async (req, res) => {
  res.sendFile(path.join(__dirname + `/../downloads/${req.params.id}.mp3`));
})

app.get('/img/:image', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/img/' + req.params.image));
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})