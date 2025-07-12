import React, { useState } from "react";
import { List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Tooltip, useTheme, useMediaQuery, Typography, Checkbox } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import DownloadIcon from "@mui/icons-material/Download";
import { useResponsive } from "../hooks/useResponsive";
import ConfirmDialog from "./ConfirmDialog";
import { getThemeColor } from "../utils/themeUtils";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileList({ items, onDelete, onOpenFolder, onRestore, onDownload, isTrash, search, selectedItems = [], onSelectItem, onSelectAll, onDeselectAll }) {
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

  // Lấy danh sách id
  const allIds = items.map(i => i.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedItems.includes(id));
  const someSelected = allIds.some(id => selectedItems.includes(id));

  return (
    <>
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
      {/* Header chọn tất cả */}
      {selectedItems && onSelectAll && onDeselectAll && items.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: isMobile ? 1 : 2 }}>
          <Checkbox
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onChange={e => e.target.checked ? onSelectAll(allIds) : onDeselectAll()}
            size={isMobile ? 'small' : 'medium'}
          />
          <Typography sx={{ fontWeight: 600, fontSize: isMobile ? 14 : 16 }}>
            Chọn tất cả
          </Typography>
        </Box>
      )}
      {items.map(item => (
        <Box
          key={item.id}
          onClick={item.type === "folder" && !isTrash ? () => onOpenFolder(item) : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            mb: isMobile ? 0.5 : 1,
            transition: 'all 0.3s ease',
            pl: isMobile ? 1 : 2,
            py: isMobile ? 1 : 2,
            border: '1px solid',
            borderColor: 'transparent',
            cursor: item.type === "folder" && !isTrash ? 'pointer' : 'default',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            },
            // Không đặt maxHeight, overflow ở đây
          }}
        >
          {/* Checkbox từng item */}
          {selectedItems && onSelectItem && (
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onChange={e => { e.stopPropagation(); onSelectItem(item.id); }}
              size={isMobile ? 'small' : 'medium'}
              sx={{ mr: 1 }}
            />
          )}
          {item.type === "folder" ? 
            <FolderIcon sx={{ 
              color: 'primary.main', 
              fontSize: isMobile ? 24 : 32, 
              mr: 1.5 
            }} /> : 
            <InsertDriveFileIcon sx={{ 
              color: 'secondary.main', 
              fontSize: isMobile ? 22 : 30, 
              mr: 1.5 
            }} />
          }
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{
              fontSize: isMobile ? 14 : 18,
              fontWeight: 500,
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {renderHighlight(item)}
            </Box>
            {item.type === "file" && item.size && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: isMobile ? 11 : 13,
                  mt: 0.5
                }}
              >
                {formatBytes(item.size)}
              </Typography>
            )}
          </Box>
          {isTrash ? (
            <>
              <Tooltip title="Khôi phục">
                <IconButton 
                  onClick={(e) => { e.stopPropagation(); handleRestoreClick(e, item); }} 
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
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, item); }} 
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
                  onClick={(e) => { e.stopPropagation(); handleDownloadClick(e, item); }} 
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
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, item); }} 
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
        </Box>
      ))}
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
    </>
  );
} 