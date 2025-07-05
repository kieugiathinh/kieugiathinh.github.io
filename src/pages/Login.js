import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, TextField, Button, Typography, Stack, Alert, Divider } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import GoogleIcon from "@mui/icons-material/Google";

export default function Login() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError("Đăng nhập Google thất bại!");
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, borderRadius: 4, minWidth: 350, boxShadow: 4 }}>
        <Typography variant="h4" fontWeight={700} color="#7b1fa2" align="center" mb={2}>
          GTStorage
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
          <Tab label="Đăng nhập" />
          <Tab label="Đăng ký" />
        </Tabs>
        {tab === 0 && (
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth autoFocus />
              <TextField label="Mật khẩu" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ fontWeight: 600, borderRadius: 2 }}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <Divider>hoặc</Divider>
              <Button onClick={handleGoogle} startIcon={<GoogleIcon />} variant="outlined" color="secondary" disabled={loading} sx={{ fontWeight: 600, borderRadius: 2 }}>
                Đăng nhập với Google
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        )}
        {tab === 1 && (
          <form onSubmit={handleRegister}>
            <Stack spacing={2}>
              <TextField label="Tên hiển thị" value={name} onChange={e => setName(e.target.value)} required fullWidth autoFocus />
              <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
              <TextField label="Mật khẩu" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ fontWeight: 600, borderRadius: 2 }}>
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