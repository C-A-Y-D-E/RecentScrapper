const mongoose = require("mongoose");
const slugify = require("slugify");
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
  this.slug = slugify(`${this.title}`, {
    lower: true,
  });
  next();
});

module.exports = Anime = mongoose.model("Anime", animeSchema);
