import React, { useState } from "react";
import { Box, Avatar, Typography, Button, Stack, TextField, Paper, IconButton, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useResponsive } from "../hooks/useResponsive";
import { getThemeColor, createGradient } from "../utils/themeUtils";

export default function AccountInfo({ onBack }) {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [originalDisplayName, setOriginalDisplayName] = useState(user?.displayName || "");
  const [hasChanges, setHasChanges] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  // Kiểm tra thay đổi khi displayName thay đổi
  React.useEffect(() => {
    setHasChanges(displayName !== originalDisplayName);
  }, [displayName, originalDisplayName]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      setAvatar(url);
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName });
      setOriginalDisplayName(displayName);
      setHasChanges(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật tên hiển thị:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(originalDisplayName);
    setHasChanges(false);
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
            color="primary"
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
              boxShadow: (theme) => `0 2px 8px 0 ${getThemeColor(theme, 'primary')}20`, 
              background: (theme) => createGradient(theme, '90deg'), 
              transition: 'border-color 0.3s, box-shadow 0.3s' 
            }} 
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: 'secondary.main', 
              color: 'secondary.contrastText', 
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
            value={displayName}
            onChange={handleDisplayNameChange}
            fullWidth
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
          
          {/* Buttons cập nhật/hủy */}
          {hasChanges && (
            <Stack direction="row" spacing={2} sx={{ mt: 2, width: '100%' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ 
                  flex: 1,
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', 
                  borderRadius: 2, 
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 0.5 : 1,
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                {saving ? "Đang lưu..." : "Cập nhật"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                sx={{ 
                  flex: 1,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderRadius: 2, 
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 0.5 : 1,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.light'
                  }
                }}
              >
                Hủy
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
} 