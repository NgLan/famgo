import { AppBar, Toolbar, Stack, IconButton, Button, Box, InputBase, Typography } from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react';
import { getCookie } from '../../helpers/cookies.helper';

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const token = getCookie('token');
  const fullName = getCookie('fullName');

  const handleProfileClick = () => {
    navigate('/profile');
  };


  // 検索フォームが送信されたときの処理
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/search?keyword=${searchTerm.trim()}`);
      console.log("Searching for:", `/search?keyword=${searchTerm.trim()}`);

    } else {
      navigate('/search');
    }
  };
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: '#fff',
        borderBottom: '2px solid #000',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: 72, gap: 2 }}>
        {/* Left group */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              px: 1,
              textDecoration: 'none',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { opacity: 0.9 },
            }}
          >
            {logoLoadFailed ? (
              <Box
                sx={{
                  fontWeight: 900,
                  fontSize: 28,
                  letterSpacing: 1,
                  lineHeight: 1.1,
                  backgroundImage: 'linear-gradient(transparent 70%, rgba(255, 105, 180, 0.55) 70%)',
                  backgroundRepeat: 'no-repeat',
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
                  width: 'auto',
                  display: 'block',
                }}
              />
            )}
          </Box>

          {/* Divider */}
          <Box sx={{ width: 2, height: 36, backgroundColor: '#000' }} />

          {/* Home */}
          <IconButton
            component={Link}
            to="/"
            sx={{
              width: 44,
              height: 44,
              border: '2px solid #000',
              borderRadius: 2,
              color: '#000',
              backgroundColor: '#fff',
              boxShadow: '2px 2px 0 #000',
              '&:hover': {
                backgroundColor: '#fff',
                transform: 'translate(-1px, -1px)',
                boxShadow: '3px 3px 0 #000',
              },
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </IconButton>

          {/* Navigation */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 1 }}>
            <Button
              component={Link}
              to="/ranking"
              size="small"
              sx={{
                fontWeight: 800,
                color: '#000',
                backgroundColor: 'transparent',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'transparent', opacity: 0.85 },
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
                color: '#000',
                backgroundColor: 'transparent',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'transparent', opacity: 0.85 },
              }}
            >
              スケジュール
            </Button>
          </Stack>
        </Stack>

        {/* Center search box grows */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              maxWidth: 640,
              px: 2,
              py: 0.9,
              borderRadius: 999,
              backgroundColor: '#fff',
              border: '2px solid #000',
              boxShadow: '2px 2px 0 #000',
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: '#000' }} />
            <InputBase
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="家族でどこへ行く？"
              inputProps={{ 'aria-label': 'search' }}
              sx={{ flex: 1, fontSize: 14, color: '#111', minWidth: 0 }}
            />
          </Box>
        </Box>

        {/* Auth buttons or User Menu */}
        {token ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <Box
              onClick={handleProfileClick}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                cursor: 'pointer',
                borderRadius: 2,
                border: '2px solid #000',
                backgroundColor: '#fff',
                boxShadow: '2px 2px 0 #000',
                '&:hover': {
                  backgroundColor: '#fff',
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '3px 3px 0 #000',
                },
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: '#000',
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {fullName || 'ユーザー'}
              </Typography>
              <AccountCircleIcon sx={{ color: '#000' }} />
            </Box>

            <IconButton
              size="small"
              sx={{
                width: 44,
                height: 44,
                border: '2px solid #000',
                borderRadius: 2,
                color: '#000',
                backgroundColor: '#fff',
                boxShadow: '2px 2px 0 #000',
                '&:hover': {
                  backgroundColor: '#fff',
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '3px 3px 0 #000',
                },
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={handleProfileClick}
              size="small"
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                width: 44,
                height: 44,
                border: '2px solid #000',
                borderRadius: 2,
                color: '#000',
                backgroundColor: '#fff',
                boxShadow: '2px 2px 0 #000',
                '&:hover': {
                  backgroundColor: '#fff',
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '3px 3px 0 #000',
                },
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0 }}>
            <Button
              component={Link}
              to="/login"
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 999,
                border: '2px solid #000',
                color: '#000',
                fontWeight: 800,
                textTransform: 'none',
                backgroundColor: '#fff',
                boxShadow: '2px 2px 0 #000',
                '&:hover': {
                  backgroundColor: '#fff',
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '3px 3px 0 #000',
                  border: '2px solid #000',
                },
                transition: 'transform 120ms ease, box-shadow 120ms ease',
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
                backgroundColor: '#ff5b95',
                color: '#fff',
                fontWeight: 900,
                textTransform: 'none',
                border: '2px solid #000',
                boxShadow: '2px 2px 0 #000',
                '&:hover': {
                  backgroundColor: '#ff3f86',
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '3px 3px 0 #000',
                  border: '2px solid #000',
                },
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
            >
              新規登録
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
