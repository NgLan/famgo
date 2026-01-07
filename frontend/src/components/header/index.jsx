import {
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Button,
  Box,
  InputBase,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { getCookie, deleteCookie } from "../../helpers/cookies.helper"; // Thêm deleteCookie

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  // State cho Menu Dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const token = getCookie("token");
  const fullName = getCookie("fullName");
  const avatar = getCookie("avatar");

  // Mở menu khi click avatar
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Xử lý khi chọn "Trang cá nhân"
  const handleGoToProfile = () => {
    handleClose();
    navigate("/profile");
  };

  // Xử lý Logout từ Header -> Về trang chủ
  const handleLogout = () => {
    handleClose();
    deleteCookie("token");
    deleteCookie("fullName");
    deleteCookie("user");
    navigate("/"); // Chuyển về Home
    window.location.reload(); // Reload để cập nhật lại Header (ẩn avatar đi)
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?keyword=${searchTerm.trim()}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: "#fff",
        borderBottom: "2px solid #000",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: 72, gap: 2 }}>
        {/* Left group */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              px: 1,
              textDecoration: "none",
              color: "#000",
              display: "flex",
              alignItems: "center",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {logoLoadFailed ? (
              <Box
                sx={{
                  fontWeight: 900,
                  fontSize: 28,
                  letterSpacing: 1,
                  lineHeight: 1.1,
                  backgroundImage:
                    "linear-gradient(transparent 70%, rgba(255, 105, 180, 0.55) 70%)",
                  backgroundRepeat: "no-repeat",
                }}
              >
                FAMGO!
              </Box>
            ) : (
              <Box
                component="img"
                src="/famgo-logo.png"
                alt="FAMGO"
                onError={() => setLogoLoadFailed(true)}
                sx={{
                  height: 44,
                  width: "auto",
                  display: "block",
                }}
              />
            )}
          </Box>

          <Box sx={{ width: 2, height: 36, backgroundColor: "#000" }} />

          <IconButton
            component={Link}
            to="/"
            sx={{
              width: 44,
              height: 44,
              border: "2px solid #000",
              borderRadius: 2,
              color: "#000",
              backgroundColor: "#fff",
              boxShadow: "2px 2px 0 #000",
              "&:hover": {
                backgroundColor: "#fff",
                transform: "translate(-1px, -1px)",
                boxShadow: "3px 3px 0 #000",
              },
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </IconButton>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 1 }}>
            <Button
              component={Link}
              to="/ranking"
              size="small"
              sx={{
                fontWeight: 800,
                color: "#000",
                backgroundColor: "transparent",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent", opacity: 0.85 },
              }}
            >
              ランキング
            </Button>
            <Button
              component={Link}
              to="/schedule"
              size="small"
              sx={{
                fontWeight: 800,
                color: "#000",
                backgroundColor: "transparent",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent", opacity: 0.85 },
              }}
            >
              スケジュール
            </Button>
          </Stack>
        </Stack>

        {/* Center search box */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              maxWidth: 640,
              px: 2,
              py: 0.9,
              borderRadius: 999,
              backgroundColor: "#fff",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: "#000" }} />
            <InputBase
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="家族でどこへ行く？"
              inputProps={{ "aria-label": "search" }}
              sx={{ flex: 1, fontSize: 14, color: "#111", minWidth: 0 }}
            />
          </Box>
        </Box>

        {/* Auth buttons or User Menu */}
        {token ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            {/* User Info Box (Desktop) - Click to open Menu */}
            <Box
              onClick={handleProfileClick} // Mở menu
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                cursor: "pointer",
                borderRadius: 2,
                border: "2px solid #000",
                backgroundColor: "#fff",
                boxShadow: "2px 2px 0 #000",
                "&:hover": {
                  backgroundColor: "#fff",
                  transform: "translate(-1px, -1px)",
                  boxShadow: "3px 3px 0 #000",
                },
                transition: "transform 120ms ease, box-shadow 120ms ease",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "#000",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {fullName || "ユーザー"}
              </Typography>
              <img
                src={avatar}
                alt="avatar"
                width={26}
                height={26}
                style={{ borderRadius: "50%" }}
              />
            </Box>

            {/* Mobile Account Icon - Click to open Menu */}
            <IconButton
              onClick={handleProfileClick}
              size="small"
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                width: 44,
                height: 44,
                border: "2px solid #000",
                borderRadius: 2,
                color: "#000",
                backgroundColor: "#fff",
                boxShadow: "2px 2px 0 #000",
                "&:hover": {
                  backgroundColor: "#fff",
                  transform: "translate(-1px, -1px)",
                  boxShadow: "3px 3px 0 #000",
                },
                transition: "transform 120ms ease, box-shadow 120ms ease",
              }}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  border: "2px solid #000",
                  boxShadow: "4px 4px 0 #000", // Style Neo Brutalism
                  borderRadius: 2,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                    borderTop: "2px solid #000",
                    borderLeft: "2px solid #000",
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleGoToProfile} sx={{ fontWeight: "bold" }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" sx={{ color: "#000" }} />
                </ListItemIcon>
                マイページ
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: "#000" }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ fontWeight: "bold", color: "#d32f2f" }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "#d32f2f" }} />
                </ListItemIcon>
                ログアウト
              </MenuItem>
            </Menu>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            <Button
              component={Link}
              to="/login"
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 999,
                border: "2px solid #000",
                color: "#000",
                fontWeight: 800,
                textTransform: "none",
                backgroundColor: "#fff",
                boxShadow: "2px 2px 0 #000",
                "&:hover": {
                  backgroundColor: "#fff",
                  transform: "translate(-1px, -1px)",
                  boxShadow: "3px 3px 0 #000",
                  border: "2px solid #000",
                },
                transition: "transform 120ms ease, box-shadow 120ms ease",
              }}
            >
              ログイン
            </Button>
            <Button
              size="small"
              variant="contained"
              component={Link}
              to="/register"
              disableElevation
              sx={{
                borderRadius: 999,
                backgroundColor: "#ff5b95",
                color: "#fff",
                fontWeight: 900,
                textTransform: "none",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                "&:hover": {
                  backgroundColor: "#ff3f86",
                  transform: "translate(-1px, -1px)",
                  boxShadow: "3px 3px 0 #000",
                  border: "2px solid #000",
                },
                transition: "transform 120ms ease, box-shadow 120ms ease",
              }}
            >
              新規登録
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
