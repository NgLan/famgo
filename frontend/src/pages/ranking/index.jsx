import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../search/FilterSidebar';
import { getCookie } from '../../helpers/cookies.helper';
import {
  addFavoritePlace,
  removeFavoritePlace,
} from '../../services/favorite.services';

const RankingPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [filterState, setFilterState] = useState({});
  const [tempFilterState, setTempFilterState] = useState({});

  // Fetch ranking data
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        for (const key in filterState) {
          let value = filterState[key];
          if (Array.isArray(value)) {
            value = value.join(',');
          }
          if (value && value !== 'all') {
            params.append(key, value);
          }
        }

        params.append('page', page);
        params.append('limit', 5);
        params.append('sort_by', 'rating');

        const response = await axios.get(
          `http://localhost:3000/api/places/search?${params.toString()}`
        );

        setPlaces(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ranking:', error);
        setLoading(false);
      }
    };

    fetchRanking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filterState, page]);

  const toggleFavorite = async (placeId) => {
    const userStr = getCookie('user');
    if (!userStr) {
      alert('この機能を使用するにはログインしてください');
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
      console.error('Toggle favorite error', err);
      alert('お気に入りの更新中にエラーが発生しました');
    }
  };

  const getSpotImageUrl = (place) => {
    if (place.images && Array.isArray(place.images) && place.images.length > 0) {
      const firstImage = place.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (typeof firstImage === 'object' && firstImage !== null) {
        return firstImage.url || firstImage.src || firstImage.path || null;
      }
    }
    return null;
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) return 'bg-[#FFD700] text-black';
    if (rank === 2) return 'bg-[#C0C0C0] text-black';
    if (rank === 3) return 'bg-[#CD7F32] text-white';
    return 'bg-[#5BC0EB] text-white';
  };

  if (loading && places.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-[#FF90E8] border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold text-lg">読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black inline-block relative">
            <span className="relative z-10">🏆 スポットランキング</span>
            <span className="absolute bottom-0 left-0 w-full h-3 bg-[#FF90E8] -z-0 -rotate-1"></span>
          </h1>
          <p className="text-gray-600 mt-2 font-medium">人気のお出かけスポットをチェック</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* FilterSidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-6">
              <FilterSidebar
                tempFilterState={tempFilterState}
                setTempFilterState={setTempFilterState}
                onApply={() => {
                  setFilterState(tempFilterState);
                  setPage(1);
                }}
                onReset={() => {
                  setTempFilterState({});
                  setFilterState({});
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Ranking Items */}
            <div className="space-y-4">
              {places.length === 0 ? (
                <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">該当するスポットがありません</h3>
                  <p className="text-gray-500">フィルター条件を変更してお試しください</p>
                </div>
              ) : (
                places.map((place, index) => {
                  const imageUrl = getSpotImageUrl(place);
                  const isFavorite = favorites.has(place._id);
                  const rankingNumber = (page - 1) * 5 + index + 1;

                  return (
                    <div
                      key={place._id}
                      className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Ranking Number */}
                        <div className="flex md:flex-col items-center justify-center p-4 md:p-6 md:border-r-2 border-b-2 md:border-b-0 border-black bg-[#FFFBF5]">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${getRankBadgeStyle(rankingNumber)} border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black text-2xl md:text-3xl`}>
                            {rankingNumber}
                          </div>
                          <span className="ml-3 md:ml-0 md:mt-2 text-sm font-bold text-gray-500">位</span>
                        </div>

                        {/* Image */}
                        <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <MapPin size={40} className="text-gray-400" />
                            </div>
                          )}
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(place._id);
                            }}
                            className={`absolute top-3 right-3 w-10 h-10 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center transition-all hover:scale-110 ${
                              isFavorite ? 'bg-[#FF90E8]' : 'bg-white'
                            }`}
                          >
                            <Heart
                              size={20}
                              className={isFavorite ? 'fill-white text-white' : 'text-black'}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 md:p-6 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-black mb-2 hover:text-[#5BC0EB] transition-colors">
                              {place.name}
                            </h3>

                            {/* Address */}
                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                              <MapPin size={14} />
                              <span>{place.address || '住所未設定'}</span>
                            </div>

                            {/* Rating & Reviews */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-1 bg-[#FDE24F] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000]">
                                <Star size={16} className="fill-black text-black" />
                                <span className="font-bold">{place.rating || '0.0'}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ({place.total_reviews || 0} レビュー)
                              </span>
                            </div>

                            {/* Description */}
                            {place.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {place.description}
                              </p>
                            )}

                            {/* Price */}
                            <div className="inline-flex items-center gap-1 bg-[#E8F5E9] px-3 py-1 rounded-full border-2 border-black text-sm font-bold">
                              💰 {place.price_range || '料金未設定'}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                            <button
                              onClick={() => navigate(`/places/${place._id}`)}
                              className="w-full md:w-auto px-6 py-3 bg-[#5BC0EB] border-2 border-black rounded-xl font-bold shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[1px_1px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all"
                            >
                              詳細を見る →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                      page === pageNum
                        ? 'bg-[#FF90E8] text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

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
  );
};

export default RankingPage;
