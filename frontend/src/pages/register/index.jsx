import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import Header from '../../components/header';
import { register } from '../../services/user.services';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('すべての項目を入力してください');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('メールアドレスの形式が正しくありません');
        setLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        toast.error('パスワードは6文字以上で入力してください');
        setLoading(false);
        return;
      }

      // Check password match
      if (formData.password !== formData.confirmPassword) {
        toast.error('確認用パスワードが一致しません');
        setLoading(false);
        return;
      }

      // Check terms agreement
      if (!agreedToTerms) {
        toast.error('利用規約とプライバシーポリシーに同意してください');
        setLoading(false);
        return;
      }

      // Call API
      const option = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const response = await register(option);
      console.log('Register response:', response);

      // Kiểm tra thành công dựa vào response có data hoặc message thành công
      if (response && (response.data || response.message === 'Đăng ký thành công')) {
        toast.success('登録に成功しました。');

        // Chuyển hướng đến trang login sau 1 giây
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        toast.error(response.message || '登録に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Register error:', error);
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
            {/* Title */}
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
                新規登録
              </Typography>
            </Box>
            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Full Name Input */}
              <TextField
                fullWidth
                label="氏名"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
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

              {/* Email Input */}
              <TextField
                fullWidth
                label="メールアドレス"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                    backgroundColor: '#eef6ff',
                    '& fieldset': { border: '2px solid #000' },
                    '&:hover fieldset': { border: '2px solid #000' },
                    '&.Mui-focused fieldset': { border: '2px solid #000' },
                  },
                }}
              />

              {/* Password Input */}
              <TextField
                fullWidth
                label="パスワード"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
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

              {/* Confirm Password Input */}
              <TextField
                fullWidth
                label="パスワード（確認）"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
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

              {/* Terms Agreement Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    sx={{
                      color: '#000',
                      '&.Mui-checked': { color: '#000' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 800 }}>
                    <span style={{ color: '#ff5b95', fontWeight: 900 }}>利用規約</span>
                    と
                    <span style={{ color: '#1e88e5', fontWeight: 900 }}>プライバシーポリシー</span>
                    に同意します
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              {/* Register Button */}
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
                {loading ? '登録中...' : '登録'}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#000', fontWeight: 800 }}>
                  すでにアカウントをお持ちですか？{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#ff5b95',
                      fontWeight: 900,
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    ログイン
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

export default Register;
