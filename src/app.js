const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config");
var readline = require("readline");
const Genius = require("genius-lyrics");
const ytdl = require("ytdl-core");
const yt = require("youtube-search-without-api-key");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { string } = require("i/lib/util");
ffmpeg.setFfmpegPath(ffmpegPath);

const Client = new Genius.Client();

const app = express();
mongoose.connect(
  "mongodb+srv://HaikeWagner:4PIC2vyF9YRjMAT8@users.2mhro.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

mongoose.connection
  .on("connected", () => {
    console.log("Connected to database");
  })
  .on("error", (err) => {
    console.log("Error connecting to database", err);
  });

const TrackSchema = mongoose.Schema({
  title: {
    type: String,
  },
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
  date: {
    type: String,
  },
  cover: {
    type: String,
  },
  duration: {
    type: String,
  },
  id: {
    type: String,
  },
  lyrics: {
    type: String,
  },
});

function getDuration(id) {
  return new Promise(function (resolve, reject) {
    try {
      ffmpeg.ffprobe(
        path.join(__dirname, `/../downloads/${id}.mp3`),
        function (err, metadata) {
          resolve(metadata.format.duration);
        }
      );
    } catch {
      reject("File not Found");
    }
  });
}

TrackSchema.pre("save", async function (next) {
  if (this.lyrics == "🇺🇦") {
    try {
      getDuration(this.id).then((duration) => {
        this.duration = duration;
        next();
      });
      const searches = await Client.songs.search(
        this.title + " " + this.artist.replace("- Topic", "")
      );
      this.lyrics = await searches[0].lyrics();
      if (searches[0].Song.album != undefined) {
        this.album = searches[0].Song.album;
      }
    } catch (err) {
      console.log(err);
    }
  }
});

const Track = mongoose.model("Track", TrackSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

app.get("/Add", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/add.html"));
});

app.get("/Search", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/search.html"));
});

app.get("/SearchResults/:Input", async (req, res) => {
  const input = req.params.Input;
  const videos = await yt.search(input);
  res.send(videos);
});

app.get("/DownloadTrack/:token", async (req, res) => {
  const id = req.params.token;
  let stream = await ytdl("https://www.youtube.com/watch?v=" + id, {
    quality: "highestaudio",
  }).pipe(
    fs.createWriteStream(path.join(__dirname + `/../downloads/${id}.mp3`))
  );
  ffmpeg(path.join(__dirname + `/../downloads/${id}.mp3`)).ffprobe(() => {
    res.send("done");
    const Info = ytdl.getInfo(req.params.token).then((info) => {
      console.log(info.videoDetails);
      new Track({
        title: info.videoDetails.title,
        artist: info.videoDetails.author.name,
        date: info.videoDetails.publishDate,
        cover: info.videoDetails.thumbnails[4].url,
        duration:
          String(Math.floor(Number(info.videoDetails.lengthSeconds) / 60)) +
          ":" +
          String(Number(info.videoDetails.lengthSeconds) % 60),
        id: id,
        lyrics: "🇺🇦",
      }).save();
    });
  });
});

app.get("/AllTracks", async (req, res) => {
  const tracks = await Track.find();
  res.send(tracks);
});

app.get("/AudioFile/:id", async (req, res) => {
  res.sendFile(path.join(__dirname + `/../downloads/${req.params.id}`));
});

app.get("/img/:image", (req, res) => {
  res.sendFile(path.join(__dirname + "/../public/img/" + req.params.image));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
