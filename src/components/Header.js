import React from "react";
import { Avatar, Box, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import AvatarMenu from "./AvatarMenu";

export default function Header({ onSearch, onAccountInfo, darkMode, setDarkMode, bgColor, setBgColor }) {
  const [user] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <Paper elevation={3} sx={{ display: "flex", alignItems: "center", p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Paper
        component="form"
        sx={{ flex: 1, display: "flex", alignItems: "center", bgcolor: 'background.default', borderRadius: 2, px: 2, boxShadow: 0 }}
      >
        <SearchIcon sx={{ color: 'secondary.main' }} />
        <InputBase
          placeholder="Tìm kiếm thư mục"
          sx={{ ml: 1, flex: 1, fontSize: 18, color: 'text.primary' }}
          onChange={e => onSearch && onSearch(e.target.value)}
        />
      </Paper>
      <Box sx={{ ml: 3 }}>
        {user && (
          <>
            <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0, border: '2.5px solid', borderColor: 'transparent', boxShadow: 2, background: 'linear-gradient(90deg, #bb86fc 0%, #7b1fa2 100%)', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
              <Avatar src={user.photoURL} sx={{ width: 48, height: 48, border: '2.5px solid #fff', boxShadow: '0 2px 8px 0 rgba(123,31,162,0.10)', background: 'linear-gradient(90deg, #bb86fc 0%, #7b1fa2 100%)', transition: 'border-color 0.3s, box-shadow 0.3s' }} />
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
            />
          </>
        )}
      </Box>
    </Paper>
  );
} 