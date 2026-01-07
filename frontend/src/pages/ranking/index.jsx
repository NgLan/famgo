import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Heart,
  Star,
  MapPin,
  Search,
  Banknote,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import FilterSidebar from "../search/FilterSidebar";
import PaginationControl from '../../components/common/PaginationControl';
import { getCookie } from "../../helpers/cookies.helper";
import {
  addFavoritePlace,
  removeFavoritePlace,
  checkFavoritePlace, // ⭐ Thêm import này
} from "../../services/favorite.services";

const API_URL = import.meta.env.VITE_API_URL;

const RankingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [filterState, setFilterState] = useState({});
  const [tempFilterState, setTempFilterState] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");

  // ⭐ useEffect mới để load favorites
  useEffect(() => {
    let mounted = true;
    const userStr = getCookie('user');
    
    if (!userStr || places.length === 0) {
      // Nếu chưa login hoặc chưa có places thì reset favorites
      setFavorites(new Set());
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Check từng place xem có favorite không
      (async () => {
        try {
          const favoriteChecks = await Promise.all(
            places.map(place => 
              checkFavoritePlace(user._id, place._id)
                .then(res => ({
                  placeId: place._id,
                  isFavorite: !!res?.data?.is_favorite
                }))
                .catch(() => ({
                  placeId: place._id,
                  isFavorite: false
                }))
            )
          );

          if (mounted) {
            const newFavorites = new Set(
              favoriteChecks
                .filter(item => item.isFavorite)
                .map(item => item.placeId)
            );
            setFavorites(newFavorites);
          }
        } catch (err) {
          console.error('Error checking favorites:', err);
        }
      })();
    } catch (e) {
      console.error('Error parsing user:', e);
    }

    return () => { mounted = false };
  }, [places]); // ⭐ Dependency: khi places thay đổi thì check lại favorites

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterState.keyword) params.append("keyword", filterState.keyword);
        for (const key in filterState) {
          if (key === "keyword") continue;
          let value = filterState[key];
          if (Array.isArray(value)) value = value.join(",");
          if (value && value !== "all") params.append(key, value);
        }
        params.append("page", page);
        params.append("limit", 6);
        params.append("sort_by", "rating");

        const response = await axios.get(
          `${API_URL}/api/places/search?${params.toString()}`
        );
        setPlaces(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ranking:", error);
        toast.error("データの取得中にエラーが発生しました");
        setLoading(false);
      }
    };
    fetchRanking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterState, page]);

  const toggleFavorite = async (placeId) => {
    const userStr = getCookie("user");
    
    if (!userStr) {
      toast.info("この機能を使用するにはログインが必要です。");
      navigate('/login', { 
        state: { 
          from: {
            pathname: location.pathname,
            search: location.search
          }
        } 
      });
      return;
    }

    const user = JSON.parse(userStr);
    const newFavorites = new Set(favorites);

    try {
      if (newFavorites.has(placeId)) {
        await removeFavoritePlace(user._id, placeId);
        newFavorites.delete(placeId);
        toast.success("お気に入りから削除しました");
      } else {
        await addFavoritePlace(user._id, placeId);
        newFavorites.add(placeId);
        toast.success("お気に入りに追加しました");
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error("Toggle favorite error", err);
      toast.error("お気に入りの更新中にエラーが発生しました");
    }
  };

  // ... phần còn lại giữ nguyên
  const getSpotImageUrl = (place) => {
    if (place.images?.length > 0) {
      const firstImage = place.images[0];
      return typeof firstImage === "string" ? firstImage : firstImage.url || null;
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
          <div className="hidden lg:flex w-80 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] flex-col gap-4">
            <div className="flex-1 min-h-0">
              <FilterSidebar
                tempFilterState={tempFilterState}
                setTempFilterState={setTempFilterState}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-black items-center gap-2 text-center">
                  ランキング
                </h1>
              </div>
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
                        <div className="flex-shrink-0">
                          <div
                            className={`w-16 h-16 rounded-full ${getRankBadgeStyle(
                              rankingNumber
                            )} border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center font-black text-3xl`}
                          >
                            {rankingNumber}
                          </div>
                        </div>
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 bg-white">
                          <div className="flex items-center gap-4 p-4">
                            <div className="relative w-32 h-32 flex-shrink-0 border-2 border-black rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={place.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center h-32">
                              <div className="flex justify-start mb-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(place._id);
                                  }}
                                  className="w-8 h-8 rounded-full border-2 border-black shadow-[1px_1px_0_0_#000] flex items-center justify-center transition-all hover:scale-110 bg-white"
                                >
                                  <Heart
                                    size={16}
                                    className={
                                      isFavorite
                                        ? "fill-[#da4458] text-black"
                                        : "text-black"
                                    }
                                  />
                                </button>
                              </div>
                              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 mb-1">
                                <h3
                                  className="font-black text-lg text-black hover:text-[#5BC0EB] transition-colors cursor-pointer truncate flex-1 mr-2"
                                  onClick={() => navigate(`/places/${place._id}`)}
                                  title={place.name}
                                >
                                  {place.name}
                                </h3>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <div className="flex items-center gap-0.5">
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
                                  <span className="bg-green-100 px-2 py-1 rounded border border-green-300 text-black flex items-center gap-1 text-sm font-bold whitespace-nowrap">
                                    <Banknote
                                      size={14}
                                      className="text-green-700"
                                    />
                                    {place.price_range || "料金未設定"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-1 text-gray-600 text-sm truncate">
                                <MapPin
                                  size={14}
                                  className="flex-shrink-0 mt-0.5"
                                />
                                <span className="font-medium truncate">
                                  {place.address || "住所未設定"}
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <button
                                onClick={() => navigate(`/places/${place._id}`)}
                                className="px-5 py-2.5 bg-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[1px_1px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all whitespace-nowrap text-sm lg:text-base"
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
              {totalPages > 1 && (
                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                  <PaginationControl
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
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