import React, { useState } from "react";
import { Box, Avatar, Typography, Button, Stack, TextField, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AccountInfo({ onBack }) {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || "");

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
    <Box sx={{ maxWidth: 420, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700} color="#7b1fa2">Thông tin tài khoản</Typography>
        </Stack>
        <Stack alignItems="center" spacing={2}>
          <Avatar src={avatar} sx={{ width: 100, height: 100, mb: 1, border: '2.5px solid #fff', boxShadow: '0 2px 8px 0 rgba(123,31,162,0.10)', background: 'linear-gradient(90deg, #bb86fc 0%, #7b1fa2 100%)', transition: 'border-color 0.3s, box-shadow 0.3s' }} />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ bgcolor: '#ad1457', color: '#fff', borderRadius: 2, fontWeight: 600 }}
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
          />
          <TextField
            label="Email"
            value={user?.email || ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Stack>
      </Paper>
    </Box>
  );
} 