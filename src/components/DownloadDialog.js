import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useResponsive } from "../hooks/useResponsive";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DownloadDialog({ 
  open, 
  onClose, 
  onConfirm, 
  item, 
  filesInFolder = [],
  loading = false 
}) {
  const { isMobile } = useResponsive();

  if (!item) return null;

  const isFolder = item.type === "folder";
  const totalSize = filesInFolder.reduce((sum, file) => sum + (file.size || 0), 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: isMobile ? 1 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 700,
        fontSize: isMobile ? 18 : 20
      }}>
        Tải xuống {isFolder ? 'thư mục' : 'file'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#f5f5f5',
            borderRadius: 2,
            color: (theme) => theme.palette.mode === 'dark' ? '#222' : '#222',
            boxShadow: 1,
            border: '1.5px solid',
            borderColor: (theme) => theme.palette.primary.main + '33'
          }}>
            {isFolder ? (
              <FolderIcon sx={{ fontSize: isMobile ? 32 : 40, color: 'primary.main' }} />
            ) : (
              <InsertDriveFileIcon sx={{ fontSize: isMobile ? 30 : 38, color: 'secondary.main' }} />
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 0.5 }}>
                {item.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 500 }}>
                {isFolder ? 'Thư mục' : 'File'} • {formatBytes(isFolder ? totalSize : (item.size || 0))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {isFolder && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Nội dung thư mục:
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filesInFolder.length > 0 ? (
              <List sx={{ 
                maxHeight: 200, 
                overflow: 'auto',
                bgcolor: 'grey.50',
                borderRadius: 2
              }}>
                {filesInFolder.map((file, index) => (
                  <ListItem key={index} dense>
                    <ListItemIcon>
                      <InsertDriveFileIcon sx={{ fontSize: 20, color: '#ad1457' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.path || file.name}
                      secondary={formatBytes(file.size || 0)}
                      primaryTypographyProps={{ fontSize: isMobile ? 12 : 14 }}
                      secondaryTypographyProps={{ fontSize: isMobile ? 10 : 12 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Thư mục trống
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {isFolder 
            ? `Thư mục sẽ được nén thành file ZIP với tên "${item.name}.zip"`
            : 'File sẽ được tải xuống với tên gốc'
          }
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            fontSize: isMobile ? 12 : 14
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={isFolder && filesInFolder.length === 0}
          sx={{ 
            borderRadius: 2,
            fontSize: isMobile ? 12 : 14,
            fontWeight: 600
          }}
        >
          Tải xuống
        </Button>
      </DialogActions>
    </Dialog>
  );
} 