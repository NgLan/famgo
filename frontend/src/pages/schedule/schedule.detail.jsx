import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  tooltipClasses, Zoom
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './schedule.detail.css';
import L from 'leaflet';
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCookie } from '../../helpers/cookies.helper';
import { likeDayPlan, unlikeDayPlan, checkLikeDayPlan } from '../../services/favorite.services';
import { styled } from '@mui/material/styles';
const API_BASE_URL = "http://localhost:3000/api";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component cho một điểm trên timeline
function TimelineCard({ location, onToggleDescription, onToggleNote, expandedDesc, expandedNote, navigate }) {
  const timeLabel = location.startTime
    ? `${location.startTime}${location.endTime ? ` - ${location.endTime}` : ''}`
    : location.time || "時間未設定";

  return (
    <Card className="timeline-card">
      <Box className="card-image-overlay">
        {/* Bỏ thuộc tính height cứng, để CSS class .card-image-overlay quản lý chiều cao */}
        <CardMedia
          component="img"
          image={location.image}
          alt={location.name}
          // CSS đã xử lý width 100% và object-fit cover
        />
        {location.hasWarning && (
          <Chip
            icon={<WarningAmberIcon />}
            label="注意"
            size="small"
            className="chip-elevated-pink"
            sx={{ position: "absolute", top: 8, right: 8 }}
          />
        )}
      </Box>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700} color="#2C3E50">
            {location.name}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<AccessTimeIcon />}
              label={timeLabel}
              size="small"
              className="chip-elevated-blue"
            />
            <Chip
              icon={<AttachMoneyIcon />}
              label={location.estimatedCost}
              size="small"
              className="chip-elevated"
              sx={{ color: '#2C3E50' }}
            />
          </Stack>

          {/* ... (Phần Description, Note, Button giữ nguyên) ... */}
           {/* 説明 */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                説明
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => onToggleDescription(location.id)}
                className="icon-btn-elevated"
              >
                {expandedDesc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={expandedDesc}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {location.description || "説明はありません"}
              </Typography>
            </Collapse>
          </Box>

          {/* 注意事項 */}
          {location.note && (
            <Box className="warning-card" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <WarningAmberIcon fontSize="small" sx={{ color: '#FFB84D' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    注意事項
                  </Typography>
                </Stack>
                <IconButton 
                  size="small" 
                  onClick={() => onToggleNote(location.id)}
                  className="icon-btn-elevated"
                >
                  {expandedNote ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>
              <Collapse in={expandedNote}>
                <Typography variant="body2" sx={{ mt: 1, color: '#D97706' }}>
                  {location.note}
                </Typography>
              </Collapse>
            </Box>
          )}

          <Button
            className="btn-primary"
            size="small"
            sx={{ alignSelf: "flex-start" }}
            onClick={() => location.placeId && navigate(`/places/${location.placeId}`)}
          >
            詳細を見る
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

const CuteTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} TransitionComponent={Zoom} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#FFF9C4', // Màu nền Vàng kem
    color: '#333333', // Chữ đen
    border: '2px solid #FBC02D', // Viền vàng đậm
    fontSize: '0.75rem',
    borderRadius: '12px', // Bo tròn
    fontWeight: 700,
    padding: '8px 12px',
    fontFamily: '"M PLUS Rounded 1c", "Kosugi Maru", sans-serif', // Font cute
    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)', // Bóng nhẹ
    maxWidth: 200, // Giới hạn chiều rộng nếu text dài
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#FBC02D', // Mũi tên màu vàng đậm trùng màu viền
    "&:before": {
        border: '2px solid #FBC02D', // (Tuỳ chọn) Viền cho mũi tên nếu cần sắc nét hơn
    }
  },
}));

function ScheduleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [expandedNote, setExpandedNote] = useState({});
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Default: Hanoi
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch schedule data from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/day-plans/${id}`);
        console.log("👉 Dữ liệu API trả về:", response.data.data); // Xem cái này
console.log("👉 User trong API:", response.data.data.user); // Soi kỹ cái này

        if (response.data && response.data.data) {
          const rawData = response.data.data;
          
          // Transform API response to match component's expected structure
          const transformedData = {
            id: rawData._id,
            title: rawData.title,
            user: {
              // Ở trang list bạn dùng user.fullName, nên ở đây tui cũng map tương tự
              // Thêm fallback user.name đề phòng backend trả về field khác
              name: rawData.user_id?.fullName || rawData.user_id?.name || "Ẩn danh", 
              avatar: rawData.user_id?.avatar || "",
            },
            overview: {
              price: calculateTotalPriceRange(rawData.items),
              time: getTimeRange(rawData.items),
              age: rawData.target_age || "すべての年齢",
              locations: rawData.items.length,
              note: rawData.note || ""
            },
            timeline: rawData.items.map((item, index) => ({
              id: item._id,
              type: "location",
              name: item.custom_place_name || "スポット",
              time: item.start_time,
              startTime: item.start_time,
              endTime: item.end_time,
              duration: calculateDuration(item.start_time, item.end_time),
              transport: mapTransport(item.transport),
              transportText: item.transport || "",
              image: item.image || "https://via.placeholder.com/800",
              openingHours: "N/A",
              estimatedCost: formatPriceRange(item.price_range),
              description: item.description || "",
              note: item.caution || "",
              hasWarning: !!item.caution,
              placeId: item.place_id?._id || item.place_id,// Add place_id for navigation
            })),
            warnings: rawData.items
              .filter(item => item.caution)
              .map(item => ({
                location: item.custom_place_name || "スポット",
                note: item.caution
              }))
          };
          
          setScheduleData(transformedData);
          
          if (typeof rawData.likes === 'number') {
            setLikesCount(rawData.likes);
          } else if (typeof rawData.total_likes === 'number') {
             // Phòng hờ backend trả về tên biến khác
            setLikesCount(rawData.total_likes);
          }

          // Fetch related places
          const placeIds = rawData.items
            .map(item => item.place_id?._id || item.place_id)
            .filter(placeId => placeId); // Filter out null/undefined
          
          if (placeIds.length > 0) {
            try {
              const placesPromises = placeIds.map(placeId => 
                axios.get(`${API_BASE_URL}/places/${placeId}`)
              );
              const placesResponses = await Promise.all(placesPromises);
              const places = placesResponses
                .map(res => res.data?.data)
                .filter(place => place); // Filter out failed requests
              
              // Calculate age range intersection
              let ageRangeText = rawData.target_age || "すべての年齢";
              if (places.length > 0) {
                const ageRanges = places
                  .filter(place => place.age_limit && place.age_limit.min !== undefined && place.age_limit.max !== undefined)
                  .map(place => place.age_limit);
                
                if (ageRanges.length > 0) {
                  // Find intersection of all age ranges
                  const minAge = Math.max(...ageRanges.map(range => range.min));
                  const maxAge = Math.min(...ageRanges.map(range => range.max));
                  
                  if (minAge <= maxAge) {
                    if (minAge === 0 && maxAge >= 100) {
                      ageRangeText = "すべての年齢";
                    } else if (minAge === maxAge) {
                      ageRangeText = `${minAge}歳`;
                    } else {
                      ageRangeText = `${minAge}歳 - ${maxAge}歳`;
                    }
                  } else {
                    ageRangeText = "共通の年齢範囲がありません";
                  }
                }
              }
              
              // Update transformedData with calculated age range
              transformedData.overview.age = ageRangeText;
              setScheduleData(transformedData);
              
              // Set related places for display with coordinates
              const relatedPlacesData = places.map(place => ({
                id: place._id,
                name: place.name,
                image: place.images?.[0]?.url || "https://via.placeholder.com/300",
                category: place.category_id?.name || "スポット",
                location: place.location // Include location coordinates
              }));
              setRelatedPlaces(relatedPlacesData);
              
              // Calculate map center from places with valid coordinates
              const placesWithCoords = relatedPlacesData.filter(
                place => place.location?.coordinates && 
                Array.isArray(place.location.coordinates) && 
                place.location.coordinates.length === 2
              );
              
              if (placesWithCoords.length > 0) {
                const avgLat = placesWithCoords.reduce((sum, place) => 
                  sum + place.location.coordinates[1], 0) / placesWithCoords.length;
                const avgLng = placesWithCoords.reduce((sum, place) => 
                  sum + place.location.coordinates[0], 0) / placesWithCoords.length;
                setMapCenter([avgLat, avgLng]);
                
                // Adjust zoom based on spread of locations
                if (placesWithCoords.length === 1) {
                  setMapZoom(15);
                } else {
                  setMapZoom(13);
                }
              }
            } catch (err) {
              console.error('Error fetching related places:', err);
            }
          }
          
          // Check like status if user logged in
          try {
            const userStr = getCookie('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              const chk = await checkLikeDayPlan(user._id, id);
              if (chk && chk.data && typeof chk.data.is_liked !== 'undefined') {
                setLiked(!!chk.data.is_liked);
                if (typeof chk.data.total_likes === 'number') setLikesCount(chk.data.total_likes);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(err.message || "データを読み込めませんでした");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchScheduleData();
    }
  }, [id]);

  // Helper functions for data transformation
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;

    if (diffMinutes <= 0) return "";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0) return `${minutes}分`;
    if (minutes === 0) return `${hours}時間`;
    return `${hours}時間${minutes}分`;
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange || (!priceRange.min && !priceRange.max)) return "無料";
    if (priceRange.min === priceRange.max || !priceRange.max) {
      return `${priceRange.min.toLocaleString()}đ`;
    }
    return `${priceRange.min.toLocaleString()}đ - ${priceRange.max.toLocaleString()}đ`;
  };

  const calculateTotalPriceRange = (items) => {
    if (!items || items.length === 0) return "無料";
    let totalMin = 0;
    let totalMax = 0;
    items.forEach(item => {
      if (item.price_range) {
        totalMin += item.price_range.min || 0;
        totalMax += item.price_range.max || item.price_range.min || 0;
      }
    });
    if (totalMin === 0 && totalMax === 0) return "無料";
    if (totalMin === totalMax) return `${totalMin.toLocaleString()}đ`;
    return `${totalMin.toLocaleString()}đ - ${totalMax.toLocaleString()}đ`;
  };

  const getTimeRange = (items) => {
    if (!items || items.length === 0) return "-";
    const firstTime = items[0]?.start_time;
    const lastTime = items[items.length - 1]?.end_time;
    if (!firstTime || !lastTime) return "-";
    return `${firstTime} - ${lastTime}`;
  };

  const mapTransport = (transport) => {
    const transportMap = {
      "Ô tô": "car",
      "Xe máy": "bike",
      "Đi bộ": "walk",
      "Xe bus": "bus",
      "Xe đạp": "bike"
    };
    return transportMap[transport] || "walk";
  };

  const handleToggleDescription = (id) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleNote = (id) => {
    setExpandedNote((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTransportIcon = (transport) => {
    switch (transport) {
      case "walk":
        return <DirectionsWalkIcon sx={{ color: "#fff", fontSize: 24 }} />;
      case "bus":
        return <DirectionsBusIcon sx={{ color: "#fff", fontSize: 24 }} />;
      case "bike":
        return <DirectionsBikeIcon sx={{ color: "#fff", fontSize: 24 }} />;
      case "car":
        return <DirectionsCarIcon sx={{ color: "#fff", fontSize: 24 }} />;
      default:
        return <DirectionsWalkIcon sx={{ color: "#fff", fontSize: 24 }} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        className="loading-container"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: '#4A90E2' }} />
      </Box>
    );
  }

  // Show error state
  if (error || !scheduleData) {
    return (
      <Box
        className="schedule-detail-container"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper className="elevated-card" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom fontWeight={700}>
            {error || "スケジュールが見つかりません"}
          </Typography>
          <Button
            className="btn-primary"
            onClick={() => navigate("/schedule")}
            sx={{ mt: 2 }}
          >
            戻る
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="detail-page-wrapper" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Paper className="header-section" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton 
                onClick={() => navigate("/schedule")}
                className="icon-btn-elevated"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={700} color="#2C3E50">
                {scheduleData.title}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={async () => {
                  const userStr = getCookie('user');
                  if (!userStr) {
                    return navigate('/login');
                  }
                  const user = JSON.parse(userStr);
                  try {
                    if (liked) {
                      await unlikeDayPlan(user._id, id);
                      setLiked(false);
                      setLikesCount((c) => Math.max(0, c - 1));
                    } else {
                      await likeDayPlan(user._id, id);
                      setLiked(true);
                      setLikesCount((c) => c + 1);
                    }
                  } catch (err) {
                    console.error('Like toggle error', err);
                  }
                }}
                className="icon-btn-elevated"
                sx={{ color: liked ? "#FF6B9D" : "inherit" }}
              >
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>{likesCount}</Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Timeline Overview */}
        <Paper className="timeline-overview" sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="flex-start" 
            spacing={0}
            sx={{
              minWidth: "max-content",
              position: "relative",
              overflowX: "auto",
              // --- SỬA LẠI: Trả về padding nhỏ gọn, không cần đệm cao nữa ---
              pt: 2, // Giảm từ 8 xuống 2
              pb: 2,
              px: 2,
            }}
          >
            {scheduleData.timeline.map((item, index) => (
              <Box key={item.id} sx={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
                
                {/* Location Item */}
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 120, px: 1, position: 'relative' }}>
                  
                  {/* --- SỬ DỤNG CUTE TOOLTIP --- */}
                  {/* Nếu có note thì bọc Tooltip, không thì render Box thường */}
                  {item.note ? (
                    <CuteTooltip title={item.note} placement="top">
                      <Box className="timeline-location-icon" sx={{ position: 'relative', zIndex: 2, cursor: 'pointer' }}>
                        <LocationOnIcon sx={{ color: "#4A90E2", fontSize: 26 }} />
                        {item.hasWarning && (
                          <Box className="warning-badge">
                            <WarningAmberIcon sx={{ fontSize: 16, color: "#fff" }} />
                          </Box>
                        )}
                      </Box>
                    </CuteTooltip>
                  ) : (
                    <Box className="timeline-location-icon" sx={{ position: 'relative', zIndex: 2 }}>
                      <LocationOnIcon sx={{ color: "#4A90E2", fontSize: 26 }} />
                      {item.hasWarning && (
                        <Box className="warning-badge">
                          <WarningAmberIcon sx={{ fontSize: 16, color: "#fff" }} />
                        </Box>
                      )}
                    </Box>
                  )}
                  {/* --- HẾT PHẦN TOOLTIP --- */}

                  {/* Time */}
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#4A90E2", mt: 0.5 }}>
                    {item.time}
                  </Typography>

                  {/* Name */}
                  <Typography
                    variant="caption"
                    align="center"
                    fontWeight={600}
                    sx={{
                      maxWidth: 100,
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                      color: "#2C3E50"
                    }}
                  >
                    {item.name}
                  </Typography>
                </Stack>

                {/* Transport Arrow (Giữ nguyên) */}
                {index < scheduleData.timeline.length - 1 && (
                  <Stack alignItems="center" spacing={0.5} sx={{ mx: 2, mt: 1 }}>
                    <Box className="transport-icon-circle">
                      {getTransportIcon(scheduleData.timeline[index + 1].transport)}
                    </Box>
                    {scheduleData.timeline[index + 1].duration && (
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem", color: "#2C3E50" }}>
                        {scheduleData.timeline[index + 1].duration}
                      </Typography>
                    )}
                    <Box className="timeline-arrow" sx={{ width: 80 }} />
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* User info */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar src={scheduleData.user.avatar} className="avatar-elevated" sx={{ width: 48, height: 48 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#2C3E50">
            {scheduleData.user.name}
          </Typography>
        </Stack>
        
        <Grid container spacing={4}>
          {/* Timeline */}
          <Grid item xs={12} md={9} sx={{ flex: 1 }}>
            <Box>
              {/* Timeline Items */}
              {scheduleData.timeline.map((item, index) => (
                <Box key={item.id} sx={{ position: "relative" }}>
                  {/* Timeline line */}
                  {index < scheduleData.timeline.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: { xs: 15, sm: 38 }, // Căn chỉnh lại cho khớp icon
                        top: 180,
                        bottom: 0,
                        width: 3,
                        background: 'linear-gradient(180deg, #4A90E2 0%, #FF6B9D 100%)',
                        borderRadius: 2,
                        zIndex: 0,
                      }}
                    />
                  )}

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    {/* Time & Icon */}
                    <Stack alignItems="center" sx={{ minWidth: 80 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: '#2C3E50' }}>
                        {item.time}
                      </Typography>
                      <Box className="timeline-location-icon">
                        <LocationOnIcon sx={{ color: "#4A90E2" }} />
                      </Box>
                      {item.transport && (
                        <Box sx={{ mt: 2 }} className="transport-icon-circle">
                          {getTransportIcon(item.transport)}
                        </Box>
                      )}
                      {item.duration && (
                        <Typography variant="caption" fontWeight={600} sx={{ mt: 0.5, color: '#2C3E50' }}>
                          {item.duration}
                        </Typography>
                      )}
                    </Stack>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <TimelineCard
                        location={item}
                        onToggleDescription={handleToggleDescription}
                        onToggleNote={handleToggleNote}
                        expandedDesc={expandedDesc[item.id]}
                        expandedNote={expandedNote[item.id]}
                        navigate={navigate}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
          
          {/* Cột phải - Thông tin & Bản đồ */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              {/* Tổng quan */}
              <Paper className="overview-panel">
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#2C3E50' }}>
                  概要
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AttachMoneyIcon sx={{ color: '#4A90E2' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {scheduleData.overview.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupIcon sx={{ color: '#FF6B9D' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {scheduleData.overview.age}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon sx={{ color: '#4A90E2' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {scheduleData.overview.time}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon sx={{ color: '#FF6B9D' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {scheduleData.overview.locations}場所
                    </Typography>
                  </Stack>
                  {scheduleData.overview.note && (
                    <>
                      <Box className="styled-divider" />
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <WarningAmberIcon sx={{ color: '#FFB84D', mt: 0.3 }} fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {scheduleData.overview.note}
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* Danh sách chú ý */}
              {scheduleData.warnings.length > 0 && (
                <Paper className="overview-panel">
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#2C3E50' }}>
                    注意
                  </Typography>
                  <Stack spacing={1.5}>
                    {scheduleData.warnings.map((warning, index) => (
                      <Box key={index} className="warning-card" sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <WarningAmberIcon sx={{ color: '#FFB84D' }} fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="#2C3E50">
                              {warning.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {warning.note}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Bản đồ */}
              <Paper className="overview-panel">
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#2C3E50' }}>
                  地図
                </Typography>
                <Box className="map-container" sx={{ height: 300 }}>
                  {relatedPlaces.length > 0 ? (
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {relatedPlaces
                        .filter(place => 
                          place.location?.coordinates && 
                          Array.isArray(place.location.coordinates) && 
                          place.location.coordinates.length === 2
                        )
                        .map((place, index) => (
                          <Marker
                            key={place.id}
                            position={[
                              place.location.coordinates[1], // latitude
                              place.location.coordinates[0]  // longitude
                            ]}
                          >
                            <Popup>
                              <Box sx={{ minWidth: 150 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {place.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {place.category}
                                </Typography>
                              </Box>
                            </Popup>
                          </Marker>
                        ))
                      }
                    </MapContainer>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary" fontWeight={600}>地図データがありません</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Related Places Section */}
        {relatedPlaces.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#2C3E50' }}>
              関連する場所
            </Typography>
            <Grid container spacing={3}>
              {relatedPlaces.map((place) => (
                <Grid item xs={12} sm={6} md={3} key={place.id}>
                  <Card 
                    className="related-place-card"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/places/${place.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={place.image}
                      alt={place.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Chip 
                        label={place.category} 
                        size="small" 
                        className="chip-elevated-pink"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" fontWeight={700} noWrap color="#2C3E50">
                        {place.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ScheduleDetail;
