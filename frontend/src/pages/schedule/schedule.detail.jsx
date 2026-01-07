import React, { useState, useEffect } from "react";
import {
  Avatar,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {Navigation} from "lucide-react";
// Import MUI Icons
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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TimelineCard from "../../components/location-card";
import { getCookie } from '../../helpers/cookies.helper';
import { likeDayPlan, unlikeDayPlan, checkLikeDayPlan } from '../../services/favorite.services';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/api`;

// Config Colors
const COLORS = {
  bg: '#FFFBF5',
  blue: '#5BC0EB',
  pink: '#FF90E8',
  yellow: '#FDE24F',
  red: '#FF6B6B'
};

// --- FIX LEAFLET ICON (QUAN TRỌNG) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 1. Tạo biến Icon Mặc định (Xanh dương)
const defaultIcon = new L.Icon.Default();

// 2. Tạo biến Icon Đỏ (Cho điểm cuối)
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 3. Tạo biến Icon Xanh lá (Cho điểm đầu - MỚI THÊM)
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// --------------------------------------

function ScheduleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]);
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch schedule data from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/day-plans/${id}`);

        if (response.data && response.data.data) {
          const rawData = response.data.data;

          if (typeof rawData.total_likes === 'number') {
            setLikesCount(rawData.total_likes);
          }

          const transformedData = {
            id: rawData._id,
            title: rawData.title,
            user: {
              name: rawData.user_id?.fullName || "Người dùng",
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
              transport: mapTransport(item.transport),
              transportText: item.transport || "",
              image: item.image || "https://via.placeholder.com/800",
              openingHours: "N/A",
              estimatedCost: formatPriceRange(item.price_range),
              description: item.description || "",
              note: item.caution || "",
              hasWarning: !!item.caution,
              placeId: getPlaceIdString(item.place_id),
            })),
            warnings: rawData.items
              .filter(item => item.caution)
              .map(item => ({
                location: item.custom_place_name || "スポット",
                note: item.caution
              }))
          };

          setScheduleData(transformedData);

          const placeIds = rawData.items
            .map(item => getPlaceIdString(item.place_id))
            .filter(id => id && typeof id === 'string');

          if (placeIds.length > 0) {
            try {
              const placesPromises = placeIds.map(placeId =>
                axios.get(`${API_BASE_URL}/places/${placeId}`)
              );

              const placesResponses = await Promise.allSettled(placesPromises);

              const places = placesResponses
                .filter(result => result.status === 'fulfilled')
                .map(res => res.value.data?.data)
                .filter(place => place);

              let ageRangeText = rawData.target_age || "すべての年齢";
              if (places.length > 0) {
                const ageRanges = places
                  .filter(place => place.age_limit && place.age_limit.min !== undefined && place.age_limit.max !== undefined)
                  .map(place => place.age_limit);

                if (ageRanges.length > 0) {
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

              transformedData.overview.age = ageRangeText;
              setScheduleData(transformedData);

              const relatedPlacesData = places.map(place => ({
                id: place._id,
                name: place.name,
                image: place.images?.[0]?.url || "https://via.placeholder.com/300",
                category: place.category_id?.name || "スポット",
                location: place.location
              }));

              // Sắp xếp lại relatedPlacesData theo thứ tự trong Timeline
              const orderedRelatedPlaces = placeIds.map(pid => relatedPlacesData.find(p => p.id === pid)).filter(Boolean);

              setRelatedPlaces(orderedRelatedPlaces);

              const placesWithCoords = orderedRelatedPlaces.filter(
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

          try {
            const userStr = getCookie('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              const chk = await checkLikeDayPlan(user._id, id);
              if (chk && chk.data && typeof chk.data.is_liked !== 'undefined') {
                setLiked(!!chk.data.is_liked);
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

  const getPlaceIdString = (placeIdData) => {
    if (!placeIdData) return null;
    if (typeof placeIdData === 'string') return placeIdData;
    if (typeof placeIdData === 'object' && placeIdData._id) return placeIdData._id;
    return null;
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange || (!priceRange.min && !priceRange.max)) return "無料";
    if (priceRange.min === priceRange.max || !priceRange.max) {
      return `${priceRange.min.toLocaleString()}円`;
    }
    return `${priceRange.min.toLocaleString()}円 - ${priceRange.max.toLocaleString()}円`;
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
    if (totalMin === totalMax) return `${totalMin.toLocaleString()}円`;
    return `${totalMin.toLocaleString()}円 - ${totalMax.toLocaleString()}円`;
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
      "Xe đạp": "bike",
      "車": "car",
      "バイク": "bike",
      "徒歩": "walk",
      "バス": "bus",
      "自転車": "bike"
    };
    return transportMap[transport] || "walk";
  };

  const getTransportIcon = (transport) => {
    const iconStyle = { color: "#000", fontSize: 20 };
    switch (transport) {
      case "walk": return <DirectionsWalkIcon sx={iconStyle} />;
      case "bus": return <DirectionsBusIcon sx={iconStyle} />;
      case "bike": return <DirectionsBikeIcon sx={iconStyle} />;
      case "car": return <DirectionsCarIcon sx={iconStyle} />;
      default: return <DirectionsWalkIcon sx={iconStyle} />;
    }
  };

  const scrollToLocation = (itemId) => {
    const element = document.getElementById(`location-card-${itemId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // --- SỬA LOGIC MỞ GOOGLE MAPS ---
  const handleOpenGoogleMaps = () => {
    const validPlaces = relatedPlaces.filter(
      (place) =>
        place.location?.coordinates &&
        Array.isArray(place.location.coordinates) &&
        place.location.coordinates.length === 2
    );

    if (validPlaces.length === 0) return;

    // Lấy tọa độ tất cả các điểm trong lịch trình
    const coords = validPlaces.map(
      (p) => `${p.location.coordinates[1]},${p.location.coordinates[0]}`
    );

    // Tạo URL Google Maps
    // Không set `origin` để Google tự lấy vị trí hiện tại
    // `destination` là điểm cuối cùng
    // `waypoints` là các điểm từ 1 đến N-1 (bao gồm cả điểm đầu tiên trong list)
    
    const destination = coords[coords.length - 1]; // Điểm cuối cùng
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    if (coords.length > 1) {
      // Lấy tất cả các điểm trừ điểm cuối cùng làm waypoints
      // Điều này có nghĩa: Hiện tại -> Điểm 1 -> Điểm 2 ... -> Điểm cuối
      const waypoints = coords.slice(0, coords.length - 1).join('|');
      url += `&waypoints=${waypoints}`;
    }

    window.open(url, '_blank');
  };
  // --------------------------------

  // --- LẤY DANH SÁCH TỌA ĐỘ CHO POLYLINE ---
  const polylinePositions = relatedPlaces
    .filter(p => p.location?.coordinates?.length === 2)
    .map(p => [p.location.coordinates[1], p.location.coordinates[0]]);
  // ----------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.bg }}>
        <CircularProgress sx={{ color: 'black' }} />
      </div>
    );
  }

  if (error || !scheduleData) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.bg }}>
        <div className="p-8 text-center bg-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl">
          <h2 className="text-xl font-bold text-red-500 mb-4">{error || "スケジュールが見つかりません"}</h2>
          <button
            onClick={() => navigate("/schedule")}
            className="px-6 py-2 bg-[#5BC0EB] border-2 border-black font-bold shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none transition-all rounded-lg"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: COLORS.bg, fontFamily: 'sans-serif' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* === HEADER === */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border-2 border-black rounded-xl p-6 shadow-[6px_6px_0_0_#000]">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate("/schedule")}
              className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-full hover:bg-gray-100 shadow-[2px_2px_0_0_#000] transition-all"
            >
              <ArrowBackIcon />
            </button>

            <div className="flex-1 md:flex-none">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{scheduleData.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Avatar src={scheduleData.user.avatar} sx={{ width: 24, height: 24, border: '1px solid black' }} />
                <span className="font-bold text-sm text-gray-700">{scheduleData.user.name}</span>
              </div>
            </div>
          </div>

          <button
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
            className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] hover:bg-red-50 active:translate-y-1 active:shadow-none transition-all"
          >
            {liked ? <FavoriteIcon sx={{ color: "#f44336" }} /> : <FavoriteBorderIcon />}
            <span className="font-black text-lg">{likesCount}</span>
          </button>
        </div>

        {/* === TIMELINE OVERVIEW === */}
        <div className="mb-8 bg-white border-2 border-black rounded-xl p-6 shadow-[6px_6px_0_0_#000] overflow-x-auto">
          <div className="min-w-max flex items-center px-4 relative">
            {/* START NODE */}
            {scheduleData.timeline.length > 0 && (
              <div className="flex items-center relative z-10">
                <div className="flex flex-col items-center px-2 min-w-[120px]">
                  <div className="w-14 h-14 rounded-full bg-[#4caf50] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0_0_#000]">
                    <HomeIcon sx={{ fontSize: 30 }} />
                  </div>
                  <span className="mt-2 text-xs font-black uppercase tracking-wider">出発</span>
                </div>

                {/* Arrow */}
                <div className="flex items-center mx-4">
                  <div className="w-10 h-10 rounded-full bg-[#E3F2FD] border-2 border-black flex items-center justify-center shadow-sm z-10">
                    {getTransportIcon(scheduleData.timeline[0].transport)}
                  </div>
                  <div className="h-[2px] w-[80px] bg-black -ml-1"></div>
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-black"></div>
                </div>
              </div>
            )}

            {/* LOCATION NODES */}
            {scheduleData.timeline.map((item, index) => (
              <div key={item.id} className="flex items-center relative z-10">
                {/* Node */}
                <Tooltip title={item.note || ""} arrow placement="top">
                  <div
                    onClick={() => scrollToLocation(item.id)}
                    className="flex flex-col items-center px-2 min-w-[120px] cursor-pointer group"
                  >
                    <div className="relative w-14 h-14 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000] group-hover:-translate-y-1 group-hover:bg-[#f0f7ff] transition-all">
                      <LocationOnIcon sx={{ color: COLORS.blue, fontSize: 28 }} />
                      {item.hasWarning && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FDE24F] border border-black rounded-full flex items-center justify-center">
                          <WarningAmberIcon sx={{ fontSize: 12, color: "black" }} />
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#1976d2]">{item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}</span>
                    <span className="text-xs font-bold text-center max-w-[100px] truncate">{item.name}</span>
                  </div>
                </Tooltip>

                {/* Arrow to Next */}
                {index < scheduleData.timeline.length - 1 && (
                  <div className="flex items-center mx-4">
                    <div className="w-10 h-10 rounded-full bg-[#E3F2FD] border-2 border-black flex items-center justify-center shadow-sm z-10">
                      {getTransportIcon(scheduleData.timeline[index + 1].transport)}
                    </div>
                    <div className="h-[2px] w-[80px] bg-black -ml-1"></div>
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-black"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* LEFT: VERTICAL TIMELINE */}
          <div className="md:col-span-8">
            {scheduleData.timeline.map((item, index) => (
              <div key={item.id} className="relative flex mb-8">

                {/* 1. LINE */}
                {index < scheduleData.timeline.length - 1 && (
                  <div className="absolute left-10 -translate-x-1/2 top-[60px] bottom-[-32px] w-[2px] bg-black z-0"></div>
                )}

                {/* 2. LEFT COLUMN (Time & Icon) */}
                <div className="flex flex-col items-center min-w-[80px] relative z-10">
                  <span className="text-sm font-black mb-2">{item.time}</span>

                  <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                    <LocationOnIcon sx={{ color: COLORS.blue }} />
                  </div>
                </div>

                {/* 3. MIDDLE ICON (Transport) */}
                {index < scheduleData.timeline.length - 1 && (
                  <div className="absolute top-[55%] left-10 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center z-20 shadow-sm">
                    {React.cloneElement(getTransportIcon(scheduleData.timeline[index + 1].transport), { sx: { fontSize: 16 } })}
                  </div>
                )}

                {/* 4. RIGHT CONTENT (Card) */}
                <div className="flex-1 pl-4">
                  <TimelineCard
                    location={item}
                    navigate={navigate}
                    containerId={`location-card-${item.id}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="md:col-span-4 flex flex-col gap-6">

            {/* OVERVIEW BOX */}
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
              <h3 className="text-lg font-black mb-3">基本情報</h3>
              <div className="border-t-2 border-black mb-3"></div>

              <div className="space-y-3">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.pink }}>
                    <AttachMoneyIcon sx={{ fontSize: 20, color: 'black' }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-bold">料金</div>
                    <div className="font-bold">{scheduleData.overview.price}</div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.blue }}>
                    <AccessTimeIcon sx={{ fontSize: 20, color: 'black' }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-bold">営業時間</div>
                    <div className="font-bold">{scheduleData.overview.time}</div>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.yellow }}>
                    <GroupIcon sx={{ fontSize: 20, color: 'black' }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-bold">対象年齢</div>
                    <div className="font-bold">{scheduleData.overview.age}</div>
                  </div>
                </div>

                {/* Locations */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: COLORS.pink }}>
                    <LocationOnIcon sx={{ fontSize: 20, color: 'black' }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-bold">場所</div>
                    <div className="font-bold">{scheduleData.overview.locations} 箇所</div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {scheduleData.overview.note && (
                <>
                  <div className="border-t-2 border-black my-3"></div>
                  <div className="flex gap-2 items-start text-sm bg-gray-50 p-2 rounded border border-gray-200">
                    <MenuBookIcon sx={{ fontSize: 20 }} className="mt-0.5 flex-shrink-0 text-gray-600" />
                    <span className="text-gray-700">{scheduleData.overview.note}</span>
                  </div>
                </>
              )}
            </div>

            {/* WARNINGS BOX */}
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
              <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                <WarningAmberIcon sx={{ color: '#ed6c02' }} /> 注意
              </h3>
              <div className="space-y-3">
                {scheduleData.warnings.map((warning, index) => (
                  <div key={index} className="bg-[#FFF3E0] border border-[#ED6C02] rounded-lg p-3">
                    <div className="font-black text-sm text-[#E65100]">{warning.location}</div>
                    <div className="text-xs text-[#E65100] mt-1">{warning.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAP BOX */}
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
              <h3 className="text-lg font-black mb-3">地図</h3>
              <div className="w-full h-[300px] rounded-lg border-2 border-black overflow-hidden relative z-0 mb-3">
                {relatedPlaces.length > 0 ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* VẼ ĐƯỜNG NỐI (POLYLINE) */}
                    {polylinePositions.length > 1 && (
                      <Polyline
                        positions={polylinePositions}
                        pathOptions={{ color: 'black', weight: 4, dashArray: '10, 10' }}
                      />
                    )}

                    {relatedPlaces
                      .filter(place =>
                        place.location?.coordinates &&
                        Array.isArray(place.location.coordinates) &&
                        place.location.coordinates.length === 2
                      )
                      .map((place, index, array) => {
                        // Logic chọn icon:
                        // - Điểm đầu tiên (index === 0): Màu xanh lá (greenIcon)
                        // - Điểm cuối cùng (index === array.length - 1): Màu đỏ (redIcon)
                        // - Các điểm còn lại: Màu mặc định (defaultIcon)
                        let icon = defaultIcon;
                        if (index === 0) icon = greenIcon;
                        else if (index === array.length - 1) icon = redIcon;

                        return (
                          <Marker
                            key={place.id}
                            position={[
                              place.location.coordinates[1],
                              place.location.coordinates[0]
                            ]}
                            icon={icon}
                          >
                            <Popup>
                              <div className="min-w-[120px]">
                                <div className="font-bold text-sm text-[#5BC0EB]">#{index + 1}</div>
                                <div className="font-bold text-sm">{place.name}</div>
                                <div className="text-xs text-gray-500">{place.category}</div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })
                    }
                  </MapContainer>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    地図データがありません
                  </div>
                )}
              </div>

              {/* GOOGLE MAPS BUTTON */}
              {relatedPlaces.some(p => p.location?.coordinates) && (
                <button
                  onClick={handleOpenGoogleMaps}
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

        {/* === RELATED PLACES === */}
        {relatedPlaces.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-2">
              <span className="w-4 h-8 bg-[#FF90E8] border-2 border-black inline-block -skew-x-12"></span>
              関連する場所
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => navigate(`/places/${place.id}`)}
                  className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer group"
                >
                  <div className="h-48 border-b-2 border-black relative">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white border-2 border-black px-2 py-0.5 text-xs font-bold rounded shadow-sm">
                      {place.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg truncate group-hover:text-[#5BC0EB] transition-colors">{place.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ScheduleDetail;