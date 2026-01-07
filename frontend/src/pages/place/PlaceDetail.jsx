import React, { useState, useEffect } from "react";
// 1. Thêm import useLocation
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Star,
  Navigation,
  ChevronLeft
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getCookie } from "../../helpers/cookies.helper";
import {
  addFavoritePlace,
  removeFavoritePlace,
  checkFavoritePlace,
} from "../../services/favorite.services";
import CommentSection from "../../components/comments/CommentSection";
import ReviewDialog from "../../components/reviews/ReviewDialog";
import ReviewStatsSection from "../../components/reviews/ReviewStatsSection";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL; 

const COLORS = {
  bg: '#FFFBF5',
  pink: '#FF90E8',
  blue: '#5BC0EB',
  yellow: '#FDE24F',
  red: '#FF6B6B'
};

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 2. Lấy location
  const location = useLocation();
  
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [refreshStatsKey, setRefreshStatsKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailResponse = await axios.get(`${API_URL}/api/places/${id}`);
        const respData = detailResponse.data;
        const place = respData?.data || respData;

        setPlaceData(place);

        try {
          const userStr = getCookie("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            const chk = await checkFavoritePlace(user._id, id);
            if (chk && chk.data && typeof chk.data.is_favorite !== "undefined") {
              setIsFavorite(!!chk.data.is_favorite);
            }
          }
        } catch {
          // Silent fail or warning
        }
      } catch {
        toast.error("詳細情報の取得中にエラーが発生しました。");
        setError("詳細を読み込めません。IDをご確認ください。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ... (giữ nguyên fetchReviews, handle render loading/error)

  const fetchReviews = async () => {
    try {
      await axios.get(`${API_URL}/api/reviews/place/${id}?limit=2`);
      setRefreshStatsKey((prev) => prev + 1);
    } catch {
      toast.error("レビューの読み込みに失敗しました。");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!placeData) return null;

  const {
    name, rating, total_reviews, images, price_range,
    address, description, related_places, age_limit, location: placeLocation,
  } = placeData;

  return (
    <div className="min-h-screen pb-10 pt-8 font-sans" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-[1400px] mx-auto px-4">
        {/* ... (Các phần hiển thị Header, Image, Content giữ nguyên) */}
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
        >
          <ChevronLeft size={20} />
          <span>戻る</span>
        </button>

        <div className="mb-6">
           <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{name}</h1>
           {/* ... (Rating section giữ nguyên) */}
             <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {rating > 0 ? (
                  [...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={24}
                      className={index < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}
                    />
                  ))
                ) : (
                  <span className="text-sm text-gray-500">評価なし</span>
                )}
              </div>
              <span className="font-bold text-lg">{rating > 0 ? Number(rating).toFixed(1) : "N/A"}</span>
              <span className="text-gray-600">({total_reviews || 0} レビュー)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={20} />
              <span>{address || "住所情報なし"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
             <div className="relative w-full h-[350px] md:h-[500px] rounded-xl border-2 border-black shadow-[6px_6px_0_0_#000] overflow-hidden bg-white mb-6">
              <img
                src={images && images.length > 0 ? images[0].url : "https://via.placeholder.com/800x450?text=No+Image"}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0_0_#000] mb-6" style={{ backgroundColor: '#FFF0F9' }}>
              <h2 className="text-2xl font-black mb-3">詳細説明</h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
            
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0_0_#000]" style={{ backgroundColor: '#F0F9FF' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black">レビュー</h2>
                <button
                  onClick={() => {
                    const userStr = getCookie("user");
                    if (!userStr) {
                      toast.info("レビューを書くにはログインが必要です。");
                      // Cũng điều hướng login tại đây nếu muốn
                       navigate("/login", { state: { from: location } });
                      return;
                    }
                    setOpenReviewDialog(true);
                  }}
                  className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  評価する
                </button>
              </div>
              <div className="mb-6">
                <ReviewStatsSection placeId={id} refreshTrigger={refreshStatsKey} />
              </div>
              <div className="border-t-2 border-black my-6"></div>
              <CommentSection placeId={id} placeName={name} />
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div className="md:sticky md:top-4 space-y-4">
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
                {/* ... (Thông tin giá, giờ, tuổi giữ nguyên) */}
                 <h3 className="text-lg font-black mb-3">基本情報</h3>
                <div className="border-t-2 border-black mb-3"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.pink }}>
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-bold">料金</div>
                      <div className="font-bold">{price_range || "詳細はお問い合わせください"}</div>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.blue }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-bold">営業時間</div>
                      <div className="font-bold">8:00 - 18:00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.yellow }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-bold">対象年齢</div>
                      <div className="font-bold">
                        {age_limit?.min || "0"} - {age_limit?.max || "全年齢"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS.pink }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-bold">住所</div>
                      <div className="font-bold text-sm">{address || "更新中"}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-black my-3"></div>

                {/* 3. Logic nút tim (Sửa đổi) */}
                <button
                  onClick={async () => {
                    const userStr = getCookie("user");
                    if (!userStr) {
                      toast.info("この機能を使用するにはログインが必要です。");
                      // Chuyển hướng kèm state location
                      navigate("/login", { state: { from: location } });
                      return;
                    }
                    const user = JSON.parse(userStr);
                    try {
                      if (isFavorite) {
                        await removeFavoritePlace(user._id, id);
                        setIsFavorite(false);
                        toast.success("お気に入りから削除しました");
                      } else {
                        await addFavoritePlace(user._id, id);
                        setIsFavorite(true);
                        toast.success("お気に入りに追加しました");
                      }
                    } catch (err) {
                      console.error("Toggle favorite error", err);
                      toast.error("お気に入り更新中にエラーが発生しました");
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.backgroundColor = COLORS.pink;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.backgroundColor = COLORS.blue;
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
                  style={{ backgroundColor: isFavorite ? COLORS.red : COLORS.blue, color: isFavorite ? 'white' : 'black' }}
                >
                  <Heart size={20} className={isFavorite ? "fill-white" : ""} />
                  <span>{isFavorite ? "お気に入りを外す" : "お気に入りに追加"}</span>
                </button>
              </div>

              {/* Map section giữ nguyên */}
               <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
                <h3 className="text-lg font-black mb-3">地図上の場所</h3>
                <div className="h-[220px] w-full rounded-lg border-2 border-black overflow-hidden mb-3">
                  {placeLocation?.coordinates ? (
                    <MapContainer
                      center={[placeLocation.coordinates[1], placeLocation.coordinates[0]]}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                      key={placeLocation.coordinates[0]}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={[placeLocation.coordinates[1], placeLocation.coordinates[0]]}>
                        <Popup>{name}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      位置情報がありません
                    </div>
                  )}
                </div>
                {placeLocation?.coordinates && (
                  <button
                    onClick={() => {
                      const [lng, lat] = placeLocation.coordinates;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all group"
                    style={{ backgroundColor: COLORS.pink }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.blue}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.pink}
                  >
                    <Navigation size={18} />
                    <span>行き方</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Places Section giữ nguyên */}
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-black mb-6">関連スポット</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {related_places?.slice(0, 5).map((place, index) => (
              <div
                key={place._id}
                onClick={() => navigate(`/places/${place._id}`)}
                className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] transition-all"
                style={{ backgroundColor: index % 3 === 0 ? '#FFF9F0' : index % 3 === 1 ? '#FFF0F9' : '#F0F9FF' }}
              >
               <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={place.thumbnail || "https://via.placeholder.com/200x150"}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {place.name}
                  </h3>
                   <div className="flex items-center gap-1 mb-2">
                    {place.rating > 0 ? (
                      <>
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={12}
                            className={index < Math.round(place.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}
                          />
                        ))}
                        <span className="text-xs ml-1 text-gray-600">{Number(place.rating).toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">評価なし</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {place.price_range}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ReviewDialog
          open={openReviewDialog}
          onClose={() => setOpenReviewDialog(false)}
          placeId={id}
          onReviewSuccess={() => {
            fetchReviews();
          }}
        />
      </div>
    </div>
  );
};

export default PlaceDetail;