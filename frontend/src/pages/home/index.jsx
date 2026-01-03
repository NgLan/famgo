import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Baby,       // Icon cho trẻ nhỏ
  Backpack    // Icon cho học sinh (balo)
} from 'lucide-react';

// Import service & component
import { searchPlaces } from '../../services/place.services';
import CategoryCard from '../../components/category-card';

// --- CONFIG DATA ---
const THEME_COLORS = {
  bg: '#FFFBF5',
  pink: '#FF90E8',
  blue: '#5BC0EB',
  yellow: '#FDE24F',
};

// Dữ liệu Quận (Link ảnh mới ổn định hơn)
const DISTRICTS = [
  {
    name: 'タイホ', sub: 'Tây Hồ', value: 'Tây Hồ',
    // Ảnh Chùa Trấn Quốc / Hồ Tây
    image: 'https://images.vietnamtourism.gov.vn/vn/images/2022/thang_12/0612.phat-huy-gia-tri-cac-di-tich-lich-su-van-hoa.jpg',
    color: THEME_COLORS.pink
  },
  {
    name: 'ホアンキエム', sub: 'Hoàn Kiếm', value: 'Hoàn Kiếm',
    // Ảnh Tháp Rùa
    image: 'https://static.vinwonders.com/production/thap-rua-ho-guom-5.jpg',
    color: THEME_COLORS.blue
  },
  {
    name: 'カウザイ', sub: 'Cầu Giấy', value: 'Cầu Giấy',
    // Ảnh Công viên Cầu Giấy (hoặc đô thị)
    image: 'https://greenfuture.tech/_next/image?url=https%3A%2F%2Fupload-static.fgf.vn%2Fcms%2Fcong-vien-cau-giay-6.jpg&w=3840&q=100',
    color: THEME_COLORS.pink
  },
  {
    name: 'バーディン', sub: 'Ba Đình', value: 'Ba Đình',
    // Ảnh Hoàng Thành Thăng Long
    image: 'https://booking.muongthanh.com/upload_images/images/2024%20-%20Nh/H%C3%A0/thoi-diem-du-lich-hoang-thanh.jpg',
    color: THEME_COLORS.blue
  },
  {
    name: 'ロンビエン', sub: 'Long Biên', value: 'Long Biên',
    // Ảnh Cầu Long Biên
    image: 'https://nhakhachtld.vn/wp-content/uploads/2025/06/kham-pha-cau-long-bien-bieu-tuong-lich-su-ha-noi-qua-thoi-gian-3.jpg',
    color: THEME_COLORS.pink
  },
  {
    name: 'ドンダー', sub: 'Hai Bà Trưng', value: 'Hai Bà Trưng',
    // Ảnh Văn Miếu
    image: 'https://eholiday.vn/wp-content/uploads/2024/07/vinke-va-vinpearl-aquarium-7-1.jpg',
    color: THEME_COLORS.blue
  },
];

// Dữ liệu Độ tuổi (Dùng Component Icon thay vì Emoji)
const AGE_GROUPS = [
  {
    label: '1 - 5',
    subLabel: '幼児向け (1-5歳)',
    value: '1-5',
    color: THEME_COLORS.pink,
    // Dùng icon Baby từ Lucide
    icon: <Baby size={90} strokeWidth={1.5} />
  },
  {
    label: '6 - 12',
    subLabel: '小学生向け (6-12歳)',
    value: '6-12',
    color: THEME_COLORS.blue,
    // Dùng icon Backpack (Balo) từ Lucide
    icon: <Backpack size={90} strokeWidth={1.5} />
  },
];

function Home() {
  const navigate = useNavigate();
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const fetchPopularData = async () => {
      try {
        setLoading(true);
        const res = await searchPlaces({ sort_by: 'rating', limit: 5, view: 'list' });
        if (res && res.data) setPopularPlaces(res.data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPopularData();
  }, []);

  useEffect(() => {
    if (popularPlaces.length <= 1) return;
    const interval = setInterval(() => setSlideIndex((p) => (p + 1) % popularPlaces.length), 5000);
    return () => clearInterval(interval);
  }, [popularPlaces.length]);

  const nextSlide = () => setSlideIndex((i) => (i + 1) % popularPlaces.length);
  const prevSlide = () => setSlideIndex((i) => (i - 1 + popularPlaces.length) % popularPlaces.length);

  return (
    <div className="min-h-screen pb-20 pt-8 font-sans" style={{ backgroundColor: THEME_COLORS.bg }}>

      {/* 1. SLIDER SECTION */}
      <div className="max-w-[1400px] mx-auto px-4 mb-16 relative group">
        <div className="relative w-full h-[350px] md:h-[550px] rounded-2xl border-[3px] border-black shadow-[8px_8px_0_0_#000] overflow-hidden bg-white">
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 font-bold">LOADING...</div>
          ) : popularPlaces.length > 0 ? (
            <>
              {popularPlaces.map((place, index) => (
                <div
                  key={place._id}
                  onClick={() => navigate(`/places/${place._id}`)}
                  className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${index === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img src={place.thumbnail || 'https://via.placeholder.com/1600x900'} alt={place.name} className="w-full h-full object-cover" />

                  {/* Info Box */}
                  <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] p-6 rounded-xl max-w-[85%] md:max-w-[500px] hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#FDE24F] px-2 py-0.5 border border-black rounded text-xs font-black tracking-wider text-black">POPULAR</span>
                      <div className="flex items-center text-black font-bold">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{place.rating}</span>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black mb-1 leading-tight line-clamp-2 text-black">{place.name}</h2>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">{place.description}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (<div className="flex items-center justify-center h-full">データがありません</div>)}
        </div>

        {/* Controls */}
        {popularPlaces.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute top-1/2 left-8 md:left-10 z-20 w-12 h-12 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all -translate-y-1/2"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute top-1/2 right-8 md:right-10 z-20 w-12 h-12 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all -translate-y-1/2"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* 2. AREA SECTION */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Sparkles className="w-8 h-8 text-[#FF90E8] fill-current" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
              エリア別
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {DISTRICTS.map((district) => (
              <CategoryCard
                key={district.value}
                variant="district"
                title={district.name}
                subtitle={district.sub}
                image={district.image}
                color={district.color}
                onClick={() => navigate(`/search?districts=${encodeURIComponent(district.value)}`)}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-8 py-3 bg-[#FDE24F] border-2 border-black rounded-full font-black text-black shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0_0_#000] transition-all"
            >
              すべて見る <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* 3. AGE SECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Baby className="w-8 h-8 text-[#5BC0EB] fill-current" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
              年齢別
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {AGE_GROUPS.map((age) => (
              <CategoryCard
                key={age.value}
                variant="age"
                title={age.label}
                subtitle={age.subLabel}
                icon={age.icon} // Truyền component Lucide đã render
                color={age.color}
                onClick={() => navigate(`/search?age_ranges=${age.value}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
