import React from "react";
import { Box, Button, Paper, Typography, Divider, List, ListItemButton, ListItemIcon, ListItemText, Drawer, IconButton, useTheme, useMediaQuery } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useResponsive } from "../hooks/useResponsive";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Sidebar({ onNew, usedSize = 0, rootFolders = [], setCurrentFolder, currentFolder, isTrash, setIsTrash, open, onClose }) {
  const total = 1 * 1024 * 1024 * 1024; // 1GB
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const sidebarContent = (
    <Box sx={{ 
      width: isMobile ? '100%' : isTablet ? 280 : 300, 
      height: isMobile ? "100vh" : "96vh", 
      m: isMobile ? 0 : 2, 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: 'background.paper', 
      borderRadius: isMobile ? 0 : 2, 
      boxShadow: 2, 
      p: isMobile ? 3 : 2 
    }}>
      {/* Logo Section - Fixed at top */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: isMobile ? 2 : 3,
        pt: isMobile ? 1 : 0,
        flexShrink: 0
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1,
          position: 'relative',
          zIndex: 1
        }}>
          <img 
            src="/logogt.png" 
            alt="logo" 
            style={{ 
              width: isMobile ? 32 : 40, 
              marginRight: isMobile ? 6 : 8,
              height: 'auto'
            }} 
          />
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? 24 : 28, 
            color: '#7b1fa2' 
          }}>
            GTCloud
          </span>
        </Box>
      </Box>
      
      {/* Main Content Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ 
              width: "100%", 
              mb: 3, 
              bgcolor: 'primary.main', 
              color: '#fff', 
              fontWeight: "bold", 
              fontSize: isMobile ? 16 : 18, 
              borderRadius: 3, 
              boxShadow: 2, 
              ':hover': { bgcolor: 'primary.dark' } 
            }}
            onClick={() => { 
              setIsTrash(false); 
              onNew(); 
              if (isMobile) onClose(); 
            }}
          >
            Mới
          </Button>
          <Button
            startIcon={<HomeIcon />}
            sx={{ 
              width: "100%", 
              justifyContent: "flex-start", 
              color: 'primary.main', 
              fontWeight: !isTrash && !currentFolder ? 700 : 500, 
              fontSize: isMobile ? 15 : 17, 
              borderRadius: 2, 
              mb: 1, 
              pl: 2, 
              ':hover': { bgcolor: 'background.default' } 
            }}
            onClick={() => { 
              setCurrentFolder(null); 
              setIsTrash(false); 
              if (isMobile) onClose(); 
            }}
          >
            Trang chủ
          </Button>
          {/* Danh sách folder gốc */}
          <List dense sx={{ mb: 1 }}>
            {rootFolders.map(folder => (
              <ListItemButton
                key={folder.id}
                selected={currentFolder === folder.id && !isTrash}
                onClick={() => { 
                  setCurrentFolder(folder.id); 
                  setIsTrash(false); 
                  if (isMobile) onClose(); 
                }}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5, 
                  pl: isMobile ? 2 : 3, 
                  bgcolor: currentFolder === folder.id && !isTrash ? 'background.default' : undefined 
                }}
              >
                <ListItemIcon>
                  <FolderIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name} 
                  primaryTypographyProps={{ 
                    fontWeight: currentFolder === folder.id && !isTrash ? 700 : 500, 
                    color: 'text.primary',
                    fontSize: isMobile ? 14 : 16
                  }} 
                />
              </ListItemButton>
            ))}
          </List>
          <List dense>
            <ListItemButton
              selected={isTrash}
              onClick={() => { 
                setIsTrash(true); 
                setCurrentFolder(null); 
                if (isMobile) onClose(); 
              }}
              sx={{ 
                borderRadius: 2, 
                pl: isMobile ? 2 : 3, 
                bgcolor: isTrash ? 'background.default' : undefined 
              }}
            >
              <ListItemIcon>
                <DeleteIcon sx={{ color: 'secondary.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Thùng rác" 
                primaryTypographyProps={{ 
                  fontWeight: isTrash ? 700 : 500, 
                  color: 'text.primary',
                  fontSize: isMobile ? 14 : 16
                }} 
              />
            </ListItemButton>
          </List>
          <Divider sx={{ my: 2 }} />
        </div>
        
        {/* Storage Info Section - Fixed at bottom */}
        <Box sx={{ 
          fontSize: isMobile ? 13 : 15, 
          color: 'text.secondary', 
          mt: 2, 
          textAlign: "center",
          flexShrink: 0
        }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, fontSize: isMobile ? 12 : 14 }}>
            Đã sử dụng {formatBytes(usedSize)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'secondary.main', fontSize: isMobile ? 12 : 14 }}>
            trên tổng số 1GB
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Render cho mobile với Drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {sidebarContent}
      </Drawer>
    );
  }

  // Render cho desktop/tablet
  return sidebarContent;
} 