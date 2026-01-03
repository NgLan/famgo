const mongoose = require("mongoose");

const openingHoursSchema = new mongoose.Schema(
  {
    mon: String,
    tue: String,
    wed: String,
    thu: String,
    fri: String,
    sat: String,
    sun: String
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: String,
    alt_text: String
  },
  { _id: false }
);

const ageLimitSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    address: String,
    city: String,
    area: String,
    district: String, // 🆕 Quận/Huyện: Hoàn Kiếm, Ba Đình, Cầu Giấy...
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    },
    opening_hours: openingHoursSchema,
    open_on_holidays: { type: Boolean, default: false }, // 🆕 Mở cửa ngày lễ
    price_range: String,
    min_price: { type: Number, default: 0 }, // 🆕 Giá tối thiểu (VND)
    max_price: { type: Number, default: 0 }, // 🆕 Giá tối đa (VND)
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    amenities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity"
    }],
    images: [imageSchema],
    age_limit: ageLimitSchema,
    crowd_level: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    }, // 🆕 Mức độ đông đúc
    avg_rating: { type: Number, default: 0 }, // 🆕 Điểm đánh giá trung bình
    total_reviews: { type: Number, default: 0 }, // 🆕 Tổng số review
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

// Index cho các trường thường xuyên filter
placeSchema.index({ district: 1 });
placeSchema.index({ min_price: 1, max_price: 1 });
placeSchema.index({ avg_rating: -1 });
placeSchema.index({ crowd_level: 1 });

const Place = mongoose.model("Place", placeSchema, "places");

module.exports = Place;
