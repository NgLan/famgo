import { get } from "../utils/request";

/**
 * Tìm kiếm địa điểm với các tham số filter
 * @param {Object} params - { sort_by, limit, district, age_ranges, ... }
 */
export const searchPlaces = async (params) => {
  // Lọc bỏ các giá trị null/undefined/rỗng
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== "")
  );
  
  const queryString = new URLSearchParams(cleanParams).toString();
  const result = await get(`places/search?${queryString}`);
  return result;
};

/**
 * Lấy chi tiết địa điểm
 */
export const getPlaceDetail = async (id) => {
  const result = await get(`places/${id}`);
  return result;
};