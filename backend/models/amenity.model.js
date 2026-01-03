const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Ví dụ: "Bãi đỗ xe", "Khu vực cho trẻ nhỏ"
    code: { type: String, required: true, unique: true }, // Ví dụ: "parking", "toddler_area" (dùng để định danh nếu cần)
    icon: { type: String, default: "" }, // Icon hiển thị
  },
  { timestamps: false }
);

const Amenity = mongoose.model("Amenity", amenitySchema, "amenities");

module.exports = Amenity;