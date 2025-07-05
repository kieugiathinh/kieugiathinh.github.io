import React from "react";
import { Box, Button, Paper, Typography, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Sidebar({ onNew, usedSize = 0, rootFolders = [], setCurrentFolder, currentFolder, isTrash, setIsTrash }) {
  const total = 1 * 1024 * 1024 * 1024; // 1GB
  return (
    <Box sx={{ width: 300, height: "96vh", m: 2, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: -30 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <img src="/logogt.png" alt="logo" style={{ width: 40, marginRight: 8 }} />
          <span style={{ fontWeight: 'bold', fontSize: 28, color: '#7b1fa2' }}>GT</span>
        </Box>
      </Box>
      <div>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ width: "100%", mb: 3, bgcolor: 'primary.main', color: '#fff', fontWeight: "bold", fontSize: 18, borderRadius: 3, boxShadow: 2, ':hover': { bgcolor: 'primary.dark' } }}
          onClick={() => { setIsTrash(false); onNew(); }}
        >
          Mới
        </Button>
        <Button
          startIcon={<HomeIcon />}
          sx={{ width: "100%", justifyContent: "flex-start", color: 'primary.main', fontWeight: 500, fontSize: 17, borderRadius: 2, mb: 1, pl: 2, ':hover': { bgcolor: 'background.default' }, fontWeight: !isTrash && !currentFolder ? 700 : 500 }}
          onClick={() => { setCurrentFolder(null); setIsTrash(false); }}
        >
          Trang chủ
        </Button>
        {/* Danh sách folder gốc */}
        <List dense sx={{ mb: 1 }}>
          {rootFolders.map(folder => (
            <ListItemButton
              key={folder.id}
              selected={currentFolder === folder.id && !isTrash}
              onClick={() => { setCurrentFolder(folder.id); setIsTrash(false); }}
              sx={{ borderRadius: 2, mb: 0.5, pl: 3, bgcolor: currentFolder === folder.id && !isTrash ? 'background.default' : undefined }}
            >
              <ListItemIcon>
                <FolderIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText primary={folder.name} primaryTypographyProps={{ fontWeight: currentFolder === folder.id && !isTrash ? 700 : 500, color: 'text.primary' }} />
            </ListItemButton>
          ))}
        </List>
        <List dense>
          <ListItemButton
            selected={isTrash}
            onClick={() => { setIsTrash(true); setCurrentFolder(null); }}
            sx={{ borderRadius: 2, pl: 3, bgcolor: isTrash ? 'background.default' : undefined }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ color: 'secondary.main' }} />
            </ListItemIcon>
            <ListItemText primary="Thùng rác" primaryTypographyProps={{ fontWeight: isTrash ? 700 : 500, color: 'text.primary' }} />
          </ListItemButton>
        </List>
        <Divider sx={{ my: 2 }} />
      </div>
      <Box sx={{ fontSize: 15, color: 'text.secondary', mt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Đã sử dụng {formatBytes(usedSize)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'secondary.main' }}>
          trên tổng số 1GB
        </Typography>
      </Box>
    </Box>
  );
} 