import { useEffect, useState } from "react";
import {
  Heart,
  MapPin,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  StickyNote,
  Banknote,
} from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getCookie } from "../../helpers/cookies.helper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  likeDayPlan,
  unlikeDayPlan,
  checkLikeDayPlan,
} from "../../services/favorite.services";

const API_URL = import.meta.env.VITE_API_URL;

export default function Schedule() {
  const [plansData, setPlansData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [likedPlans, setLikedPlans] = useState({});
  const navigate = useNavigate();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [ageRange, setAgeRange] = useState("all");

  // Applied filters (for actual API call)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    province: "",
    area: "",
    price_min: null,
    price_max: null,
    age_min: null,
    age_max: null,
  });

  useEffect(() => {
    const fetchDayPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/day-plans`, {
          params: { page },
        });

        const plans = response.data?.data ?? [];
        setPlansData(plans);
        setTotalPages(response.data?.pagination?.totalPages ?? 1);

        // check liked for each plan
        const userStr = getCookie("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const likedMap = {};

          await Promise.all(
            plans.map(async (plan) => {
              try {
                const chk = await checkLikeDayPlan(user._id, plan.id);
                likedMap[plan.id] = !!chk?.data?.is_liked;
              } catch {
                likedMap[plan.id] = false;
              }
            })
          );

          setLikedPlans(likedMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDayPlans();
  }, [page, appliedFilters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleLike = async (planId) => {
    const userStr = getCookie("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const isLiked = likedPlans[planId];

    try {
      if (isLiked) {
        await unlikeDayPlan(user._id, planId);
      } else {
        await likeDayPlan(user._id, planId);
      }

      setLikedPlans((prev) => ({
        ...prev,
        [planId]: !isLiked,
      }));

      setPlansData((prev) =>
        prev.map((p) =>
          p.id === planId
            ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyFilters = () => {
    let price_min = null;
    let price_max = null;

    switch (priceRange) {
      case "free":
        price_min = 0;
        price_max = 0;
        break;
      case "0-150k":
        price_min = 0;
        price_max = 15000;
        break;
      case "150k-600k":
        price_min = 150000;
        price_max = 600000;
        break;
      case "250k-1m":
        price_min = 250000;
        price_max = 1000000;
        break;
      case "1m+":
        price_min = 1000000;
        price_max = null;
        break;
      default:
        break;
    }

    let age_min = null;
    let age_max = null;

    switch (ageRange) {
      case "0-5":
        age_min = 0;
        age_max = 5;
        break;
      case "6-12":
        age_min = 6;
        age_max = 12;
        break;
    }

    setAppliedFilters({
      search: searchText.trim(),
      province: selectedProvince,
      area: selectedArea,
      price_min,
      price_max,
      age_min,
      age_max,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedProvince("");
    setSelectedArea("");
    setPriceRange("all");
    setAgeRange("all");
    setAppliedFilters({
      search: "",
      province: "",
      area: "",
      price_min: null,
      price_max: null,
      age_min: null,
      age_max: null,
    });
    setPage(1);
  };

  const RadioOption = ({ value, currentValue, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="radio"
          checked={currentValue === value}
          onChange={() => onChange(value)}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-black rounded-full peer-checked:bg-[#5BC0EB] peer-checked:border-[#5BC0EB] transition-all"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
      </div>
      <span className="font-bold text-sm group-hover:text-[#5BC0EB] transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5] py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black inline-block relative">
              <span className="relative z-10">おすすめ一日プラン</span>
              <span className="absolute bottom-0 left-0 w-full h-3 -z-0 -rotate-1"></span>
            </h1>
          </div>
          <Link
            to="/schedule/create"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all"
          >
            <Plus size={20} />
            1日プラン作成
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
            {loading ? (
              <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] p-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-[#5BC0EB] border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold text-lg">読み込み中...</span>
                </div>
              </div>
            ) : plansData.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">
                  スケジュールがありません
                </h3>
                <p className="text-gray-500">
                  最初のスケジュールを作成してみましょう！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {plansData.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex flex-col"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b-2 border-dashed border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            plan.user.avatar || "https://via.placeholder.com/40"
                          }
                          alt={plan.user.fullName}
                          className="w-10 h-10 rounded-full border-2 border-black object-cover"
                        />
                        <span className="font-bold text-sm">
                          {plan.user.fullName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleLike(plan.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-full"
                        >
                          {likedPlans[plan.id] ? (
                            <FavoriteIcon sx={{ color: "#f44336" }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                          <span className="font-black text-lg">
                            {plan.likes}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="relative h-44">
                      <img
                        src={
                          plan.cover || "https://via.placeholder.com/400x200"
                        }
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-black text-lg mb-2 line-clamp-1">
                        {plan.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {plan.description}
                      </p>

                      {/* Info Tags */}
                      <div className="space-y-2 mb-4">
                        {/* <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} className="text-[#5BC0EB]" />
                          <span>{plan.province?.[0] || '未設定'} · {plan.area?.[0] || '未設定'}</span>
                        </div> */}
                        <div className="flex flex-col gap-2">
                          <span className="badge badge-green w-fit">
                            <Banknote size={12} />
                            {plan.price_range || "料金未設定"}
                          </span>

                          <span className="badge badge-orange w-fit">
                            <Users size={12} />
                            {plan.age || "全年齢"}
                          </span>

                          {plan.note && (
                            <span className="badge badge-orange w-fit">
                              <StickyNote size={12} />
                              {plan.note}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-auto pt-3 border-t-2 border-dashed border-gray-200 flex items-center justify-center">
                        <button
                          onClick={() => navigate(`/schedule/${plan.id}`)}
                          className="px-4 py-2 bg-[#5BC0EB] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                        >
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                        page === pageNum
                          ? "bg-[#5BC0EB] text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, page + 1))
                  }
                  disabled={page === totalPages}
                  className="w-10 h-10 bg-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Filter Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
            <div className="sticky top-20">
              <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000]">
                {/* Search Header */}

                <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="場所名を入力..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleApplyFilters()
                      }
                      className="w-full px-4 py-3 pr-12 border-2 border-black rounded-xl font-medium shadow-[2px_2px_0_0_#000] focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all"
                    />
                    <button
                      onClick={handleApplyFilters}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Search size={20} />
                    </button>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  {/* Province/Area */}
                  <div>
                    <h3 className="font-black mb-2 text-sm">フィルター</h3>
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] appearance-none cursor-pointer focus:outline-none transition-all text-sm"
                        >
                          <option value="">都道府県</option>
                          <option value="東京都">ハノイ</option>
                          <option value="大阪府">ホーチミン</option>
                          <option value="神奈川県">ダナン</option>
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          size={16}
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] appearance-none cursor-pointer focus:outline-none transition-all text-sm"
                        >
                          <option value="">区・郡</option>
                          <option value="渋谷区">ホアンキエム</option>
                          <option value="中央区">ハイバーチュン</option>
                          <option value="横浜市">タイホー</option>
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          size={16}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-black mb-2 text-sm">💰 料金範囲</h3>
                    <div className="space-y-1">
                      <RadioOption
                        value="all"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="すべて"
                      />
                      <RadioOption
                        value="free"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="無料"
                      />
                      <RadioOption
                        value="0-150k"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="0円 - 1,000円"
                      />
                      <RadioOption
                        value="150k-600k"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="1,000円 - 4,000円"
                      />
                      <RadioOption
                        value="250k-1m"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="1,500円 - 6,000円"
                      />
                      <RadioOption
                        value="1m+"
                        currentValue={priceRange}
                        onChange={setPriceRange}
                        label="6,000円以上"
                      />
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  {/* Age Range */}
                  <div>
                    <h3 className="font-black mb-2 text-sm">👨‍👩‍👧‍👦 対象年齢</h3>
                    <div className="space-y-1">
                      <RadioOption
                        value="all"
                        currentValue={ageRange}
                        onChange={setAgeRange}
                        label="すべて"
                      />
                      <RadioOption
                        value="0-5"
                        currentValue={ageRange}
                        onChange={setAgeRange}
                        label="0 - 5歳"
                      />
                      <RadioOption
                        value="6-12"
                        currentValue={ageRange}
                        onChange={setAgeRange}
                        label="6 - 12歳"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 p-4 border-t-2 border-black">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 py-3 bg-[#5BC0EB] border-2 border-black rounded-lg font-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2"
                  >
                    <Filter size={18} />
                    絞り込む
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-3 bg-white border-2 border-black rounded-lg font-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] transition-all"
                  >
                    リセット
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
