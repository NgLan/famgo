import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { List, Map as MapIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import SpotCard from '../../components/spot-card';
import FilterSidebar from './FilterSidebar';
import SearchInputSidebar from '../../components/filter-sidebar/SearchInputSidebar';
import PaginationControl from '../../components/common/PaginationControl';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { getCookie } from '../../helpers/cookies.helper';
import { 
    addFavoritePlace, 
    removeFavoritePlace, 
    getFavoritePlaces 
} from '../../services/favorite.services';

const BASE_API_URL = import.meta.env.VITE_API_URL; 

const SearchResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation(); // Hook này sẽ tự update khi URL thay đổi (VD: khi filter)

    // STATE
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [tempFilterState, setTempFilterState] = useState({});
    const [favorites, setFavorites] = useState(new Set());

    // --- 1. FETCH FAVORITES ---
    useEffect(() => {
        const fetchUserFavorites = async () => {
            const userStr = getCookie('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const res = await getFavoritePlaces(user._id, 1, 100);
                    if (res?.data) {
                        const favoriteIds = new Set(res.data.map(item => item.place_id || item._id));
                        setFavorites(favoriteIds);
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
            }
        };
        fetchUserFavorites();
    }, []);

    // --- 2. FETCH DATA FROM URL ---
    useEffect(() => {
        const fetchDataFromURL = async () => {
            setLoading(true);
            try {
                const params = {};
                const keys = [
                    'keyword', 'districts', 'age_ranges', 'category_ids', 
                    'price_filter', 'amenity_ids', 'open_time', 'crowd_level', 'min_rating', 'radius'
                ];
                
                keys.forEach(key => {
                    const value = searchParams.get(key);
                    if (value) {
                        if (key === 'amenity_ids' && value.includes(',')) {
                            params[key] = value.split(',');
                        } else {
                            params[key] = value;
                        }
                    }
                });

                setTempFilterState(params);

                const API_URL = `${BASE_API_URL}/api/places/search`;
                const apiQueryParams = new URLSearchParams();

                for (const key in params) {
                    let value = params[key];
                    if (Array.isArray(value)) value = value.join(',');
                    if (value && String(value).trim() !== '' && value !== 'all') {
                        apiQueryParams.append(key, String(value).trim());
                    }
                }

                if (viewMode === 'map') {
                    apiQueryParams.append('page', 1);
                    apiQueryParams.append('limit', 100);
                } else {
                    apiQueryParams.append('page', page);
                    apiQueryParams.append('limit', 6);
                }

                const queryString = apiQueryParams.toString();
                const apiUrlWithQuery = `${API_URL}${queryString ? '?' + queryString : ''}`;
                
                const response = await axios.get(apiUrlWithQuery);
                setSpots(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalResults(response.data.pagination.total);

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                toast.error("データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchDataFromURL();

    }, [searchParams, page, viewMode]);

    // --- 3. FILTER HANDLERS ---
    const handleApplyFilter = useCallback(() => {
        const params = new URLSearchParams();
        for (const key in tempFilterState) {
            let value = tempFilterState[key];
            if (Array.isArray(value)) value = value.join(',');
            if (value && String(value).trim() !== '' && value !== 'all') {
                params.append(key, value);
            }
        }
        const currentKeyword = searchParams.get('keyword');
        if (currentKeyword) params.set('keyword', currentKeyword);

        setPage(1); 
        const queryString = params.toString().replace(/\+/g, '%20');
        navigate(`/search?${queryString}`);
    }, [tempFilterState, searchParams, navigate]);

    const handleResetFilter = useCallback(() => {
        setTempFilterState({});
        navigate('/search');
    }, [navigate]);

    // --- 4. TOGGLE FAVORITE (ĐÃ SỬA LOGIC REDIRECT) ---
    const handleToggleFavorite = async (placeId) => {
        const userStr = getCookie('user');

        if (!userStr) {
            toast.info("この機能を使用するにはログインが必要です。");
            // QUAN TRỌNG: Truyền object rõ ràng gồm pathname và search
            // location.search chứa chuỗi query (VD: ?keyword=hanoi&page=1)
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
        } catch (error) {
            console.error("Toggle favorite error:", error);
            toast.error("エラーが発生しました");
        }
    };

    const getCenterCoordinates = () => {
        if (spots.length > 0) {
            const coords = spots[0].location.coordinates;
            return [coords[1], coords[0]];
        }
        return [21.0285, 105.8542];
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#FFFBF5' }}>
                <div className="max-w-[1600px] mx-auto px-4 py-6">
                     <div className="flex items-center justify-center h-[50vh]">
                        <div className="text-2xl font-black animate-pulse">読み込み中...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6" style={{ backgroundColor: '#FFFBF5' }}>
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="flex gap-6">
                    {/* Sidebar */}
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
                    <div className="flex-1 min-w-0">
                        <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-lg font-black">
                                    {totalResults}件のスポットを表示
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-6 py-2 border-2 border-black rounded-lg font-bold transition-all ${viewMode === 'list' ? 'bg-[#5BC0EB] shadow-[3px_3px_0_0_#000]' : 'bg-white hover:shadow-[3px_3px_0_0_#000]'}`}>
                                        <List size={18} /> LIST
                                    </button>
                                    <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-6 py-2 border-2 border-black rounded-lg font-bold transition-all ${viewMode === 'map' ? 'bg-[#5BC0EB] shadow-[3px_3px_0_0_#000]' : 'bg-white hover:shadow-[3px_3px_0_0_#000]'}`}>
                                        <MapIcon size={18} /> MAP
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'list' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {spots.map((spot) => (
                                            <SpotCard 
                                                key={spot.id || spot._id} 
                                                spot={spot}
                                                isFavorite={favorites.has(spot._id)}
                                                onToggleFavorite={() => handleToggleFavorite(spot._id)}
                                            />
                                        ))}
                                    </div>
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
                                                            <button onClick={() => navigate(`/places/${spot._id}`)} className="px-4 py-1 bg-[#FDE24F] border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0_0_#000]">詳細を見る</button>
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