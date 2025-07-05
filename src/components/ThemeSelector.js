import React from "react";
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
  IconButton,
  Tooltip
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PaletteIcon from "@mui/icons-material/Palette";
import { useResponsive } from "../hooks/useResponsive";

// Định nghĩa các bảng màu đẹp
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
  }
];

export default function ThemeSelector({ open, onClose, currentTheme, onThemeChange }) {
  const { isMobile } = useResponsive();

  const handleThemeSelect = (theme) => {
    onThemeChange(theme);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        fontSize: isMobile ? 18 : 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <PaletteIcon sx={{ color: 'primary.main' }} />
        Chọn bảng màu
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Chọn bảng màu yêu thích cho giao diện của bạn
        </Typography>
        
        <Grid container spacing={2}>
          {colorThemes.map((theme, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                elevation={currentTheme?.name === theme.name ? 8 : 2}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: currentTheme?.name === theme.name ? 3 : 1,
                  borderColor: currentTheme?.name === theme.name ? theme.primary : 'transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleThemeSelect(theme)}
              >
                {/* Background preview */}
                <Box
                  sx={{
                    height: 60,
                    background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
                    borderRadius: 1,
                    mb: 1,
                    position: 'relative'
                  }}
                >
                  {/* Primary color bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      right: 8,
                      height: 8,
                      backgroundColor: theme.primary,
                      borderRadius: 1
                    }}
                  />
                  {/* Secondary color bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      height: 6,
                      backgroundColor: theme.secondary,
                      borderRadius: 1
                    }}
                  />
                </Box>
                
                {/* Theme name */}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    textAlign: 'center',
                    color: theme.primary,
                    fontSize: isMobile ? 11 : 12
                  }}
                >
                  {theme.name}
                </Typography>
                
                {/* Selected indicator */}
                {currentTheme?.name === theme.name && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: theme.primary,
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
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
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
} 