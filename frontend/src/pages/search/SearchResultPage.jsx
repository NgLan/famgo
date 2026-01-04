import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { List, Map as MapIcon } from 'lucide-react';
import SpotCard from '../../components/spot-card';
import FilterSidebar from './FilterSidebar';
import SearchInputSidebar from '../../components/filter-sidebar/SearchInputSidebar';
import PaginationControl from '../../components/common/PaginationControl';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const SearchResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // STATE
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // State dùng để đồng bộ hiển thị trên Sidebar (UI)
    const [tempFilterState, setTempFilterState] = useState({});

    // --- HÀM 1: QUAN TRỌNG NHẤT - GỌI API TRỰC TIẾP TỪ URL ---
    useEffect(() => {
        const fetchDataFromURL = async () => {
            setLoading(true);
            try {
                // BƯỚC 1: Đọc tham số trực tiếp từ URL (Source of Truth)
                // Không chờ state nữa, URL có gì thì gọi API cái đó ngay lập tức
                const params = {};
                const keys = [
                    'keyword', 'districts', 'age_ranges', 'category_ids', 
                    'price_filter', 'amenity_ids', 'open_time', 'crowd_level', 'min_rating', 'radius'
                ];
                
                // Gom dữ liệu từ URL vào biến params
                keys.forEach(key => {
                    const value = searchParams.get(key);
                    if (value) {
                         // Xử lý riêng cho amenity_ids nếu cần mảng cho Sidebar UI
                        if (key === 'amenity_ids' && value.includes(',')) {
                            params[key] = value.split(',');
                        } else {
                            params[key] = value;
                        }
                    }
                });

                // BƯỚC 2: Cập nhật UI Sidebar cho khớp với URL hiện tại
                setTempFilterState(params);

                // BƯỚC 3: Chuẩn bị gọi API
                const API_URL = 'http://localhost:3000/api/places/search';
                const apiQueryParams = new URLSearchParams();

                // Duyệt qua params vừa đọc được để append vào API query
                for (const key in params) {
                    let value = params[key];
                    if (Array.isArray(value)) value = value.join(',');
                    if (value && String(value).trim() !== '' && value !== 'all') {
                        apiQueryParams.append(key, String(value).trim());
                    }
                }

                // Thêm phân trang (map view load tất cả, list view phân trang)
                if (viewMode === 'map') {
                    apiQueryParams.append('page', 1);
                    apiQueryParams.append('limit', 100);
                } else {
                    apiQueryParams.append('page', page);
                    apiQueryParams.append('limit', 6);
                }

                const queryString = apiQueryParams.toString();
                const apiUrlWithQuery = `${API_URL}${queryString ? '?' + queryString : ''}`;
                
                console.log("Calling API with:", apiUrlWithQuery);

                // BƯỚC 4: Gọi Axios
                const response = await axios.get(apiUrlWithQuery);
                setSpots(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalResults(response.data.pagination.total);

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataFromURL();

    }, [searchParams, page, viewMode]); // CHỈ CHẠY KHI URL, PAGE HOẶC VIEW MODE THAY ĐỔI

    // --- HÀM 2: XỬ LÝ KHI BẤM NÚT 'LỌC' TRÊN SIDEBAR ---
    const handleApplyFilter = useCallback(() => {
        const params = new URLSearchParams();
        
        // Lấy dữ liệu từ Sidebar (tempFilterState) đẩy lên URL
        for (const key in tempFilterState) {
            let value = tempFilterState[key];
            if (Array.isArray(value)) value = value.join(',');
            
            if (value && String(value).trim() !== '' && value !== 'all') {
                params.append(key, value);
            }
        }
        
        // Giữ lại keyword cũ nếu đang tìm kiếm
        const currentKeyword = searchParams.get('keyword');
        if (currentKeyword) {
             params.set('keyword', currentKeyword);
        }

        // Reset về trang 1 khi lọc mới
        setPage(1); 

        // Fix lỗi dấu cộng: Replace + thành %20 để đồng bộ với Home
        const queryString = params.toString().replace(/\+/g, '%20');
        navigate(`/search?${queryString}`);
    }, [tempFilterState, searchParams, navigate]);

    const handleResetFilter = useCallback(() => {
        setTempFilterState({});
        navigate('/search');
    }, [navigate]);

    // ... (Các phần Map, Image Helper giữ nguyên không đổi)
    const getCenterCoordinates = () => {
        if (spots.length > 0) {
            const coords = spots[0].location.coordinates;
            return [coords[1], coords[0]];
        }
        return [21.0285, 105.8542];
    };

    const getSpotImageUrl = (spot) => {
        if (spot.thumbnail) return spot.thumbnail;
        if (Array.isArray(spot.images) && spot.images.length > 0) {
            const firstImage = spot.images[0];
            return typeof firstImage === 'string' ? firstImage : firstImage.url;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#FFFBF5' }}>
                <div className="max-w-[1600px] mx-auto px-4 py-6">
                    <div className="flex gap-6 items-start">
                        {/* Sidebar - Always Visible */}
                        <div className="w-80 flex-shrink-0 sticky top-6 self-start">
                            <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 3rem)' }}>
                                <SearchInputSidebar />
                                <div className="flex-1 min-h-0">
                                    <FilterSidebar
                                        tempFilterState={tempFilterState}
                                        setTempFilterState={setTempFilterState}
                                        onApply={handleApplyFilter}
                                        onReset={handleResetFilter}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Loading Content Area */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-6">
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-2xl font-black animate-pulse">読み込み中...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6" style={{ backgroundColor: '#FFFBF5' }}>
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="flex gap-6">
                    {/* Sidebar - Sticky */}
                    <div className="w-80 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] flex flex-col gap-4">
                        <SearchInputSidebar />
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
                    <div className="flex-1">
                        <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-lg font-black">
                                    {totalResults}件のスポットを表示
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center gap-2 px-6 py-2 border-2 border-black rounded-lg font-bold transition-all ${
                                            viewMode === 'list'
                                                ? 'bg-[#5BC0EB] text-black shadow-[3px_3px_0_0_#000]'
                                                : 'bg-white text-black shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#000]'
                                        }`}
                                    >
                                        <List size={18} />
                                        LIST
                                    </button>
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`flex items-center gap-2 px-6 py-2 border-2 border-black rounded-lg font-bold transition-all ${
                                            viewMode === 'map'
                                                ? 'bg-[#5BC0EB] text-black shadow-[3px_3px_0_0_#000]'
                                                : 'bg-white text-black shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#000]'
                                        }`}
                                    >
                                        <MapIcon size={18} />
                                        MAP
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {viewMode === 'list' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {spots.map((spot) => (
                                            <SpotCard key={spot.id || spot._id} spot={spot} />
                                        ))}
                                    </div>
                                    
                                    {/* Pagination */}
                                    <PaginationControl 
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </>
                            ) : (
                                <div className="h-[600px] w-full border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]">
                                    <MapContainer center={getCenterCoordinates()} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                        {spots.map((spot) => {
                                            const coords = spot.location?.coordinates;
                                            if (!coords) return null;
                                            return (
                                                <Marker position={[coords[1], coords[0]]} key={spot._id}>
                                                    <Popup>
                                                        <div className="font-sans">
                                                            <div className="font-bold text-base mb-1">{spot.name}</div>
                                                            <div className="text-sm text-gray-600 mb-2">{spot.address}</div>
                                                            <button
                                                                onClick={() => navigate(`/places/${spot._id}`)}
                                                                className="px-4 py-1 bg-[#FDE24F] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] transition-all"
                                                            >
                                                                詳細を見る
                                                            </button>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResultPage;
