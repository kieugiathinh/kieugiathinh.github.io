// Utility functions để tạo theme từ bảng màu
export const createThemeFromPalette = (selectedTheme, darkMode = false) => {
  if (!selectedTheme) {
    // Fallback theme
    selectedTheme = {
      name: "Royal Purple",
      primary: "#7b1fa2",
      secondary: "#ab47bc",
      background: "#f3e5f5",
      paper: "#ffffff"
    };
  }

  return {
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#181a20" : selectedTheme.background,
        paper: darkMode ? "#23272f" : selectedTheme.paper
      },
      primary: { 
        main: darkMode ? "#bb86fc" : selectedTheme.primary,
        light: darkMode ? "#d4a4fc" : `${selectedTheme.primary}20`,
        dark: darkMode ? "#7b1fa2" : selectedTheme.primary,
        contrastText: darkMode ? "#23272f" : "#ffffff"
      },
      secondary: { 
        main: darkMode ? "#03dac6" : selectedTheme.secondary,
        light: darkMode ? "#66d9d1" : `${selectedTheme.secondary}20`,
        dark: darkMode ? "#ad1457" : selectedTheme.secondary,
        contrastText: darkMode ? "#23272f" : "#ffffff"
      },
      success: {
        main: "#43a047",
        light: "#66bb6a",
        dark: "#2e7d32",
        contrastText: "#ffffff"
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#b71c1c",
        contrastText: "#ffffff"
      },
      text: {
        primary: darkMode ? "#ffffff" : "#222222",
        secondary: darkMode ? "#b0b0b0" : "#666666"
      },
      action: {
        active: darkMode ? "#bb86fc" : selectedTheme.primary,
        hover: darkMode ? "#d4a4fc" : `${selectedTheme.primary}10`,
        selected: darkMode ? "#7b1fa2" : `${selectedTheme.primary}20`
      }
    },
    typography: {
      fontFamily: 'Arima, sans-serif',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          },
          containedPrimary: {
            background: darkMode ? "#bb86fc" : selectedTheme.primary,
            color: darkMode ? "#23272f" : "#ffffff",
            '&:hover': {
              background: darkMode ? "#d4a4fc" : selectedTheme.secondary
            }
          },
          containedSecondary: {
            background: darkMode ? "#03dac6" : selectedTheme.secondary,
            color: darkMode ? "#23272f" : "#ffffff",
            '&:hover': {
              background: darkMode ? "#66d9d1" : selectedTheme.primary
            }
          },
          outlinedPrimary: {
            borderColor: darkMode ? "#bb86fc" : selectedTheme.primary,
            color: darkMode ? "#bb86fc" : selectedTheme.primary,
            '&:hover': {
              borderColor: darkMode ? "#d4a4fc" : selectedTheme.secondary,
              background: darkMode ? "#2d2f3a" : `${selectedTheme.primary}10`
            }
          },
          outlinedSecondary: {
            borderColor: darkMode ? "#03dac6" : selectedTheme.secondary,
            color: darkMode ? "#03dac6" : selectedTheme.secondary,
            '&:hover': {
              borderColor: darkMode ? "#66d9d1" : selectedTheme.primary,
              background: darkMode ? "#2d2f3a" : `${selectedTheme.secondary}10`
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: darkMode ? "#bb86fc" : selectedTheme.primary,
            '&:hover': {
              background: darkMode ? "#2d2f3a" : `${selectedTheme.primary}10`,
              color: darkMode ? "#03dac6" : selectedTheme.secondary
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }
        }
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            background: `linear-gradient(90deg, ${darkMode ? "#bb86fc" : selectedTheme.primary} 0%, ${darkMode ? "#7b1fa2" : selectedTheme.secondary} 100%)`,
            border: '2.5px solid #fff',
            boxShadow: `0 2px 8px 0 ${darkMode ? "rgba(187,134,252,0.10)" : "rgba(123,31,162,0.10)"}`,
            transition: 'border-color 0.3s, box-shadow 0.3s'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-colorPrimary': {
              background: darkMode ? "#bb86fc" : selectedTheme.primary,
              color: darkMode ? "#23272f" : "#ffffff"
            },
            '&.MuiChip-colorSecondary': {
              background: darkMode ? "#03dac6" : selectedTheme.secondary,
              color: darkMode ? "#23272f" : "#ffffff"
            }
          }
        }
      }
    }
  };
};

// Helper function để lấy màu từ theme
export const getThemeColor = (theme, colorType = 'primary') => {
  if (!theme) return '#7b1fa2';
  
  switch (colorType) {
    case 'primary':
      return theme.palette.primary.main;
    case 'secondary':
      return theme.palette.secondary.main;
    case 'primaryLight':
      return theme.palette.primary.light;
    case 'secondaryLight':
      return theme.palette.secondary.light;
    case 'background':
      return theme.palette.background.default;
    case 'paper':
      return theme.palette.background.paper;
    default:
      return theme.palette.primary.main;
  }
};

// Helper function để tạo gradient
export const createGradient = (theme, direction = '90deg') => {
  const primary = getThemeColor(theme, 'primary');
  const secondary = getThemeColor(theme, 'secondary');
  return `linear-gradient(${direction}, ${primary} 0%, ${secondary} 100%)`;
}; 