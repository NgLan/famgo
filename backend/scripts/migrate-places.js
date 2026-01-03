const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const db = require("../config/database");
const Place = require("../models/place.model");
const Review = require("../models/review.model");
const Category = require("../models/category.model");

// Map từ area cũ sang district mới
const areaToDistrictMap = {
  "Hoàn Kiếm": "Hoàn Kiếm",
  "Hai Bà Trưng": "Hai Bà Trưng",
  "Ba Đình": "Ba Đình",
  "Cầu Giấy": "Cầu Giấy",
  "Tây Hồ": "Tây Hồ",
  "Hoàng Mai": "Hoàng Mai",
  "Hà Đông": "Hà Đông",
  "Nam Từ Liêm": "Nam Từ Liêm",
  "Bắc Từ Liêm": "Bắc Từ Liêm",
  "Long Biên": "Long Biên",
  "Gia Lâm": "Gia Lâm",
  "Đông Anh": "Đông Anh",
  "Thanh Xuân": "Thanh Xuân",
  "Đống Đa": "Đống Đa",
};

// Map từ category cũ sang code mới
const categoryNameToCodeMap = {
  "Công viên & Hồ": "outdoor_park",
  "Văn hóa & Lịch sử": "museum",
  "Ẩm thực & Giải trí": "kid_friendly_cafe",
  "Mua sắm & Chợ đêm": "entertainment_center",
  "Chụp ảnh & Nghệ thuật": "museum",
};

// Hàm parse price_range thành min_price và max_price
function parsePriceRange(priceRange) {
  if (!priceRange) return { min_price: 0, max_price: 0 };
  
  // Miễn phí
  if (priceRange.toLowerCase().includes("miễn phí") || priceRange === "0") {
    return { min_price: 0, max_price: 0 };
  }
  
  // Parse số từ string (vd: "80.000đ" -> 80000)
  const extractNumber = (str) => {
    const num = str.replace(/[^\d]/g, '');
    return parseInt(num) || 0;
  };
  
  // Có dấu - hoặc – (range)
  if (priceRange.includes("-") || priceRange.includes("–")) {
    const parts = priceRange.split(/[-–]/);
    if (parts.length === 2) {
      return {
        min_price: extractNumber(parts[0]),
        max_price: extractNumber(parts[1])
      };
    }
  }
  
  // Chỉ có 1 giá
  const singlePrice = extractNumber(priceRange);
  return { min_price: singlePrice, max_price: singlePrice };
}

// Hàm tính avg_rating từ reviews
async function calculateRatings() {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$place_id",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const ratingMap = {};
  stats.forEach(stat => {
    ratingMap[stat._id.toString()] = {
      avg_rating: parseFloat(stat.avgRating.toFixed(1)),
      total_reviews: stat.count
    };
  });
  
  return ratingMap;
}

(async function migratePlaces() {
  try {
    await db.connect();
    console.log("🚀 Bắt đầu migrate dữ liệu Places cũ...\n");

    // ===== BƯỚC 1: Cập nhật code cho Categories cũ =====
    console.log("📂 Đang cập nhật code cho Categories cũ...");
    for (const [name, code] of Object.entries(categoryNameToCodeMap)) {
      const result = await Category.updateOne(
        { name: name, code: { $exists: false } },
        { $set: { code: code } }
      );
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Cập nhật: ${name} -> ${code}`);
      }
    }
    console.log("");

    // ===== BƯỚC 2: Migrate Places =====
    // Chỉ lấy những places chưa có các trường mới
    const places = await Place.find({
      $or: [
        { district: { $exists: false } },
        { min_price: { $exists: false } },
        { max_price: { $exists: false } },
        { crowd_level: { $exists: false } },
        { avg_rating: { $exists: false } },
        { total_reviews: { $exists: false } },
        { open_on_holidays: { $exists: false } }
      ]
    });
    
    console.log(`📍 Tìm thấy ${places.length} places cần migrate\n`);

    if (places.length === 0) {
      console.log("✅ Tất cả places đã được migrate rồi!");
      return;
    }

    // Tính rating từ reviews
    const ratingMap = await calculateRatings();
    console.log(`⭐ Đã tính rating từ ${Object.keys(ratingMap).length} reviews\n`);

    let migratedCount = 0;

    for (const place of places) {
      const updates = {};

      // 1. Migrate district từ area
      if (!place.district && place.area) {
        updates.district = areaToDistrictMap[place.area] || "Khu vực khác";
      }

      // 2. Migrate min_price, max_price từ price_range
      if (place.min_price === undefined || place.max_price === undefined) {
        const { min_price, max_price } = parsePriceRange(place.price_range);
        updates.min_price = min_price;
        updates.max_price = max_price;
      }

      // 3. Set default crowd_level nếu chưa có
      if (!place.crowd_level) {
        updates.crowd_level = "medium";
      }

      // 4. Set default open_on_holidays nếu chưa có
      if (place.open_on_holidays === undefined) {
        updates.open_on_holidays = true;
      }

      // 5. Update avg_rating và total_reviews từ reviews
      if (place.avg_rating === undefined || place.total_reviews === undefined) {
        const placeRating = ratingMap[place._id.toString()];
        if (placeRating) {
          updates.avg_rating = placeRating.avg_rating;
          updates.total_reviews = placeRating.total_reviews;
        } else {
          updates.avg_rating = 0;
          updates.total_reviews = 0;
        }
      }

      // Thực hiện update nếu có thay đổi
      if (Object.keys(updates).length > 0) {
        await Place.updateOne({ _id: place._id }, { $set: updates });
        migratedCount++;
        console.log(`✅ Migrated: ${place.name}`);
        console.log(`   district: ${updates.district || "(giữ nguyên)"}`);
        console.log(`   price: ${updates.min_price ?? place.min_price} - ${updates.max_price ?? place.max_price}`);
        console.log(`   rating: ${updates.avg_rating ?? place.avg_rating} (${updates.total_reviews ?? place.total_reviews} reviews)`);
        console.log("");
      }
    }

    console.log("=".repeat(50));
    console.log(`🎉 Migrate hoàn tất! Đã cập nhật ${migratedCount}/${places.length} places`);
    
  } catch (error) {
    console.error("❌ Migrate thất bại:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();