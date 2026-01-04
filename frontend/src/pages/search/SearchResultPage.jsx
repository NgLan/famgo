import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Box, Container, Typography, Pagination, Button, Paper, Stack, IconButton } from '@mui/material';
import SpotCard from '../../components/spot-card';
import FilterSidebar from './FilterSidebar';
import SearchInputSidebar from '../../components/filter-sidebar/SearchInputSidebar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';

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

                // Thêm phân trang
                apiQueryParams.append('page', page);
                apiQueryParams.append('limit', 6);

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

    }, [searchParams, page]); // CHỈ CHẠY KHI URL HOẶC PAGE THAY ĐỔI

    // --- HÀM 2: XỬ LÝ KHI BẤM NÚT 'LỌC' TRÊN SIDEBAR ---
    const handleApplyFilter = () => {
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
    };

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
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Typography variant="h5" align="center">読み込み中...</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 3 }}>
            <Container maxWidth="xl" sx={{ mt: 0 }}>
                <Grid container spacing={3}>
                    {/* Sidebar */}
                    <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                        <Stack spacing={3} sx={{ width: "100%", height: "100%" }}>
                            <SearchInputSidebar />
                            <FilterSidebar
                                tempFilterState={tempFilterState}
                                setTempFilterState={setTempFilterState}
                                onApply={handleApplyFilter}
                                onReset={() => {
                                    setTempFilterState({});
                                    navigate('/search');
                                }}
                            />
                        </Stack>
                    </Grid>

                    {/* Kết quả */}
                    <Grid item xs={12} md={9} sx={{ flex: 1 }}>
                        <Paper sx={{ p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="body1" color="textSecondary" fontWeight={600}>
                                    {totalResults}件のスポットを表示
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} onClick={() => setViewMode('list')} sx={{ textTransform: 'none', minWidth: 80 }}>LIST</Button>
                                    <Button variant={viewMode === 'map' ? 'contained' : 'outlined'} onClick={() => setViewMode('map')} sx={{ textTransform: 'none', minWidth: 80 }}>MAP</Button>
                                </Stack>
                            </Box>

                            {viewMode === 'list' ? (
                                <Grid container spacing={3}>
                                    {spots.map((spot) => (
                                        <Grid item xs={12} sm={6} md={4} key={spot.id || spot._id} sx={{ display: "flex", alignItems: "stretch" }}>
                                            <SpotCard spot={spot} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ height: 500, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                    <MapContainer center={getCenterCoordinates()} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                        {spots.map((spot) => {
                                            const coords = spot.location?.coordinates;
                                            if (!coords) return null;
                                            return (
                                                <Marker position={[coords[1], coords[0]]} key={spot._id}>
                                                    <Popup>
                                                        <Typography variant="subtitle2" fontWeight="bold">{spot.name}</Typography>
                                                        <Typography variant="caption">{spot.address}</Typography>
                                                        <Button size="small" onClick={() => navigate(`/places/${spot._id}`)}>Chi tiết</Button>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>
                                </Box>
                            )}

                            {viewMode === 'list' && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pb: 2 }}>
                                    <Pagination count={totalPages} color="primary" page={page} onChange={(event, value) => setPage(value)} />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default SearchResultPage;