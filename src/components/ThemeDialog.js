import React from "react";
import { Dialog, DialogTitle, DialogContent, FormControlLabel, Switch, Box, Typography, Stack, Button } from "@mui/material";

const COLORS = [
  { name: "Tím nhạt", value: "#f3e5f5" },
  { name: "Hồng nhạt", value: "#fce4ec" },
  { name: "Xanh nhạt", value: "#e3f2fd" },
  { name: "Vàng nhạt", value: "#fffde7" },
  { name: "Trắng", value: "#fff" },
  { name: "Xám", value: "#ececec" }
];

export default function ThemeDialog({ open, onClose, darkMode, setDarkMode, bgColor, setBgColor }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Chủ đề giao diện</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} color="primary" />}
          label="Chế độ ban đêm (Dark mode)"
        />
        <Typography sx={{ mt: 2, mb: 1, fontWeight: 500 }}>Đổi màu nền:</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {COLORS.map(c => (
            <Button
              key={c.value}
              variant={bgColor === c.value ? "contained" : "outlined"}
              onClick={() => setBgColor(c.value)}
              sx={{ bgcolor: c.value, color: '#333', minWidth: 80, borderRadius: 2, border: bgColor === c.value ? '2px solid #7b1fa2' : undefined }}
            >
              {c.name}
            </Button>
          ))}
        </Stack>
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" onClick={onClose} sx={{ bgcolor: '#7b1fa2', color: '#fff' }}>Đóng</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 