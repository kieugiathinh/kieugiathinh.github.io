import React from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { useResponsive } from "../hooks/useResponsive";

export default function ThemeInfo({ currentTheme, onThemeClick }) {
  const { isMobile } = useResponsive();

  if (!currentTheme) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: isMobile ? 1.5 : 2,
        mb: 2,
        background: `linear-gradient(135deg, ${currentTheme.primary}10, ${currentTheme.secondary}10)`,
        border: '1px solid',
        borderColor: `${currentTheme.primary}20`,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}15)`
        }
      }}
      onClick={onThemeClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <PaletteIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600}
            sx={{ 
              color: currentTheme.primary,
              fontSize: isMobile ? 14 : 16
            }}
          >
            Bảng màu hiện tại
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: isMobile ? 12 : 14 }}
          >
            {currentTheme.name}
          </Typography>
        </Box>
        
        <Chip
          label="Thay đổi"
          size="small"
          sx={{
            bgcolor: currentTheme.primary,
            color: 'white',
            fontSize: isMobile ? 10 : 12,
            '&:hover': {
              bgcolor: currentTheme.secondary
            }
          }}
        />
      </Box>
    </Paper>
  );
} 