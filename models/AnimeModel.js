const mongoose = require("mongoose");
const AnimeSchema = mongoose.Schema(
  {
    title: { type: String },
    image: String,
    slug: String,
    type: String,
    summary: String,
    totalEpisodes: Number,
    genre: Array,
    released: String,
    status: String,
    otherName: String,
    episodes: [Object],
  },
  { timestamps: true }
);

module.exports = Anime = mongoose.model("anime", AnimeSchema);
