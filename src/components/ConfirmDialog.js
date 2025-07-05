import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import { useResponsive } from "../hooks/useResponsive";

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Xác nhận xóa", 
  message = "Bạn có chắc chắn muốn xóa item này không?",
  itemName = "",
  isTrash = false,
  action = "delete" // "delete", "restore", "permanent_delete"
}) {
  const { isMobile } = useResponsive();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isMobile ? "sm" : "xs"}
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontSize: isMobile ? 18 : 20,
        fontWeight: 600,
        color: action === 'restore' ? '#43a047' : (action === 'permanent_delete' ? '#d32f2f' : '#7b1fa2')
      }}>
        {action === 'restore' ? (
          <RestoreIcon sx={{ color: '#43a047' }} />
        ) : (
          <DeleteIcon sx={{ color: action === 'permanent_delete' ? '#d32f2f' : '#7b1fa2' }} />
        )}
        {title}
        <IconButton
          onClick={onClose}
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
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: isMobile ? 14 : 16,
              mb: 2,
              color: 'text.primary'
            }}
          >
            {message}
          </Typography>
          
          {itemName && (
            <Box sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider',
              mb: 2
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: isMobile ? 13 : 14,
                  color: 'text.secondary'
                }}
              >
                Tên: {itemName}
              </Typography>
            </Box>
          )}
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: isMobile ? 12 : 14,
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            {action === 'restore' 
              ? "Item sẽ được khôi phục về vị trí ban đầu."
              : action === 'permanent_delete'
              ? "Hành động này sẽ xóa vĩnh viễn và không thể khôi phục."
              : "Item sẽ được chuyển vào thùng rác và có thể khôi phục sau."
            }
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: isMobile ? 2 : 3,
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            fontSize: isMobile ? 14 : 16,
            py: isMobile ? 0.5 : 1
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color={action === 'restore' ? "success" : (action === 'permanent_delete' ? "error" : "primary")}
          startIcon={action === 'restore' ? <RestoreIcon /> : <DeleteIcon />}
          sx={{ 
            fontSize: isMobile ? 14 : 16,
            py: isMobile ? 0.5 : 1,
            bgcolor: action === 'restore' ? '#43a047' : (action === 'permanent_delete' ? '#d32f2f' : '#7b1fa2'),
            '&:hover': {
              bgcolor: action === 'restore' ? '#2e7d32' : (action === 'permanent_delete' ? '#b71c1c' : '#5e548e')
            }
          }}
        >
          {action === 'restore' ? "Khôi phục" : (action === 'permanent_delete' ? "Xóa vĩnh viễn" : "Xóa")}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 