import React, { useState } from "react";
import { Menu, MenuItem, Divider, Avatar, Box, Typography } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import LogoutIcon from "@mui/icons-material/Logout";
import ThemeDialog from "./ThemeDialog";

export default function AvatarMenu({ anchorEl, setAnchorEl, user, onAccountInfo, darkMode, setDarkMode, bgColor, setBgColor, selectedTheme, setSelectedTheme }) {
  const open = Boolean(anchorEl);
  const [openTheme, setOpenTheme] = useState(false);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 220, boxShadow: 4, p: 1 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
          <Avatar src={user?.photoURL} sx={{ width: 44, height: 44, mr: 2, border: '2.5px solid #fff', boxShadow: '0 2px 8px 0 rgba(123,31,162,0.10)', background: 'linear-gradient(90deg, #bb86fc 0%, #7b1fa2 100%)', transition: 'border-color 0.3s, box-shadow 0.3s' }} />
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{user?.displayName}</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{user?.email}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem disabled={false} sx={{ gap: 1 }} onClick={() => { handleClose(); onAccountInfo && onAccountInfo(); }}>
          <PersonIcon color="action" /> Thông tin tài khoản
        </MenuItem>
        <MenuItem sx={{ gap: 1 }} onClick={() => { setOpenTheme(true); handleClose(); }}>
          <PaletteIcon color="action" /> Chủ đề
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { signOut(auth); handleClose(); }} sx={{ color: '#ad1457', gap: 1 }}>
          <LogoutIcon /> Đăng xuất
        </MenuItem>
      </Menu>
      <ThemeDialog
        open={openTheme}
        onClose={() => setOpenTheme(false)}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </>
  );
} 