const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 🆕 Code để filter
    icon: { type: String, default: "" },
  },
  { timestamps: false }
);

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
