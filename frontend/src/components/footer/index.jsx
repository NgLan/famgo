import { Box, Container, Grid, Typography, Link as MuiLink, Stack, Divider, IconButton } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { useState } from 'react'

function Footer() {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#fff',
        color: '#000',
        py: 5,
        mt: 'auto',
        borderTop: '2px solid #000',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          '@media (min-width:600px)': {
            px: '90px',
          },
        }}
      >
        <Grid
          container
          spacing={{ xs: 5, md: 0 }}
          sx={{
            '@media (min-width:900px)': {
              '--Grid-rowSpacing': '100px',
              '--Grid-columnSpacing': '100px',
            },
          }}
        >
          {/* Left: Website info */}
          <Grid item xs={12} md={3}>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {logoLoadFailed ? (
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{
                      fontSize: 22,
                      letterSpacing: 1,
                      backgroundImage: 'linear-gradient(transparent 70%, rgba(255, 105, 180, 0.55) 70%)',
                      backgroundRepeat: 'no-repeat',
                      lineHeight: 1.1,
                    }}
                  >
                    FAMGO!
                  </Typography>
                ) : (
                  <Box
                    component="img"
                    src="/famgo-logo.png"
                    alt="FAMGO"
                    onError={() => setLogoLoadFailed(true)}
                    sx={{ height: 44, width: 'auto', display: 'block' }}
                  />
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.8,
                  fontWeight: 700,
                  color: '#000',
                }}
              >
                家族で一緒に出かけよう
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <LocationOnIcon fontSize="small" sx={{ mt: 0.3, color: '#000' }} />
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#000' }}>
                  ハノイ工科大学<br />1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailIcon fontSize="small" sx={{ color: '#000' }} />
                <Typography variant="body2" sx={{ color: '#000' }}>
                  contact@hanoiweekend.vn
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PhoneIcon fontSize="small" sx={{ color: '#000' }} />
                <Typography variant="body2" sx={{ color: '#000' }}>
                  ホットライン: 0344 570 115
                </Typography>
              </Stack>
            </Stack>

            {/* Social icons */}
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <IconButton
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                sx={{
                  width: 44,
                  height: 44,
                  border: '2px solid #000',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  color: '#000',
                  boxShadow: '2px 2px 0 #000',
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '3px 3px 0 #000',
                  },
                  transition: 'transform 120ms ease, box-shadow 120ms ease'
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                sx={{
                  width: 44,
                  height: 44,
                  border: '2px solid #000',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  color: '#000',
                  boxShadow: '2px 2px 0 #000',
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '3px 3px 0 #000',
                  },
                  transition: 'transform 120ms ease, box-shadow 120ms ease'
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                sx={{
                  width: 44,
                  height: 44,
                  border: '2px solid #000',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  color: '#000',
                  boxShadow: '2px 2px 0 #000',
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '3px 3px 0 #000',
                  },
                  transition: 'transform 120ms ease, box-shadow 120ms ease'
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="YouTube"
                href="https://youtube.com"
                target="_blank"
                sx={{
                  width: 44,
                  height: 44,
                  border: '2px solid #000',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  color: '#000',
                  boxShadow: '2px 2px 0 #000',
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '3px 3px 0 #000',
                  },
                  transition: 'transform 120ms ease, box-shadow 120ms ease'
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Column 2: Discover */}
          <Grid item xs={12} sm={8} md={2.25}>
            <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: '#000', mb: 2 }}>
              探索
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/places" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                注目スポット
              </MuiLink>
              <MuiLink href="/events" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                週末イベント
              </MuiLink>
              <MuiLink href="/food" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                グルメ
              </MuiLink>
              <MuiLink href="/parks" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                公園・湖
              </MuiLink>
              <MuiLink href="/museums" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                博物館・史跡
              </MuiLink>
              <MuiLink href="/shopping" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                ショッピング
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 3: About */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: '#000', mb: 2 }}>
              私たちについて
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/about" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                会社概要
              </MuiLink>
              <MuiLink href="/mission" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                ミッション
              </MuiLink>
              <MuiLink href="/blog" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                ブログ
              </MuiLink>
              <MuiLink href="/partners" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                パートナー
              </MuiLink>
              <MuiLink href="/careers" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                採用情報
              </MuiLink>
            </Stack>
          </Grid>

          {/* Column 4: Dev team */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: '#000', mb: 2 }}>
              開発チーム
            </Typography>
            <Stack spacing={0.8}>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Lê Thái Sơn - TL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Nguyễn Quốc Khánh - SL</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Cao Thành Đạt</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Trần Doãn Huy</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Vũ Thị Quỳnh Như</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Nguyễn Đức Đại Dương</Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: '#000' }}>Phạm Long Khánh</Typography>
            </Stack>
          </Grid>

          {/* Column 5: Support & Policy */}
          <Grid item xs={12} sm={6} md={2.25}>
            <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: '#000', mb: 2 }}>
              サポート・ポリシー
            </Typography>
            <Stack spacing={1.2}>
              <MuiLink href="/guide" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                ご利用ガイド
              </MuiLink>
              <MuiLink href="/faq" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                よくある質問
              </MuiLink>
              <MuiLink href="/terms" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                利用規約
              </MuiLink>
              <MuiLink href="/privacy" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                プライバシーポリシー
              </MuiLink>
              <MuiLink href="/contact" underline="hover" sx={{ fontSize: 14, color: '#000', '&:hover': { opacity: 0.75 } }}>
                お問い合わせ
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#000', borderBottomWidth: 2 }} />

        <Typography variant="body2" align="center" sx={{ color: '#000', fontWeight: 700 }}>
          &copy; {new Date().getFullYear()} ハノイ週末。美しい首都を毎日発見しよう。
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
