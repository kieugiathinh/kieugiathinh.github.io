import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Stack, Typography, LinearProgress, Alert, IconButton, Box, useTheme, useMediaQuery, Chip, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useResponsive } from "../hooks/useResponsive";
import { getThemeColor } from "../utils/themeUtils";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UploadDialog({ open, onClose, onUpload, onCreateFolder, currentFolderName = "Trang chủ" }) {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    setMessage("");
    setError("");
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setMessage("");
    setError("");
    
    try {
      const totalFiles = files.length;
      let completedFiles = 0;
      let failedFiles = 0;

      // Upload từng file với progress tracking
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Giả lập progress cho từng file
        let fakeProgress = 0;
        const interval = setInterval(() => {
          fakeProgress += 10;
          setUploadProgress(prev => ({
            ...prev,
            [i]: Math.min(fakeProgress, 90)
          }));
        }, 80);

        try {
          await onUpload(file);
          clearInterval(interval);
          setUploadProgress(prev => ({
            ...prev,
            [i]: 100
          }));
          completedFiles++;
        } catch (e) {
          clearInterval(interval);
          failedFiles++;
          console.error(`Upload failed for file ${file.name}:`, e);
        }
      }

      // Hiển thị kết quả
      if (failedFiles === 0) {
        setMessage(`Tải lên thành công ${totalFiles} file!`);
      } else if (completedFiles === 0) {
        setError("Tải lên thất bại tất cả file. Vui lòng thử lại!");
      } else {
        setMessage(`Tải lên thành công ${completedFiles}/${totalFiles} file. ${failedFiles} file thất bại.`);
      }

      // Reset files và progress
      setFiles([]);
      setUploadProgress({});
      
      // Tự động đóng dialog sau 2 giây
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (e) {
      setError("Tải lên thất bại. Vui lòng thử lại!");
    }
    setUploading(false);
    setTimeout(() => setUploadProgress({}), 1200);
  };

  const handleClose = () => {
    setFiles([]);
    setFolderName("");
    setUploadProgress({});
    setMessage("");
    setError("");
    setUploading(false);
    onClose();
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={isMobile ? "sm" : "md"} 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 700, 
        color: 'primary.main',
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
              bgcolor: 'secondary.main', 
              color: 'secondary.contrastText', 
              fontWeight: 600, 
              borderRadius: 2, 
              fontSize: isMobile ? 14 : 16,
              px: isMobile ? 2 : 3,
              py: isMobile ? 1 : 1.5,
              ':hover': { bgcolor: 'primary.main' } 
            }}
            disabled={uploading}
          >
            Chọn file
            <input type="file" multiple hidden onChange={handleFileChange} />
          </Button>

          {files.length > 0 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontSize: isMobile ? 14 : 16,
                mb: 1,
                textAlign: 'center'
              }}>
                Đã chọn {files.length} file ({formatBytes(totalSize)})
              </Typography>
              
              <List sx={{ maxHeight: 250, minHeight: 40, overflowY: 'auto', width: '100%', bgcolor: 'grey.50', borderRadius: 1, border: '1px solid #eee' }}>
                {files.map((file, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={file.name}
                      secondary={formatBytes(file.size)}
                      primaryTypographyProps={{
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        fontSize: isMobile ? 10 : 12
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {/* Progress bars cho từng file */}
              {Object.keys(uploadProgress).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {files.map((file, index) => (
                    uploadProgress[index] !== undefined && (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                          {file.name}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress[index]} 
                          sx={{ 
                            height: 4, 
                            borderRadius: 2 
                          }} 
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              fontWeight: 600, 
              borderRadius: 2, 
              width: '100%',
              fontSize: isMobile ? 14 : 16,
              py: isMobile ? 1 : 1.5
            }}
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? `Đang tải lên ${files.length} file...` : `Upload ${files.length} file`}
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
            color: 'text.secondary',
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
              bgcolor: 'success.main', 
              color: 'success.contrastText', 
              fontWeight: 600, 
              borderRadius: 2, 
              width: '100%',
              fontSize: isMobile ? 14 : 16,
              py: isMobile ? 1 : 1.5
            }}
            onClick={async () => {
              if (folderName) {
                const result = await onCreateFolder(folderName);
                if (result === false) {
                  setError('Đã tồn tại thư mục cùng tên trong thư mục này!');
                } else {
                  setFolderName("");
                  setError("");
                  handleClose();
                }
              }
            }}
            disabled={!folderName || uploading}
          >
            Tạo thư mục
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
} 