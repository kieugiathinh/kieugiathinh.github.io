import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Stack, Typography, LinearProgress, Alert, IconButton, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import CloseIcon from "@mui/icons-material/Close";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UploadDialog({ open, onClose, onUpload, onCreateFolder }) {
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#7b1fa2' }}>
        Tạo mới
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} alignItems="center" sx={{ py: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ bgcolor: '#ad1457', color: '#fff', fontWeight: 600, borderRadius: 2, ':hover': { bgcolor: '#7b1fa2' } }}
            disabled={uploading}
          >
            {file ? "Chọn lại file" : "Chọn file"}
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{file.name}</Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>{formatBytes(file.size)}</Typography>
            </Box>
          )}
          {progress > 0 && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2 }} />
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ bgcolor: '#7b1fa2', color: '#fff', fontWeight: 600, borderRadius: 2, width: '100%' }}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Đang tải lên..." : "Upload file"}
          </Button>
          {message && <Alert severity="success" sx={{ width: '100%' }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          <Typography variant="body2" sx={{ color: '#888' }}>Hoặc tạo thư mục mới</Typography>
          <TextField
            label="Tên thư mục"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            fullWidth
            size="small"
            sx={{ borderRadius: 2 }}
            disabled={uploading}
          />
          <Button
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            sx={{ bgcolor: '#43a047', color: '#fff', fontWeight: 600, borderRadius: 2, width: '100%' }}
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