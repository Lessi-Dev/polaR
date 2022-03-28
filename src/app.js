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

app.get('/AddTracks/:Name', async (req, res) => {
    const name = req.params.Name;
    const videos = await yt.search(name);
    const info = await ytdl.getBasicInfo(youtubeUrl);

    console.log(info.videoDetails.thumbnails[0].url);

    const thumbnail = info.videoDetails.thumbnails[0].url;


    const title =
      info.videoDetails.title +
      " by " +
      info.videoDetails.author.name +
      "-" +
      new Date().getTime().toString();

    ytdl(youtubeUrl)
      .pipe(fs.createWriteStream(`${process.cwd()}/downloads/${title}.mp4`))
      .on("finish", async () => {
        socket.publishEvent(Events.VIDEO_DOWNLOADED, title);

        const file = `${process.cwd()}/downloads/${title}.mp4`;

        const video = new Video({
          title,
          file,
          thumbnail,
        });

        await video.save();

        done();
    })
  });

app.get('/img/:image', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/img/' + req.params.image));
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})