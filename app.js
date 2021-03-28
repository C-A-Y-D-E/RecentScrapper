const x = require("x-ray-scraper");
const Anime = require("./models/AnimeModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const makeDriver = require("request-x-ray");
dotenv.config({ path: "./config.env" });

// DATABASE CONNECTION
mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("conntect to database")
);

// XRAY FILTERS
x.setFilters({
  trim: function (value) {
    return typeof value === "string" ? value.trim() : value;
  },
  reverse: function (value) {
    return typeof value === "string"
      ? value.split("").reverse().join("")
      : value;
  },
  slice: function (value, start, end) {
    return typeof value === "string" ? value.slice(start, end) : value;
  },
  replace: function (value, rep) {
    return typeof value === "string" ? value.replace(rep, "") : value;
  },
  number: function (value) {
    return typeof value === "string" ? Number(value) : value;
  },

  reduce: function (value) {
    return typeof value === "string" ? parseInt(value.split("-")[1]) : value;
  },
  link: function (value) {
    console.log(value, "reduce");
    return typeof value === "string" ? `https://gogoanime.ai${value}` : value;
  },
});

// XRAY REQUESTE
const options = {
  method: "GET", //Set HTTP method
  jar: true, //Enable cookies
  headers: {
    //Set headers
    "User-Agent": "Firefox/48.0",
  },
};
const driver = makeDriver(options);
x.delay(3000, 5000).driver(driver);

const recentAnime = async () => {
  const data = await x(`${process.env.URL}/`, ".items li", [
    x(
      "p.name a@href",
      x(".anime-info a@href", {
        title: "h1",
        type:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(4) a",
        summary:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5) | replace:'Plot Summary:' | trim",
        genre: x(
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(6) ",
          ["a | replace:', '"]
        ),

        released:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(7) | replace:'Released:' | trim",

        otherName:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9) | replace:'Other name:' | trim",
        totalEpisodes: x("#episode_page", "li:last-child a | reduce"),
        image: ".anime_info_body_bg img@src",
      })
    ),
  ]);
  for (let i = 0; i < data.length; i++) {
    const anime = await Anime.findOne({ title: data[i].title });
    if (anime) {
      if (anime.totalEpisodes === data[i].totalEpisodes) {
        console.log("leaving loop");
        continue;
      } else {
        console.log("caught one");
        anime.totalEpisodes = data[i].totalEpisodes;
        await anime.save();
      }
    } else {
      await Anime.create(data[i]);
    }
  }

  return data;
};
recentAnime();
