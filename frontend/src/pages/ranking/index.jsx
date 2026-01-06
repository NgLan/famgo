import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Heart,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import FilterSidebar from "../search/FilterSidebar";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../helpers/cookies.helper";
import {
  addFavoritePlace,
  removeFavoritePlace,
} from "../../services/favorite.services";

const API_URL = import.meta.env.VITE_API_URL; 

const RankingPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(4);
  const [favorites, setFavorites] = useState(new Set());
  const [filterState, setFilterState] = useState({});
  const [tempFilterState, setTempFilterState] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Add search keyword
        if (filterState.keyword) {
          params.append("keyword", filterState.keyword);
        }

        for (const key in filterState) {
          if (key === "keyword") continue;
          let value = filterState[key];
          if (Array.isArray(value)) {
            value = value.join(",");
          }
          if (value && value !== "all") {
            params.append(key, value);
          }
        }

        params.append("page", page);
        params.append("limit", 6);
        params.append("sort_by", "rating");

        const response = await axios.get(
          `${API_URL}/api/places/search?${params.toString()}`
        );

        setPlaces(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalResults(response.data.pagination.total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ranking:", error);
        setLoading(false);
      }
    };

    fetchRanking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterState, page]);

  const toggleFavorite = async (placeId) => {
    const userStr = getCookie("user");
    if (!userStr) {
      alert("この機能を使用するにはログインしてください");
      return;
    }

    const user = JSON.parse(userStr);
    const newFavorites = new Set(favorites);

    try {
      if (newFavorites.has(placeId)) {
        await removeFavoritePlace(user._id, placeId);
        newFavorites.delete(placeId);
      } else {
        await addFavoritePlace(user._id, placeId);
        newFavorites.add(placeId);
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error("Toggle favorite error", err);
      alert("お気に入りの更新中にエラーが発生しました");
    }
  };

  const getSpotImageUrl = (place) => {
    if (
      place.images &&
      Array.isArray(place.images) &&
      place.images.length > 0
    ) {
      const firstImage = place.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (typeof firstImage === "object" && firstImage !== null) {
        return firstImage.url || firstImage.src || firstImage.path || null;
      }
    }
    return null;
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) return "bg-[#FFD700] text-black";
    if (rank === 2) return "bg-[#C0C0C0] text-black";
    if (rank === 3) return "bg-[#CD7F32] text-white";
    return "bg-[#5BC0EB] text-white";
  };

  const handleSearch = () => {
    setFilterState((prev) => ({ ...prev, keyword: searchKeyword.trim() }));
    setPage(1);
  };

  const handleApplyFilter = () => {
    setFilterState({ ...tempFilterState, keyword: searchKeyword.trim() });
    setPage(1);
  };

  const handleResetFilter = () => {
    setTempFilterState({});
    setFilterState({});
    setSearchKeyword("");
    setPage(1);
  };

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: "#FFFBF5" }}>
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar - Sticky (①②③) */}
          <div className="hidden lg:flex w-80 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] flex-col gap-4">
            {/* Search Input */}
            <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FDE24F] border-2 border-black rounded-lg flex items-center justify-center">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black">検索</h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="スポット名を入力"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all pr-12"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5BC0EB] border-2 border-black rounded-lg hover:bg-[#4AB0DB] transition-colors"
                >
                  <Search size={18} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Filter Sidebar (①②③) */}
            <div className="flex-1 min-h-0">
              <FilterSidebar
                tempFilterState={tempFilterState}
                setTempFilterState={setTempFilterState}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-black items-center gap-2 text-center">
                  ランキング
                </h1>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4">
                <details className="bg-gray-50 border-2 border-black rounded-xl">
                  <summary className="px-4 py-3 font-bold cursor-pointer">
                    🔍 検索・フィルター
                  </summary>
                  <div className="p-4 border-t-2 border-black space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="スポット名を入力"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] pr-12"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5BC0EB] border-2 border-black rounded-lg"
                      >
                        <Search size={18} className="text-white" />
                      </button>
                    </div>
                    <FilterSidebar
                      tempFilterState={tempFilterState}
                      setTempFilterState={setTempFilterState}
                      onApply={handleApplyFilter}
                      onReset={handleResetFilter}
                    />
                  </div>
                </details>
              </div>

              {/* Ranking Items - Wireframe Layout (④⑤⑥⑦) */}
              {places.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">
                    該当するスポットがありません
                  </h3>
                  <p className="text-gray-500">
                    フィルター条件を変更してお試しください
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {places.map((place, index) => {
                    const imageUrl = getSpotImageUrl(place);
                    const isFavorite = favorites.has(place._id);
                    const rankingNumber = (page - 1) * 6 + index + 1;

                    return (
                      <div key={place._id} className="flex gap-4 items-center">
                        {/* ④ Ranking Number - Left Side, centered with card */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-16 h-16 rounded-full ${getRankBadgeStyle(
                              rankingNumber
                            )} border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center font-black text-3xl`}
                          >
                            {rankingNumber}
                          </div>
                        </div>

                        {/* ⑤ Spot Card */}
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 bg-white">
                          {/* Card Content */}
                          <div className="flex items-center gap-4 p-4">
                            {/* Image */}
                            <div className="relative w-32 h-32 flex-shrink-0 border-2 border-black rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={place.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* ⑥ Favorite Button - Above title */}
                              <div className="flex justify-start mb-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(place._id);
                                  }}
                                  className={`w-10 h-10 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center transition-all hover:scale-110 ${
                                    isFavorite ? "bg-[#FF90E8]" : "bg-white"
                                  }`}
                                >
                                  <Heart
                                    size={20}
                                    className={
                                      isFavorite
                                        ? "fill-white text-white"
                                        : "text-black"
                                    }
                                  />
                                </button>
                              </div>

                              {/* Title + Rating + Price */}
                              <div className="grid grid-cols-[1fr_210px_200px] items-center gap-3">
                                {/* Tên place */}
                                <h3 className="font-black text-black hover:text-[#5BC0EB] transition-colors cursor-pointer truncate" onClick={() => navigate(`/places/${place._id}`)}>
                                  {place.name}
                                </h3>

                                {/* Star Rating – luôn cùng 1 cột */}
                                <div className="flex items-center gap-0.5 justify-start">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={
                                        star <= Math.floor(place.rating)
                                          ? "fill-[#FFD700] text-[#FFD700]"
                                          : "fill-gray-200 text-gray-200"
                                      }
                                    />
                                  ))}
                                </div>

                                {/* Giá – căn trái, cùng cột */}
                                <div className="flex items-center justify-start">
                                  <div className="inline-flex items-center gap-1 bg-[#E8F5E9] px-2 py-1 rounded-full border-2 border-black text-sm font-bold whitespace-nowrap">
                                    💰 {place.price_range || "料金未設定"}
                                  </div>
                                </div>
                              </div>

                              {/* Address */}
                              <div className="flex items-start gap-1 text-gray-600 text-sm">
                                <MapPin
                                  size={14}
                                  className="flex-shrink-0 mt-0.5"
                                />
                                <span className="font-medium">
                                  {place.address || "住所未設定"}
                                </span>
                              </div>
                            </div>

                            {/* ⑦ Detail Button - Right side */}
                            <div className="flex-shrink-0">
                              <button
                                onClick={() =>
                                  navigate(`/places/${place._id}`)
                                } 
                                className="px-6 py-2.5 bg-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[1px_1px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all whitespace-nowrap"
                              >
                                詳細を見る
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                          page === pageNum
                            ? "bg-[#FF90E8] text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
