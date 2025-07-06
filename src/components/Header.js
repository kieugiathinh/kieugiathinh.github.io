import React from "react";
import { Avatar, Box, InputBase, IconButton, Paper, useTheme, useMediaQuery, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import PaletteIcon from "@mui/icons-material/Palette";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import AvatarMenu from "./AvatarMenu";
import { useResponsive } from "../hooks/useResponsive";
import { createGradient } from "../utils/themeUtils";

export default function Header({ onSearch, onAccountInfo, darkMode, setDarkMode, bgColor, setBgColor, onMenuClick, onThemeClick, selectedTheme, setSelectedTheme }) {
  const [user] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ 
      display: "flex", 
      alignItems: "center", 
      p: isMobile ? 1.5 : 2, 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      mb: 2 
    }}>
      {isMobile && (
        <IconButton 
          onClick={onMenuClick}
          sx={{ mr: 1, color: 'primary.main' }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Paper
        component="form"
        sx={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          bgcolor: 'background.default', 
          borderRadius: 2, 
          px: isMobile ? 1.5 : 2, 
          boxShadow: 0 
        }}
      >
        <SearchIcon sx={{ color: 'secondary.main', fontSize: isMobile ? 20 : 24 }} />
        <InputBase
          placeholder="Tìm kiếm thư mục"
          sx={{ 
            ml: 1, 
            flex: 1, 
            fontSize: isMobile ? 14 : 18, 
            color: 'text.primary' 
          }}
          onChange={e => onSearch && onSearch(e.target.value)}
        />
      </Paper>
      <Box sx={{ ml: isMobile ? 1.5 : 3 }}>
        {user && (
          <>
            <IconButton 
              onClick={e => setAnchorEl(e.currentTarget)} 
              sx={{ 
                p: 0, 
                border: '2.5px solid', 
                borderColor: 'transparent', 
                boxShadow: 2, 
                background: (theme) => createGradient(theme, '90deg'), 
                transition: 'border-color 0.3s, box-shadow 0.3s' 
              }}
            >
              <Avatar 
                src={user.photoURL} 
                sx={{ 
                  width: isMobile ? 40 : 48, 
                  height: isMobile ? 40 : 48, 
                  border: '2.5px solid #fff', 
                  boxShadow: (theme) => `0 2px 8px 0 ${theme.palette.primary.main}20`, 
                  background: (theme) => createGradient(theme, '90deg'), 
                  transition: 'border-color 0.3s, box-shadow 0.3s' 
                }} 
              />
            </IconButton>
            <AvatarMenu
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
              user={user}
              onAccountInfo={onAccountInfo}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              bgColor={bgColor}
              setBgColor={setBgColor}
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
            />
          </>
        )}
      </Box>
    </Paper>
  );
} 