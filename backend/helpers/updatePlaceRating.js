const Place = require("../models/place.model");
const Review = require("../models/review.model");

/**
 * Cập nhật avg_rating và total_reviews của một Place
 * Gọi hàm này mỗi khi có review mới được tạo, sửa hoặc xóa
 * @param {ObjectId} placeId - ID của place cần cập nhật
 */
async function updatePlaceRating(placeId) {
  try {
    const stats = await Review.aggregate([
      { $match: { place_id: placeId } },
      {
        $group: {
          _id: "$place_id",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Place.updateOne(
        { _id: placeId },
        {
          $set: {
            avg_rating: parseFloat(stats[0].avgRating.toFixed(1)),
            total_reviews: stats[0].count
          }
        }
      );
    } else {
      // Không có review nào -> reset về 0
      await Place.updateOne(
        { _id: placeId },
        {
          $set: {
            avg_rating: 0,
            total_reviews: 0
          }
        }
      );
    }

    return true;
  } catch (error) {
    console.error("Error updating place rating:", error);
    return false;
  }
}

module.exports = { updatePlaceRating };