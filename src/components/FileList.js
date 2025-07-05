import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Tooltip } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";

export default function FileList({ items, onDelete, onOpenFolder, onRestore, isTrash, search }) {
  function renderHighlight(item) {
    if (item._highlight && item._highlight.indexes) {
      const str = item.name;
      const idxs = item._highlight.indexes;
      let last = 0;
      const out = [];
      idxs.forEach((idx, i) => {
        if (idx > last) out.push(<span key={last + '-n'}>{str.slice(last, idx)}</span>);
        out.push(<span key={idx} style={{ background: 'yellow', color: '#000', borderRadius: 2 }}>{str[idx]}</span>);
        last = idx + 1;
      });
      if (last < str.length) out.push(<span key={last + '-end'}>{str.slice(last)}</span>);
      return out;
    }
    return item.name;
  }
  return (
    <Box sx={{ borderRadius: 3, p: 2, minHeight: 300 }}>
      <List>
        {items.length === 0 && (
          <Box sx={{ textAlign: 'center', color: '#aaa', py: 5, fontSize: 20 }}>
            Không tìm thấy file hoặc thư mục nào phù hợp.
          </Box>
        )}
        {items.map(item => (
          <ListItem
            key={item.id}
            button={item.type === "folder" && !isTrash}
            onClick={item.type === "folder" && !isTrash ? () => onOpenFolder(item) : undefined}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: '#f3e5f5', boxShadow: 2 },
              pl: 2
            }}
          >
            <ListItemIcon>
              {item.type === "folder" ? <FolderIcon sx={{ color: '#7b1fa2', fontSize: 32 }} /> : <InsertDriveFileIcon sx={{ color: '#ad1457', fontSize: 30 }} />}
            </ListItemIcon>
            <ListItemText primary={renderHighlight(item)} primaryTypographyProps={{ fontSize: 18, fontWeight: 500 }} />
            {isTrash ? (
              <>
                <Tooltip title="Khôi phục">
                  <IconButton onClick={() => onRestore(item)} sx={{ color: '#43a047' }}>
                    <RestoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa vĩnh viễn">
                  <IconButton onClick={() => onDelete(item)} sx={{ color: '#ad1457' }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <IconButton onClick={() => onDelete(item)} sx={{ color: '#ad1457' }}>
                <DeleteIcon />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 