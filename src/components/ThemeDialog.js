import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Switch,
  Stack
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PaletteIcon from "@mui/icons-material/Palette";

const colorThemes = [
  {
    name: "Ocean Blue",
    primary: "#1976d2",
    secondary: "#42a5f5",
    background: "#e3f2fd",
    paper: "#ffffff"
  },
  {
    name: "Forest Green",
    primary: "#2e7d32",
    secondary: "#4caf50",
    background: "#e8f5e8",
    paper: "#ffffff"
  },
  {
    name: "Sunset Orange",
    primary: "#f57c00",
    secondary: "#ff9800",
    background: "#fff3e0",
    paper: "#ffffff"
  },
  {
    name: "Royal Purple",
    primary: "#7b1fa2",
    secondary: "#ab47bc",
    background: "#f3e5f5",
    paper: "#ffffff"
  },
  {
    name: "Coral Pink",
    primary: "#e91e63",
    secondary: "#f06292",
    background: "#fce4ec",
    paper: "#ffffff"
  },
  {
    name: "Teal Blue",
    primary: "#00695c",
    secondary: "#26a69a",
    background: "#e0f2f1",
    paper: "#ffffff"
  },
  {
    name: "Amber Gold",
    primary: "#f57f17",
    secondary: "#ffb300",
    background: "#fff8e1",
    paper: "#ffffff"
  },
  {
    name: "Indigo Night",
    primary: "#3f51b5",
    secondary: "#7986cb",
    background: "#e8eaf6",
    paper: "#ffffff"
  },
  {
    name: "Rose Red",
    primary: "#c2185b",
    secondary: "#ec407a",
    background: "#fce4ec",
    paper: "#ffffff"
  },
  {
    name: "Emerald Green",
    primary: "#388e3c",
    secondary: "#66bb6a",
    background: "#e8f5e8",
    paper: "#ffffff"
  },
  {
    name: "Deep Blue",
    primary: "#1565c0",
    secondary: "#42a5f5",
    background: "#e3f2fd",
    paper: "#ffffff"
  },
  {
    name: "Warm Brown",
    primary: "#8d6e63",
    secondary: "#a1887f",
    background: "#efebe9",
    paper: "#ffffff"
  },
  {
    name: "Lavender",
    primary: "#9c27b0",
    secondary: "#ba68c8",
    background: "#f3e5f5",
    paper: "#ffffff"
  },
  {
    name: "Mint Green",
    primary: "#4caf50",
    secondary: "#81c784",
    background: "#e8f5e8",
    paper: "#ffffff"
  },
  {
    name: "Sky Blue",
    primary: "#03a9f4",
    secondary: "#4fc3f7",
    background: "#e1f5fe",
    paper: "#ffffff"
  },
  {
    name: "Peach",
    primary: "#ff7043",
    secondary: "#ffab91",
    background: "#fbe9e7",
    paper: "#ffffff"
  }
];

export default function ThemeDialog({ open, onClose, selectedTheme, setSelectedTheme, darkMode, setDarkMode }) {
  const fallbackTheme = colorThemes[0];
  const safeSelectedTheme = selectedTheme && selectedTheme.name ? selectedTheme : fallbackTheme;
  const [localTheme, setLocalTheme] = useState(safeSelectedTheme);
  const [previewDark, setPreviewDark] = useState(darkMode);

  // Khi chọn theme, preview trực tiếp
  const handleThemeSelect = (theme) => {
    setLocalTheme(theme);
  };

  // Khi xác nhận, cập nhật theme thực tế
  const handleApply = () => {
    setSelectedTheme(localTheme);
    setDarkMode(previewDark);
    onClose();
  };

  useEffect(() => {
    setLocalTheme(selectedTheme && selectedTheme.name ? selectedTheme : fallbackTheme);
  }, [selectedTheme, open]);

  useEffect(() => {
    setPreviewDark(darkMode);
  }, [darkMode, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <PaletteIcon color="primary" /> Tuỳ chỉnh chủ đề giao diện
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Typography fontWeight={600}>Chế độ:</Typography>
          <Switch
            checked={previewDark}
            onChange={e => setPreviewDark(e.target.checked)}
            color="primary"
          />
          <Typography>{previewDark ? "Dark mode" : "Light mode"}</Typography>
        </Stack>
        
        <Typography fontWeight={600} mb={2}>Chọn bảng màu:</Typography>
        <Box sx={{ width: '100%', pb: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // mobile: 2 cột
                sm: 'repeat(4, 1fr)', // tablet: 4 cột
                md: 'repeat(8, 1fr)'  // desktop: 8 cột
              },
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 2,
              width: '100%',
              maxWidth: 900,
              mx: 'auto',
              minHeight: 220
            }}
          >
            {colorThemes.map((theme, idx) => (
              <Paper
                key={theme.name}
                elevation={localTheme && localTheme.name === theme.name ? 8 : 2}
                sx={{
                  aspectRatio: '1.1/1',
                  minHeight: 90,
                  maxHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: localTheme && localTheme.name === theme.name ? `3px solid ${theme.primary}` : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                    borderColor: theme.primary
                  }
                }}
                onClick={() => handleThemeSelect(theme)}
              >
                {/* Color preview bars */}
                <Box sx={{ width: '80%', mb: 1 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                      borderRadius: 4,
                      mb: 0.5
                    }}
                  />
                  <Box
                    sx={{
                      width: '70%',
                      height: 6,
                      background: theme.secondary,
                      borderRadius: 3
                    }}
                  />
                </Box>
                {/* Theme name */}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: theme.primary,
                    fontSize: 11,
                    textAlign: 'center',
                    lineHeight: 1.1
                  }}
                >
                  {theme.name}
                </Typography>
                {/* Selected indicator */}
                {localTheme && localTheme.name === theme.name && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                  >
                    <CheckIcon sx={{ color: 'white', fontSize: 14 }} />
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
        
        {/* Preview section */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: previewDark ? '#23272f' : localTheme.background,
            color: previewDark ? '#fff' : '#222',
            border: '2px solid',
            borderColor: localTheme.primary,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <Typography fontWeight={700} fontSize={20} color={localTheme.primary} mb={2}>
            Preview - {localTheme.name}
          </Typography>
          <Typography fontSize={16} sx={{ opacity: 0.8 }}>
            Chế độ: <b>{previewDark ? 'Dark' : 'Light'}</b><br/>
            Màu chính: <b>{localTheme.primary}</b><br/>
            Màu phụ: <b>{localTheme.secondary}</b>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
          Huỷ
        </Button>
        <Button 
          onClick={handleApply} 
          variant="contained" 
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            fontWeight: 600,
            background: `linear-gradient(135deg, ${localTheme.primary}, ${localTheme.secondary})`
          }}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
} 