import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Paper,
  Button,
  IconButton,
  Chip,
  Avatar, // ĐÃ THÊM AVATAR
} from "@mui/material";

// Import Icons cần thiết
import StarIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import L from 'leaflet'; // Không cần thiết trừ khi bạn chỉnh sửa icon marker mặc định
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

// Component chính
const PlaceDetail = () => {
  const { id } = useParams(); // Lấy ID địa điểm từ URL
  const navigate = useNavigate();
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [refreshStatsKey, setRefreshStatsKey] = useState(0);

  // Lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailResponse = await axios.get(
          `http://localhost:3000/api/places/${id}`
        );
        const respData = detailResponse.data;
        const place = respData?.data || respData;

        setPlaceData(place);

        // Nếu đã đăng nhập, kiểm tra trạng thái favorite
        try {
          const userStr = getCookie("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            const chk = await checkFavoritePlace(user._id, id);
            if (
              chk &&
              chk.data &&
              typeof chk.data.is_favorite !== "undefined"
            ) {
              setIsFavorite(!!chk.data.is_favorite);
            }
          }
        } catch {
          toast.error("お気に入りの確認に失敗しました。");
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

  if (loading)
    return (
      <Container sx={{ mt: 5 }}>
        <Typography align="center">読み込み中...</Typography>
      </Container>
    );
  if (error)
    return (
      <Container sx={{ mt: 5 }}>
        <Typography align="center" color="error">
          {error}
        </Typography>
      </Container>
    );
  if (!placeData) return null;

  // Dữ liệu chính:
  const {
    name,
    rating,
    total_reviews,
    images,
    price_range,
    address,
    description,
    related_places,
    age_limit,
    location,
  } = placeData;

  // Helper function to reload reviews
  const fetchReviews = async () => {
    try {
      await axios.get(
        `http://localhost:3000/api/reviews/place/${id}?limit=2`
      );
      // Refresh stats box khi review được submit/update
      setRefreshStatsKey((prev) => prev + 1);
    } catch {
      toast.error("レビューの読み込みに失敗しました。");
      //   console.error("Error loading reviews:", _err);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        {/* Mục 1: Tiêu đề và Rating */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          {/* Tên địa điểm */}
          <Typography variant="h4" fontWeight={700}>
            {name}
          </Typography>

          {/* Đánh giá sao và địa chỉ cùng hàng */}
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
            {/* Xếp hạng sao */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {rating > 0 ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        sx={{
                          fontSize: 24,
                          color: index < Math.round(rating) ? "#FFD700" : "#E0E0E0",
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    評価なし
                  </Typography>
                )}
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {rating > 0 ? Number(rating).toFixed(1) : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({total_reviews || 0} レビュー)
              </Typography>
            </Stack>

            {/* Địa chỉ */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon sx={{ color: "#666", fontSize: 20 }} />
              <Typography variant="body1" color="text.secondary">
                {address || "住所情報なし"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* 2. Body - Chia 2 cột */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* Cột Trái - Nội dung chính */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Mục 3: Main Image / Gallery */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: "auto", md: 420 },
                maxHeight: { xs: 520, md: 420 },
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: { xs: "#fff", md: "#f5f5f5" },
                display: { xs: "flex", md: "block" },
                alignItems: { xs: "center", md: "initial" },
                justifyContent: { xs: "center", md: "initial" },
              }}
            >
              {/* Background blur - Only desktop */}
              <Box
                component="img"
                src={
                  images && images.length > 0
                    ? images[0].url
                    : "https://via.placeholder.com/800x450?text=Gallery+Placeholder"
                }
                sx={{
                  display: { xs: "none", md: "block" },
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                  opacity: 0.5,
                }}
              />

              {/* Main image */}
              <Box
                component="img"
                src={
                  images && images.length > 0
                    ? images[0].url
                    : "https://via.placeholder.com/800x450?text=Gallery+Placeholder"
                }
                alt={name}
                sx={{
                  position: { xs: "static", md: "relative" },
                  zIndex: { xs: 0, md: 1 },
                  maxWidth: "100%",
                  width: { xs: "auto", md: "100%" },
                  height: { xs: "auto", md: "100%" },
                  maxHeight: { xs: "100%", md: "100%" },
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              {/* Mục 5: Chi tiết & Mô tả */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                詳細説明
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {description}
              </Typography>
            </Box>

            {/* ĐÁNH GIÁ  */}
            <Box sx={{ mt: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={700}>
                  レビュー
                </Typography>

                {/* Nút mở popup đánh giá */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const userStr = getCookie("user");
                    if (!userStr) {
                      alert("レビューを書くにはログインしてください");
                      return;
                    }
                    setOpenReviewDialog(true);
                  }}
                >
                  評価する
                </Button>
              </Stack>

              {/* Review Stats Section */}
              <Box sx={{ mt: 3 }}>
                <ReviewStatsSection
                  placeId={id}
                  refreshTrigger={refreshStatsKey}
                />
              </Box>

              <Divider sx={{ mt: 3, mb: 3 }} />

              {/* Comment input + list comments */}
              <CommentSection placeId={id} placeName={name} />
            </Box>
          </Box>

          {/* Cột Phải - Sidebar Sticky */}
          <Box
            sx={{
              width: { xs: "100%", md: 360 },
              flexShrink: 0,
              position: { xs: "static", md: "sticky" },
              top: { md: 96 },
              alignSelf: "flex-start",
            }}
          >
            <Stack spacing={3}>
              {/* Mục 4: Thông tin cơ bản & Ticket/Add Favorite */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={700}>
                    基本情報
                  </Typography>
                  <Divider />

                  {/* Giá */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AttachMoneyIcon color="primary" />
                    <Typography variant="body1">
                      料金: {price_range || "詳細はお問い合わせください"}
                    </Typography>
                  </Stack>

                  {/* Giờ mở cửa (Chưa có trong data, thêm mock) */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body1">
                      営業時間: 8:00 - 18:00
                    </Typography>
                  </Stack>

                  {/* Độ tuổi */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PeopleIcon color="primary" />
                    <Typography variant="body1">
                      対象年齢: {age_limit?.min || "0"} -{" "}
                      {age_limit?.max || "全年齢"}
                    </Typography>
                  </Stack>

                  {/* Địa chỉ */}
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                    <Typography variant="body1">
                      住所: {address || "更新中"}
                    </Typography>
                  </Stack>

                  <Divider />

                  {/* Nút Thêm/Bỏ yêu thích */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={isFavorite ? "contained" : "outlined"}
                      color={isFavorite ? "error" : "primary"}
                      startIcon={<FavoriteBorderIcon />}
                      sx={{ textTransform: "none", flexGrow: 1 }}
                      onClick={async () => {
                        const userStr = getCookie("user");
                        if (!userStr) {
                          alert("この機能を使用するにはログインしてください");
                          return;
                        }
                        const user = JSON.parse(userStr);
                        try {
                          if (isFavorite) {
                            await removeFavoritePlace(user._id, id);
                            setIsFavorite(false);
                          } else {
                            await addFavoritePlace(user._id, id);
                            setIsFavorite(true);
                          }
                        } catch (err) {
                          console.error("Toggle favorite error", err);
                          alert("お気に入り更新中にエラーが発生しました");
                        }
                      }}
                    >
                      {isFavorite ? "お気に入りを外す" : "お気に入りに追加"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Mục 6: Map Area */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  地図上の場所
                </Typography>
                <Box
                  sx={{
                    height: 300,
                    width: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {location?.coordinates ? (
                    <>
                      <MapContainer
                        center={[
                          location.coordinates[1],
                          location.coordinates[0],
                        ]}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        key={location.coordinates[0]}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                        <Marker
                          position={[
                            location.coordinates[1],
                            location.coordinates[0],
                          ]}
                        >
                          <Popup>{name}</Popup>
                        </Marker>
                      </MapContainer>

                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        行き方
                      </Button>
                    </>
                  ) : (
                    <Typography
                      align="center"
                      sx={{ pt: 10 }}
                      color="text.secondary"
                    >
                      位置情報がありません
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Mục: Địa điểm liên quan - FULL WIDTH */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            関連スポット
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {related_places?.slice(0, 5).map((place) => (
              <Paper
                key={place._id}
                sx={{
                  height: 340,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => navigate(`/places/${place._id}`)}
              >
                <Box
                  component="img"
                  src={
                    place.thumbnail ||
                    "https://via.placeholder.com/200x150"
                  }
                  alt={place.name}
                  sx={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <Box
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 1,
                    }}
                  >
                    {place.name}
                  </Typography>

                  {/* Đánh giá sao */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {place.rating > 0 ? (
                        <>
                          {[...Array(5)].map((_, index) => (
                            <StarIcon
                              key={index}
                              sx={{
                                fontSize: 14,
                                color:
                                  index < Math.round(place.rating)
                                    ? "#FFD700"
                                    : "#E0E0E0",
                              }}
                            />
                          ))}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          評価なし
                        </Typography>
                      )}
                    </Box>
                    {place.rating > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {Number(place.rating).toFixed(1)}
                      </Typography>
                    )}
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: "auto",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {place.price_range}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Review Dialog */}
        <ReviewDialog
          open={openReviewDialog}
          onClose={() => setOpenReviewDialog(false)}
          placeId={id}
          onReviewSuccess={() => {
            // Reload reviews after successful submission
            fetchReviews();
          }}
        />
      </Container>
    </Box>
  );
};

export default PlaceDetail;
