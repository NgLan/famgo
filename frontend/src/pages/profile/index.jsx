import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Calendar,
  LogOut,
  MapPin,
  Frown
} from 'lucide-react';
import { getCookie, deleteCookie } from '../../helpers/cookies.helper';
import { getFavoritePlaces, getFavoritePlans, removeFavoritePlace, unlikeDayPlan } from '../../services/favorite.services';
import SpotCard from '../../components/spot-card';
import PaginationControl from '../../components/common/PaginationControl'; // Import Component Mới

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const fullName = getCookie('fullName');
  const token = getCookie('token');

  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [favoritePlans, setFavoritePlans] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;

  const COLORS = {
    bg: '#FFFBF5',
    pink: '#FF90E8',
    blue: '#5BC0EB',
    yellow: '#FDE24F',
    red: '#FF6B6B'
  };

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    const userStr = getCookie('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      const user_id = user._id;

      const fetchData = async () => {
        try {
          if (activeTab === 'favorites') {
            const res = await getFavoritePlaces(user_id, page, LIMIT);
            if (res?.data) {
              const spots = res.data.map(f => ({
                ...f,
                id: f.place_id || f._id,
                _id: f.place_id || f._id,
                thumbnail: (f.images?.[0]?.url || f.images?.[0]) || null
              }));
              setFavoriteSpots(spots);
              setTotalPages(res.pagination?.totalPages || 1);
            }
          } else {
            const res = await getFavoritePlans(user_id);
            if (res?.data) {
              const plans = res.data.map(p => ({
                id: p.day_plan_id || p._id,
                name: p.title || p.name || 'Plan',
                description: p.description,
                image: p.images?.[0]?.url || null,
                total_likes: p.total_likes || 0,
                places: p.places || []
              }));
              setFavoritePlans(plans);
            }
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchData();
    } catch (e) {
      console.warn("Invalid user cookie");
    }
  }, [token, activeTab, page]);

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('fullName');
    deleteCookie('user');
    navigate('/login');
  };

  const PlanCard = ({ plan }) => (
    <div
      onClick={() => navigate(`/schedule/${plan.id}`)}
      className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="h-40 bg-gray-200 border-b-2 border-black relative">
        <img src={plan.image || 'https://via.placeholder.com/300x200'} alt={plan.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
          <Heart size={12} className="fill-red-500 text-red-500" /> {plan.total_likes}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-lg mb-1 line-clamp-1">{plan.name}</h3>
        <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
          <MapPin size={12} /> {plan.places.length} 箇所 (Địa điểm)
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 flex-1">{plan.description || "Mô tả không có sẵn."}</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              unlikeDayPlan(JSON.parse(getCookie('user'))._id, plan.id).then(() => {
                setFavoritePlans(prev => prev.filter(p => p.id !== plan.id));
              });
            }}
            className="flex-1 py-1.5 border-2 border-black rounded font-bold text-xs bg-red-100 hover:bg-red-200 text-red-600 shadow-[2px_2px_0_0_#000] active:shadow-none transition-all"
          >
            Hủy thích
          </button>
          <button className="flex-[2] py-1.5 bg-[#FDE24F] border-2 border-black rounded font-bold text-xs hover:bg-[#FCE040] shadow-[2px_2px_0_0_#000] active:shadow-none transition-all">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-10 pt-8 font-sans" style={{ backgroundColor: COLORS.bg }}>
      {/* 
        SỬA 1: Giảm padding và max-width để nội dung gọn hơn 
        Trước: max-w-7xl px-4 -> Sau: max-w-[1280px] px-6
      */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* --- SIDEBAR --- */}
          <div className="md:col-span-3">
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[6px_6px_0_0_#000] sticky top-8 flex flex-col h-[calc(100vh-100px)]">

              {/* Avatar Info */}
              <div className="flex flex-col items-center mb-8 mt-4">
                <div className="w-24 h-24 rounded-full border-2 border-black overflow-hidden mb-3 shadow-[4px_4px_0_0_#000]">
                  <div className="w-full h-full bg-[#5BC0EB] flex items-center justify-center">
                    <User size={48} color="white" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-center text-black tracking-tight">{fullName || 'Guest User'}</h2>

              </div>



              {/* Navigation Menu (flex-1 để đẩy nút Logout xuống đáy) */}
              <nav className="flex flex-col gap-4 flex-1">
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-black font-bold transition-all ${activeTab === 'favorites'
                      ? 'bg-[#FF90E8] shadow-[4px_4px_0_0_#000] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  <Heart size={20} className={activeTab === 'favorites' ? 'fill-black' : ''} />
                  <span>お気に入りリスト</span>
                </button>

                <button
                  onClick={() => setActiveTab('plans')}
                  className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-black font-bold transition-all ${activeTab === 'plans'
                      ? 'bg-[#5BC0EB] shadow-[4px_4px_0_0_#000] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  <Calendar size={20} className={activeTab === 'plans' ? 'fill-black' : ''} />
                  <span>お気に入りプラン</span>
                </button>
              </nav>



              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold text-red-600 hover:bg-red-50 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-[1px] active:shadow-none"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="md:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'favorites' ? (
                favoriteSpots.length > 0 ? (
                  favoriteSpots.map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      isFavorite={true}
                      onToggleFavorite={(isFav) => {
                        if (!isFav) setFavoriteSpots(prev => prev.filter(s => s.id !== spot.id))
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] border-dashed">
                    <Frown size={64} strokeWidth={1.5} className="mb-4" />
                    <p className="font-bold text-lg">お気に入りリストがありません。</p>
                  </div>
                )
              ) : (
                favoritePlans.length > 0 ? (
                  favoritePlans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] border-dashed">
                    <Frown size={64} strokeWidth={1.5} className="mb-4" />
                    <p className="font-bold text-lg">お気に入りプランがありません。</p>
                  </div>
                )
              )}
            </div>

            {/* PHÂN TRANG KIỂU MỚI (Dark Pill) */}
            {activeTab === 'favorites' && totalPages > 1 && (
              <PaginationControl
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;