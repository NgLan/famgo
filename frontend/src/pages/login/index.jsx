import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import { login } from '../../services/user.services';
import { setCookie } from '../../helpers/cookies.helper';
import Header from '../../components/header';

function Login() {
  const navigate = useNavigate();
  // 2. Khởi tạo location để nhận dữ liệu từ trang trước gửi sang
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error('メールアドレスとパスワードを入力してください');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('メールアドレスの形式が正しくありません');
        setLoading(false);
        return;
      }

      const option = {
        email: email.trim(),
        password,
      };

      const response = await login(option);

      if (response && response.token) {
        const expiryDays = rememberMe ? 30 : 1;
        setCookie('token', response.token, expiryDays);

        if (response.data) {
          setCookie('fullName', response.data.fullName, expiryDays);
          try {
            setCookie('user', JSON.stringify(response.data), expiryDays);
          } catch {
            // ignore
          }
        }

        toast.success('ログインに成功しました。');

        // Logic quay lại trang cũ an toàn hơn
        const stateFrom = location.state?.from;
        let destination = '/';

        if (stateFrom) {
            // Trường hợp 1: stateFrom là object { pathname, search } (Do ta vừa sửa ở SearchPage)
            if (typeof stateFrom === 'object' && stateFrom.pathname) {
                destination = `${stateFrom.pathname}${stateFrom.search || ''}`;
            } 
            // Trường hợp 2: stateFrom là string (Các trang cũ có thể vẫn gửi string)
            else if (typeof stateFrom === 'string') {
                destination = stateFrom;
            }
        }

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1000);
        // -----------------------------------------------

      } else {
        toast.error(response?.message || 'ログインに失敗しました。入力内容をご確認ください。');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('エラーが発生しました。しばらくしてからもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f6f2df',
      }}
    >
      <Header />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 6, sm: 8 },
          px: 2,
        }}
      >
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 620,
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              backgroundColor: '#fff',
              border: '2px solid #000',
              boxShadow: '10px 10px 0 #000',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                align="center"
                sx={{
                  fontWeight: 900,
                  color: '#000',
                  position: 'relative',
                  display: 'inline-block',
                  pb: 1,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: 0,
                    width: '65%',
                    height: 4,
                    backgroundColor: '#ff5b95',
                    borderRadius: 999,
                  },
                }}
              >
                ログイン
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    color: '#000',
                    fontWeight: 800,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#000',
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#eef6ff',
                    '& fieldset': { border: '2px solid #000' },
                    '&:hover fieldset': { border: '2px solid #000' },
                    '&.Mui-focused fieldset': { border: '2px solid #000' },
                  },
                }}
              />

              <TextField
                fullWidth
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    color: '#000',
                    fontWeight: 800,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#000',
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fdeff5',
                    '& fieldset': { border: '2px solid #000' },
                    '&:hover fieldset': { border: '2px solid #000' },
                    '&.Mui-focused fieldset': { border: '2px solid #000' },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#000',
                        '&.Mui-checked': { color: '#000' },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontWeight: 800, color: '#000' }}>ログイン情報を保存する</Typography>}
                />
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#1e88e5',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  パスワードをお忘れですか？
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.6,
                  fontWeight: 900,
                  fontSize: 16,
                  textTransform: 'none',
                  borderRadius: 2,
                  mb: 3,
                  backgroundColor: '#4a90e2',
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0 #000',
                  '&:hover': {
                    backgroundColor: '#357fd6',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '5px 5px 0 #000',
                  },
                  '&:disabled': {
                    background: '#9fbfe8',
                    color: '#fff',
                    border: '2px solid #000',
                    boxShadow: '4px 4px 0 #000',
                  },
                  transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                }}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#000', fontWeight: 800 }}>
                  アカウントをお持ちでない方は{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#ff5b95',
                      fontWeight: 900,
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    新規登録
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Login;