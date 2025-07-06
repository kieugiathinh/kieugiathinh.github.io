import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, TextField, Button, Typography, Stack, Alert, Divider, useTheme, useMediaQuery } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import GoogleIcon from "@mui/icons-material/Google";
import { useResponsive } from "../hooks/useResponsive";
import { getThemeColor } from "../utils/themeUtils";

export default function Login() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const handleTabChange = (_, v) => {
    setTab(v);
    setError("");
    setSuccess("");
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      // Thêm scopes nếu cần
      provider.addScope('email');
      provider.addScope('profile');
      
      // Thử popup trước, nếu thất bại thì dùng redirect
      try {
        await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.log("Popup failed, trying redirect:", popupError);
        // Nếu popup thất bại, dùng redirect
        await signInWithRedirect(auth, provider);
      }
    } catch (e) {
      console.error("Google sign-in error:", e);
      if (e.code === 'auth/popup-blocked') {
        setError("Popup bị chặn! Vui lòng cho phép popup cho trang web này.");
      } else if (e.code === 'auth/unauthorized-domain') {
        setError("Domain chưa được authorize trong Firebase Console!");
      } else {
        setError("Đăng nhập Google thất bại: " + e.message);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError("Sai email hoặc mật khẩu!");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      setSuccess("Đăng ký thành công! Bạn có thể nhấn nút Đăng nhập để đăng nhập.");
      await signOut(auth);
    } catch (e) {
      setError("Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu quá yếu!");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: isMobile ? 2 : 4
    }}>
      <Paper sx={{ 
        p: isMobile ? 2 : 4, 
        borderRadius: 4, 
        minWidth: isMobile ? '100%' : 350, 
        maxWidth: isMobile ? '100%' : 450,
        boxShadow: 4 
      }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color="primary.main" 
          align="center" 
          mb={2}
          sx={{ fontSize: isMobile ? 28 : 32 }}
        >
          GTCloud
        </Typography>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          sx={{ mb: 2 }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Đăng nhập" />
          <Tab label="Đăng ký" />
        </Tabs>
        {tab === 0 && (
          <form onSubmit={handleLogin}>
            <Stack spacing={isMobile ? 1.5 : 2}>
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth 
                autoFocus 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Mật khẩu" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <Divider>hoặc</Divider>
              <Button 
                onClick={handleGoogle} 
                startIcon={<GoogleIcon />} 
                variant="outlined" 
                color="secondary" 
                disabled={loading} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                Đăng nhập với Google
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        )}
        {tab === 1 && (
          <form onSubmit={handleRegister}>
            <Stack spacing={isMobile ? 1.5 : 2}>
              <TextField 
                label="Tên hiển thị" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                fullWidth 
                autoFocus 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Mật khẩu" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
              {tab === 1 && success && (
                <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  );
} 