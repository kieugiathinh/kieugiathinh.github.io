import React, { useState } from "react";
import { List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import DownloadIcon from "@mui/icons-material/Download";
import { useResponsive } from "../hooks/useResponsive";
import ConfirmDialog from "./ConfirmDialog";
import { getThemeColor } from "../utils/themeUtils";

export default function FileList({ items, onDelete, onOpenFolder, onRestore, onDownload, isTrash, search }) {
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    item: null,
    action: null
  });
  
  function renderHighlight(item) {
    if (item._highlight && item._highlight.indexes) {
      const str = item.name;
      const idxs = item._highlight.indexes;
      let last = 0;
      const out = [];
      idxs.forEach((idx, i) => {
        if (idx > last) out.push(<span key={last + '-n'}>{str.slice(last, idx)}</span>);
        out.push(<span key={idx} style={{ background: 'yellow', color: '#000', borderRadius: 2 }}>{str[idx]}</span>);
        last = idx + 1;
      });
      if (last < str.length) out.push(<span key={last + '-end'}>{str.slice(last)}</span>);
      return out;
    }
    return item.name;
  }

  const handleDeleteClick = (e, item) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    setConfirmDialog({
      open: true,
      item: item,
      action: 'delete'
    });
  };

  const handleRestoreClick = (e, item) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    setConfirmDialog({
      open: true,
      item: item,
      action: 'restore'
    });
  };

  const handleDownloadClick = (e, item) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    if (onDownload) {
      onDownload(item);
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.item && confirmDialog.action) {
      if (confirmDialog.action === 'delete') {
        onDelete(confirmDialog.item);
      } else if (confirmDialog.action === 'restore') {
        onRestore(confirmDialog.item);
      }
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      item: null,
      action: null
    });
  };
  return (
    <Box sx={{ 
      borderRadius: 3, 
      p: isMobile ? 1 : 2, 
      minHeight: isMobile ? 200 : 300 
    }}>
      <List>
        {items.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            color: 'text.secondary', 
            py: isMobile ? 3 : 5, 
            fontSize: isMobile ? 16 : 20 
          }}>
            Không tìm thấy file hoặc thư mục nào phù hợp.
          </Box>
        )}
        {items.map(item => (
                      <ListItem
              key={item.id}
              button={item.type === "folder" && !isTrash}
              onClick={item.type === "folder" && !isTrash ? () => onOpenFolder(item) : undefined}
              sx={{
                borderRadius: 3,
                mb: isMobile ? 0.5 : 1,
                transition: 'all 0.3s ease',
                pl: isMobile ? 1 : 2,
                py: isMobile ? 1 : 2,
                border: '1px solid',
                borderColor: 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
            <ListItemIcon>
              {item.type === "folder" ? 
                <FolderIcon sx={{ 
                  color: 'primary.main', 
                  fontSize: isMobile ? 24 : 32 
                }} /> : 
                <InsertDriveFileIcon sx={{ 
                  color: 'secondary.main', 
                  fontSize: isMobile ? 22 : 30 
                }} />
              }
            </ListItemIcon>
            <ListItemText 
              primary={renderHighlight(item)} 
              primaryTypographyProps={{ 
                fontSize: isMobile ? 14 : 18, 
                fontWeight: 500,
                sx: {
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }
              }} 
            />
            {isTrash ? (
              <>
                <Tooltip title="Khôi phục">
                  <IconButton 
                    onClick={(e) => handleRestoreClick(e, item)} 
                    sx={{ 
                      color: 'success.main',
                      p: isMobile ? 0.5 : 1
                    }}
                  >
                    <RestoreIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa vĩnh viễn">
                  <IconButton 
                    onClick={(e) => handleDeleteClick(e, item)} 
                    sx={{ 
                      color: 'secondary.main',
                      p: isMobile ? 0.5 : 1
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Tải xuống">
                  <IconButton 
                    onClick={(e) => handleDownloadClick(e, item)} 
                    sx={{ 
                      color: 'primary.main',
                      p: isMobile ? 0.5 : 1
                    }}
                  >
                    <DownloadIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton 
                    onClick={(e) => handleDeleteClick(e, item)} 
                    sx={{ 
                      color: 'secondary.main',
                      p: isMobile ? 0.5 : 1
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </ListItem>
        ))}
      </List>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.action === 'restore' ? "Xác nhận khôi phục" : "Xác nhận xóa"}
        message={
          confirmDialog.action === 'restore' 
            ? "Bạn có chắc chắn muốn khôi phục item này không?"
            : "Bạn có chắc chắn muốn xóa item này không?"
        }
        itemName={confirmDialog.item?.name || ""}
        isTrash={isTrash}
        action={confirmDialog.action === 'restore' ? 'restore' : (isTrash ? 'permanent_delete' : 'delete')}
      />
    </Box>
  );
} 