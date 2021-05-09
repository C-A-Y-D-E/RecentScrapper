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
  slice: function (value, start) {
    return typeof value === "string"
      ? value
          .slice(start)
          .trim()
          .replace("\n", "")
          .replace("\t", "")
          .replace("\t", "")
          .replace("\t", "")
          .replace("\t", "")
          .replace("\t", "")
          .replace("\t", "")
      : value;
  },
  split: function (value) {
    return typeof value === "string"
      ? parseInt(
          value
            .replace("\n", "")
            .replace("\n", "")
            .replace("\t", "")
            .replace("\t", "")
            .trim()
            .split("-")[1]
        )
      : value;
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
// const driver = makeDriver(options);
// x.delay(3000, 5000).driver(driver);

const recentAnime = async () => {
  const data = await x(`${process.env.URL}/`, ".items li", [
    x(
      "p.name a@href",
      x(".anime-info a@href", {
        title: "h1",
        category:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(4) | slice:5",
        summary:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5) ",
        genre:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(6) | slice:6",
        released:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(7) | slice:9",
        status:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(8) | slice:7",
        otherName:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9) | slice:11",
        animeID: "input#movie_id@value",
        image: ".anime_info_body_bg img@src",
        totalEpisodes: "#episode_page > li:last-child",
      })
    ),
  ]);
  for (let i = 0; i < data.length; i++) {
    data[i].totalEpisodes =
      data[i].totalEpisodes.indexOf("-") === -1
        ? parseInt(data[i].totalEpisodes)
        : parseInt(data[i].totalEpisodes.split("-")[1]);

    const anime = await Anime.findOne({ title: data[i].title });
    if (anime) {
      if (anime.totalEpisodes === data[i].totalEpisodes) {
        console.log("leaving loop");
        continue;
      } else {
        console.log("caught one");
        const ep = await x(
          `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=${data[i].totalEpisodes}&id=${data[i].animeID}`,
          "li",
          [
            {
              episodeNo: ".name | slice:2",
              link: "a@href | slice:26",
              type: ".cate",
            },
          ]
        );
        anime.episodes = ep
          .reverse()
          .map(({ episodeNo, link }) => ({ episodeNo, link }));
        console.log(anime);
        await anime.save();
      }
    } else {
      console.log("creating");

      const ep = await x(
        `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=${data[i].totalEpisodes}&id=${data[i].animeID}`,
        "li",
        [
          {
            episodeNo: ".name | slice:2",
            link: "a@href | slice:26",
            type: ".cate",
          },
        ]
      );
      data[i].genre = data[i]?.genre?.split(",") ?? "";
      data[i].otherName = data[i]?.otherName?.split(",") ?? "";
      data[i].episodes = ep
        .reverse()
        .map(({ episodeNo, link }) => ({ episodeNo, link }));
      data[i].type = ep.length > 1 ? ep[0].type : "SUB";
      // console.log(data[i]);
      await Anime.create(data[i]);
    }
  }
  // console.log(data);
  return data;
};

recentAnime();
