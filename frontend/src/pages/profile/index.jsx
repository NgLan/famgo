import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import PlanCard from '../../components/plan-card';
import PaginationControl from '../../components/common/PaginationControl';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'plans' ? 'plans' : 'places';
  const fullName = getCookie('fullName');
  const token = getCookie('token');

  // Data State
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [favoritePlans, setFavoritePlans] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;

  // Trigger reload API
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleSwitchTab = (newTab) => {
    setSearchParams({ tab: newTab });
    setPage(1);
  };

  useEffect(() => {
    const userStr = getCookie('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      const user_id = user._id;

      const fetchData = async () => {
        try {
          if (activeTab === 'places') {
            // --- LOGIC PHÂN TRANG CHO PLACES (Giữ nguyên) ---
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

              if (spots.length === 0 && page > 1) {
                setPage(p => p - 1);
              }
            }
          } else {
            // --- [CẬP NHẬT] LOGIC PHÂN TRANG CHO PLANS ---
            // 1. Truyền page và LIMIT vào API
            const res = await getFavoritePlans(user_id, page, LIMIT);

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

              // 2. Cập nhật Total Pages từ API response
              // (Giả định API trả về cấu trúc pagination giống places: res.pagination.totalPages)
              setTotalPages(res.pagination?.totalPages || 1);

              // 3. Logic tự động lùi trang nếu xóa hết item ở trang hiện tại
              if (plans.length === 0 && page > 1) {
                setPage(p => p - 1);
              }
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
  }, [token, activeTab, page, refreshTrigger]);

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('fullName');
    deleteCookie('user');
    navigate('/login');
  };

  const triggerReload = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pb-10 pt-8 font-sans" style={{ backgroundColor: COLORS.bg }}>
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

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-4 flex-1">
                <button
                  onClick={() => handleSwitchTab('places')}
                  className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-black font-bold transition-all ${activeTab === 'places'
                      ? 'bg-[#FF90E8] shadow-[4px_4px_0_0_#000] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  <Heart size={20} className={activeTab === 'places' ? 'fill-black' : ''} />
                  <span>お気に入りリスト</span>
                </button>

                <button
                  onClick={() => handleSwitchTab('plans')}
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
              {activeTab === 'places' ? (
                favoriteSpots.length > 0 ? (
                  favoriteSpots.map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      isFavorite={true}
                      onToggleFavorite={(isFav) => {
                        if (!isFav) triggerReload();
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
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onUnlike={triggerReload}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] border-dashed">
                    <Frown size={64} strokeWidth={1.5} className="mb-4" />
                    <p className="font-bold text-lg">お気に入りプランがありません。</p>
                  </div>
                )
              )}
            </div>

            {/* --- [SỬA ĐỔI] HIỂN THỊ PHÂN TRANG CHO CẢ 2 TAB --- */}
            {totalPages > 1 && (
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