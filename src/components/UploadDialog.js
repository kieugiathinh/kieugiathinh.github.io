import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Stack, Typography, LinearProgress, Alert, IconButton, Box, useTheme, useMediaQuery } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import CloseIcon from "@mui/icons-material/Close";
import { useResponsive } from "../hooks/useResponsive";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UploadDialog({ open, onClose, onUpload, onCreateFolder, currentFolderName = "Trang chủ" }) {
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      // Giả lập progress (vì uploadBytes không có callback progress)
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += 10;
        setProgress(Math.min(fakeProgress, 90));
      }, 80);
      await onUpload(file);
      clearInterval(interval);
      setProgress(100);
      setMessage("Tải lên thành công!");
      setFile(null);
      
      // Tự động đóng dialog sau 1 giây khi upload thành công
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (e) {
      setError("Tải lên thất bại. Vui lòng thử lại!");
    }
    setUploading(false);
    setTimeout(() => setProgress(0), 1200);
  };

  const handleClose = () => {
    setFile(null);
    setFolderName("");
    setProgress(0);
    setMessage("");
    setError("");
    setUploading(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={isMobile ? "sm" : "xs"} 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 700, 
        color: '#7b1fa2',
        fontSize: isMobile ? 20 : 24
      }}>
        Tạo mới
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: isMobile ? 12 : 14,
            color: 'text.secondary',
            mt: 1,
            fontWeight: 400
          }}
        >
          Thư mục: {currentFolderName}
        </Typography>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            position: 'absolute', 
            right: isMobile ? 16 : 12, 
            top: isMobile ? 16 : 12 
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={isMobile ? 2 : 3} alignItems="center" sx={{ py: isMobile ? 1 : 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: '#ad1457', 
              color: '#fff', 
              fontWeight: 600, 
              borderRadius: 2, 
              fontSize: isMobile ? 14 : 16,
              px: isMobile ? 2 : 3,
              py: isMobile ? 1 : 1.5,
              ':hover': { bgcolor: '#7b1fa2' } 
            }}
            disabled={uploading}
          >
            {file ? "Chọn lại file" : "Chọn file"}
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 500, 
                fontSize: isMobile ? 14 : 16,
                wordBreak: 'break-word'
              }}>
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#888',
                fontSize: isMobile ? 12 : 14
              }}>
                {formatBytes(file.size)}
              </Typography>
            </Box>
          )}
          {progress > 0 && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: isMobile ? 6 : 8, 
                  borderRadius: 2 
                }} 
              />
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: '#7b1fa2', 
              color: '#fff', 
              fontWeight: 600, 
              borderRadius: 2, 
              width: '100%',
              fontSize: isMobile ? 14 : 16,
              py: isMobile ? 1 : 1.5
            }}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Đang tải lên..." : "Upload file"}
          </Button>
          {message && (
            <Alert 
              severity="success" 
              sx={{ width: '100%' }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleClose}
                  sx={{ fontSize: isMobile ? 12 : 14 }}
                >
                  Đóng
                </Button>
              }
            >
              {message}
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          <Typography variant="body2" sx={{ 
            color: '#888',
            fontSize: isMobile ? 14 : 16
          }}>
            Hoặc tạo thư mục mới
          </Typography>
          <TextField
            label="Tên thư mục"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            fullWidth
            size={isMobile ? "small" : "medium"}
            sx={{ borderRadius: 2 }}
            disabled={uploading}
          />
          <Button
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            sx={{ 
              bgcolor: '#43a047', 
              color: '#fff', 
              fontWeight: 600, 
              borderRadius: 2, 
              width: '100%',
              fontSize: isMobile ? 14 : 16,
              py: isMobile ? 1 : 1.5
            }}
            onClick={() => { if (folderName) { onCreateFolder(folderName); setFolderName(""); handleClose(); } }}
            disabled={!folderName || uploading}
          >
            Tạo thư mục
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
} 