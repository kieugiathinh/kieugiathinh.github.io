import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Button, IconButton, Box, Typography, useTheme, useMediaQuery, CircularProgress, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useResponsive } from "../hooks/useResponsive";
import { getDownloadURL, getBytes } from "firebase/storage";
import { ref } from "firebase/storage";
import { storage } from "../firebase/config";

export default function ViewDialog({ open, onClose, item }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  useEffect(() => {
    if (open && item) {
      loadFileContent();
    }
  }, [open, item]);

  const loadFileContent = async () => {
    if (!item) {
      console.error('Không có item:', item);
      setError("Không có thông tin file để xem.");
      return;
    }
    
    console.log('Đang tải file:', item.name, 'Owner:', item.owner);
    setLoading(true);
    setError("");
    
    try {
      // Lấy file trực tiếp từ Firebase Storage
      const storageRef = ref(storage, `${item.owner}/${item.name}`);
      console.log('Storage ref:', `${item.owner}/${item.name}`);
      
      if (isImageFile(item.name)) {
        // Với file hình ảnh, lấy URL để hiển thị
        const fileUrl = await getDownloadURL(storageRef);
        console.log('Đã lấy URL cho hình ảnh:', fileUrl);
        setContent(fileUrl);
        return;
      }
      
      if (isPdfFile(item.name)) {
        // Với file PDF, lấy URL để hiển thị trong iframe
        const fileUrl = await getDownloadURL(storageRef);
        console.log('Đã lấy URL cho PDF:', fileUrl);
        setContent(fileUrl);
        return;
      }
      
      if (isOfficeFile(item.name)) {
        // Với file Office, lấy URL để mở trong Google Docs Viewer
        const fileUrl = await getDownloadURL(storageRef);
        console.log('Đã lấy URL cho Office file:', fileUrl);
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        setContent(googleDocsUrl);
        return;
      }
      
      if (isTextFile(item.name)) {
        // Với file text, đọc bytes trực tiếp
        const bytes = await getBytes(storageRef);
        console.log('Đã tải được bytes, độ dài:', bytes.length);
        
        // Thử các encoding khác nhau
        let text;
        try {
          text = new TextDecoder('utf-8').decode(bytes);
        } catch (utf8Err) {
          try {
            text = new TextDecoder('latin1').decode(bytes);
          } catch (latin1Err) {
            text = new TextDecoder('windows-1252').decode(bytes);
          }
        }
        
        console.log('Đã chuyển thành text, độ dài:', text.length);
        setContent(text);
      } else {
        setError("Loại file này không thể xem trực tiếp. Vui lòng tải xuống để xem.");
      }
    } catch (err) {
      console.error('Lỗi khi tải nội dung file:', err);
      setError(`Không thể tải nội dung file: ${err.message}. Vui lòng thử tải xuống file để xem.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setError("");
    setLoading(false);
    onClose();
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const isTextFile = (filename) => {
    const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'csv', 'log', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt'];
    return textExtensions.includes(getFileExtension(filename));
  };

  const isOfficeFile = (filename) => {
    const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'odp'];
    return officeExtensions.includes(getFileExtension(filename));
  };

  const isPdfFile = (filename) => {
    return getFileExtension(filename) === 'pdf';
  };

  const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(getFileExtension(filename));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      );
    }

    if (!item) return null;

    if (isImageFile(item.name)) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src={content} 
            alt={item.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh', 
              objectFit: 'contain' 
            }}
            onError={(e) => {
              console.error('Lỗi khi tải hình ảnh:', e);
              setError("Không thể tải hình ảnh. Vui lòng kiểm tra lại file.");
            }}
          />
        </Box>
      );
    }

    if (isPdfFile(item.name)) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: '70vh',
          border: '1px solid #eee',
          borderRadius: 1
        }}>
          <iframe
            src={content}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={item.name}
            onError={(e) => {
              console.error('Lỗi khi tải PDF:', e);
              setError("Không thể tải PDF. Vui lòng tải xuống để xem.");
            }}
          />
        </Box>
      );
    }

    if (isOfficeFile(item.name)) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: '70vh',
          border: '1px solid #eee',
          borderRadius: 1
        }}>
          <iframe
            src={content}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={item.name}
            onError={(e) => {
              console.error('Lỗi khi tải Office file:', e);
              setError("Không thể tải Office file. Vui lòng tải xuống để xem.");
            }}
          />
        </Box>
      );
    }

    if (isTextFile(item.name)) {
      return (
        <Box sx={{ 
          bgcolor: 'grey.50', 
          p: 2, 
          borderRadius: 1, 
          border: '1px solid #eee',
          maxHeight: '60vh',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: isMobile ? 12 : 14,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {content ? (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                Độ dài: {content.length} ký tự
              </Typography>
              {content}
            </>
          ) : (
            "Nội dung file trống"
          )}
        </Box>
      );
    }

    return (
      <Alert severity="info" sx={{ width: '100%' }}>
        Loại file này không thể xem trực tiếp. Vui lòng tải xuống để xem.
      </Alert>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={false}
      fullWidth={!isMobile}
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          width: isMobile ? '100%' : '800px',
          maxWidth: isMobile ? '100%' : '90vw',
          maxHeight: isMobile ? '100%' : '90vh',
          borderRadius: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 700, 
        color: 'primary.main',
        fontSize: isMobile ? 18 : 22
      }}>
        Xem: {item?.name}
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
        <Box sx={{ py: isMobile ? 1 : 2 }}>
          {renderContent()}
        </Box>
      </DialogContent>
    </Dialog>
  );
} 