const mongoose = require("mongoose");
const slug = require("slug");
const animeSchema = mongoose.Schema(
  {
    title: String,
    type: String,
    summary: String,
    genre: [String],
    released: String,
    status: String,
    otherName: [String],
    animeID: String,
    totalEpisodes: Number,
    image: String,
    slug: String,
    category: String,
    episodes: [{ episodeNo: Number, link: String }],
  },
  { timestamps: true }
);

animeSchema.pre("save", function (next) {
  console.log("saving.............. before");
  this.slug = slug(this.title);
  console.log("saving.............. afer");
  next();
});

module.exports = Anime = mongoose.model("Anime", animeSchema);
