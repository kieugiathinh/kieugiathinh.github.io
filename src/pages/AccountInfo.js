import React, { useState } from "react";
import { Box, Avatar, Typography, Button, Stack, TextField, Paper, IconButton, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useResponsive } from "../hooks/useResponsive";

export default function AccountInfo({ onBack }) {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || "");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: url });
    setAvatar(url);
    setUploading(false);
  };

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '100%' : 420, 
      mx: "auto", 
      mt: isMobile ? 2 : 6,
      p: isMobile ? 2 : 0
    }}>
      <Paper sx={{ 
        p: isMobile ? 2 : 4, 
        borderRadius: 4, 
        boxShadow: 3 
      }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            color="#7b1fa2"
            sx={{ fontSize: isMobile ? 20 : 24 }}
          >
            Thông tin tài khoản
          </Typography>
        </Stack>
        <Stack alignItems="center" spacing={isMobile ? 1.5 : 2}>
          <Avatar 
            src={avatar} 
            sx={{ 
              width: isMobile ? 80 : 100, 
              height: isMobile ? 80 : 100, 
              mb: 1, 
              border: '2.5px solid #fff', 
              boxShadow: '0 2px 8px 0 rgba(123,31,162,0.10)', 
              background: 'linear-gradient(90deg, #bb86fc 0%, #7b1fa2 100%)', 
              transition: 'border-color 0.3s, box-shadow 0.3s' 
            }} 
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: '#ad1457', 
              color: '#fff', 
              borderRadius: 2, 
              fontWeight: 600,
              fontSize: isMobile ? 14 : 16,
              py: isMobile ? 0.5 : 1
            }}
            disabled={uploading}
          >
            {uploading ? "Đang cập nhật..." : "Cập nhật avatar"}
            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </Button>
          <TextField
            label="Tên hiển thị"
            value={user?.displayName || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
            size={isMobile ? "small" : "medium"}
          />
          <TextField
            label="Email"
            value={user?.email || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            size={isMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>
    </Box>
  );
} 