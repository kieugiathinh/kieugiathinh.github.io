import React, { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme, Button, Stack, Typography, IconButton, useTheme, useMediaQuery, CircularProgress, Alert } from "@mui/material";
import { createThemeFromPalette } from "../utils/themeUtils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase/config";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import JSZip from 'jszip';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FileList from "../components/FileList";
import UploadDialog from "../components/UploadDialog";
import DownloadDialog from "../components/DownloadDialog";
import ThemeSelector from "../components/ThemeSelector";
import ThemeInfo from "../components/ThemeInfo";
import Login from "./Login";
import AccountInfo from "./AccountInfo";
import fuzzysort from 'fuzzysort';
import { useResponsive } from "../hooks/useResponsive";

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentFolderName, setCurrentFolderName] = useState("");
  const [parentFolder, setParentFolder] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [bgColor, setBgColor] = useState("#f3e5f5");
  const [usedSize, setUsedSize] = useState(0);
  const [rootFolders, setRootFolders] = useState([]);
  const [isTrash, setIsTrash] = useState(false);
  const [trashItems, setTrashItems] = useState([]);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState("");
  const [downloadDialog, setDownloadDialog] = useState({
    open: false,
    item: null,
    filesInFolder: [],
    loading: false
  });
  const [themeDialog, setThemeDialog] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved ? JSON.parse(saved) : {
      name: "Ocean Blue",
      primary: "#1976d2",
      secondary: "#42a5f5",
      background: "#e3f2fd",
      paper: "#ffffff"
    };
  });
  const { isMobile, isTablet } = useResponsive();

  // Lưu darkMode vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Lưu selectedTheme vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('selectedTheme', JSON.stringify(selectedTheme));
  }, [selectedTheme]);

  // Lấy thông tin folder hiện tại để biết folder cha
  useEffect(() => {
    if (!user || !currentFolder) {
      setParentFolder(null);
      setCurrentFolderName("");
      return;
    }
    const fetchParent = async () => {
      const docSnap = await getDoc(doc(db, "files", currentFolder));
      if (docSnap.exists()) {
        setParentFolder(docSnap.data().parent || null);
        setCurrentFolderName(docSnap.data().name || "");
      }
    };
    fetchParent();
  }, [user, currentFolder]);

  // Lấy danh sách folder gốc
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "files"), where("owner", "==", user.uid), where("parent", "==", null), where("type", "==", "folder"), where("isDeleted", "!=", true));
    const unsub = onSnapshot(q, (snap) => {
      setRootFolders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // Lấy file/folder trong thùng rác
  useEffect(() => {
    if (!user) return;
    if (!isTrash) return;
    const q = query(collection(db, "files"), where("owner", "==", user.uid), where("isDeleted", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setTrashItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user, isTrash]);

  // Tính tổng dung lượng các file (dựa vào trường size trong Firestore)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "files"), where("owner", "==", user.uid), where("type", "==", "file"), where("isDeleted", "!=", true));
    const unsub = onSnapshot(q, (snap) => {
      let total = 0;
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.size) total += data.size;
      }
      setUsedSize(total);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || isTrash) return;
    const q = query(
      collection(db, "files"),
      where("parent", "==", currentFolder || null),
      where("owner", "==", user.uid),
      where("isDeleted", "!=", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user, currentFolder, isTrash]);

  // Xóa mềm (chuyển vào thùng rác)
  const handleSoftDelete = async (item) => {
    await updateDoc(doc(db, "files", item.id), { isDeleted: true });
  };

  // Xóa vĩnh viễn
  const handlePermanentDelete = async (item) => {
    if (item.type === "file") {
      const storageRef = ref(storage, `${user.uid}/${item.name}`);
      await deleteObject(storageRef);
    }
    await deleteDoc(doc(db, "files", item.id));
  };

  // Khôi phục
  const handleRestore = async (item) => {
    await updateDoc(doc(db, "files", item.id), { isDeleted: false });
  };

  // Upload file: lưu thêm trường size
  const handleUpload = async (file) => {
    const storageRef = ref(storage, `${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, "files"), {
      name: file.name,
      type: "file",
      url,
      owner: user.uid,
      parent: currentFolder || null,
      createdAt: new Date(),
      isDeleted: false,
      size: file.size
    });
  };

  const handleCreateFolder = async (name) => {
    await addDoc(collection(db, "files"), {
      name,
      type: "folder",
      owner: user.uid,
      parent: currentFolder || null,
      createdAt: new Date(),
      isDeleted: false
    });
  };

  // Hàm lấy tất cả file trong folder (đệ quy)
  const getAllFilesInFolder = async (folderId, folderPath = "") => {
    const files = [];
    const q = query(
      collection(db, "files"),
      where("parent", "==", folderId),
      where("owner", "==", user.uid),
      where("isDeleted", "!=", true)
    );
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      const item = { id: docSnap.id, ...docSnap.data() };
      const currentPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      
      if (item.type === "file") {
        files.push({
          ...item,
          path: currentPath
        });
      } else if (item.type === "folder") {
        const subFiles = await getAllFilesInFolder(item.id, currentPath);
        files.push(...subFiles);
      }
    }
    
    return files;
  };

  // Hàm download file đơn lẻ
  const downloadSingleFile = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      setDownloadError('Không thể tải file. Vui lòng thử lại.');
    }
  };

  // Hàm download folder (nén thành zip)
  const downloadFolder = async (folder) => {
    try {
      setDownloading(true);
      setDownloadProgress(0);
      setDownloadError("");
      
      const zip = new JSZip();
      const files = await getAllFilesInFolder(folder.id);
      
      if (files.length === 0) {
        setDownloadError('Thư mục trống, không có gì để tải xuống.');
        setDownloading(false);
        return;
      }
      
      let completedFiles = 0;
      
      for (const file of files) {
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(file.path, blob);
          
          completedFiles++;
          setDownloadProgress((completedFiles / files.length) * 100);
        } catch (error) {
          console.error(`Lỗi khi tải file ${file.name}:`, error);
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloading(false);
      setDownloadProgress(0);
    } catch (error) {
      console.error('Lỗi khi tải folder:', error);
      setDownloadError('Không thể tải thư mục. Vui lòng thử lại.');
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Hàm xử lý download chung
  const handleDownload = async (item) => {
    if (item.type === "file") {
      // Với file, download trực tiếp
      await downloadSingleFile(item);
    } else if (item.type === "folder") {
      // Với folder, hiển thị dialog trước
      setDownloadDialog({
        open: true,
        item: item,
        filesInFolder: [],
        loading: true
      });
      
      // Lấy danh sách file trong folder
      try {
        const files = await getAllFilesInFolder(item.id);
        setDownloadDialog(prev => ({
          ...prev,
          filesInFolder: files,
          loading: false
        }));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách file:', error);
        setDownloadDialog(prev => ({
          ...prev,
          loading: false
        }));
      }
    }
  };

  // Hàm xác nhận download từ dialog
  const handleConfirmDownload = async () => {
    if (downloadDialog.item) {
      setDownloadDialog({ open: false, item: null, filesInFolder: [], loading: false });
      if (downloadDialog.item.type === "folder") {
        await downloadFolder(downloadDialog.item);
      }
    }
  };

  // Hàm đóng dialog download
  const handleCloseDownloadDialog = () => {
    setDownloadDialog({ open: false, item: null, filesInFolder: [], loading: false });
  };

  // Hàm xử lý thay đổi theme
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
  };

  // Hàm mở dialog chọn theme
  const handleThemeClick = () => {
    setThemeDialog(true);
  };

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Login />;

  const theme = createTheme(createThemeFromPalette(selectedTheme, darkMode));

  if (showAccount) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AccountInfo onBack={() => setShowAccount(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: 'background.default' }}>
        <Sidebar
          onNew={() => setOpenDialog(true)}
          usedSize={usedSize}
          rootFolders={rootFolders}
          setCurrentFolder={setCurrentFolder}
          currentFolder={currentFolder}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          p: isMobile ? 1 : 2,
          width: '100%'
        }}>
          <Header
            onSearch={value => setSearch(value)}
            onAccountInfo={() => setShowAccount(true)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            bgColor={bgColor}
            setBgColor={setBgColor}
            onMenuClick={() => setSidebarOpen(true)}
            onThemeClick={handleThemeClick}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
          <Box sx={{ 
            flex: 1, 
            borderRadius: 3, 
            p: isMobile ? 1 : 2, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            minHeight: isMobile ? 300 : 400 
          }}>
            {/* Hiển thị thông báo lỗi download */}
            {downloadError && (
              <Alert 
                severity="error" 
                onClose={() => setDownloadError("")}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {downloadError}
              </Alert>
            )}
            
            {/* Hiển thị progress download */}
            {downloading && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2, 
                p: 2, 
                bgcolor: 'primary.light', 
                borderRadius: 2,
                color: 'white'
              }}>
                <CircularProgress size={24} color="inherit" />
                <Typography>
                  Đang tải xuống... {Math.round(downloadProgress)}%
                </Typography>
              </Box>
            )}
            
            {/* Hiển thị thông tin bảng màu */}
            {/* Đã bỏ ThemeInfo theo yêu cầu */}
            
            {isTrash ? (
              <>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  color="primary" 
                  mb={2}
                  sx={{ fontSize: isMobile ? 18 : 24 }}
                >
                  Thùng rác
                </Typography>
                <FileList
                  items={trashItems}
                  onDelete={handlePermanentDelete}
                  onRestore={handleRestore}
                  isTrash={true}
                />
              </>
            ) : (
              <>
                <Stack 
                  direction={isMobile ? "column" : "row"} 
                  alignItems={isMobile ? "stretch" : "center"} 
                  justifyContent="space-between" 
                  mb={2}
                  spacing={isMobile ? 1 : 0}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {currentFolder && (
                      <Button 
                        startIcon={<ArrowBackIcon />} 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => setCurrentFolder(parentFolder)}
                        sx={{ 
                          fontSize: isMobile ? 12 : 14,
                          py: isMobile ? 0.5 : 1
                        }}
                      >
                        Quay về
                      </Button>
                    )}
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color="primary"
                      sx={{ fontSize: isMobile ? 16 : 20 }}
                    >
                      {currentFolder ? currentFolderName : "Trang chủ"}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    color="secondary"
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: 2,
                      fontSize: isMobile ? 12 : 14,
                      py: isMobile ? 0.5 : 1
                    }}
                  >
                    Tải lên
                  </Button>
                </Stack>
                <FileList
                  items={search ? fuzzysort.go(search, items, { key: 'name', allowTypo: true, threshold: -10000 }).map(r => ({ ...r.obj, _highlight: r })) : items.map(i => ({ ...i, _highlight: null }))}
                  onDelete={handleSoftDelete}
                  onOpenFolder={folder => setCurrentFolder(folder.id)}
                  onDownload={handleDownload}
                  search={search}
                />
              </>
            )}
          </Box>
        </Box>
        <UploadDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onUpload={handleUpload}
          onCreateFolder={handleCreateFolder}
          currentFolderName={currentFolder ? currentFolderName : "Trang chủ"}
        />
        
        {/* Download Dialog */}
        <DownloadDialog
          open={downloadDialog.open}
          onClose={handleCloseDownloadDialog}
          onConfirm={handleConfirmDownload}
          item={downloadDialog.item}
          filesInFolder={downloadDialog.filesInFolder}
          loading={downloadDialog.loading}
        />
        
        {/* Theme Selector Dialog */}
        <ThemeSelector
          open={themeDialog}
          onClose={() => setThemeDialog(false)}
          currentTheme={selectedTheme}
          onThemeChange={handleThemeChange}
        />
      </Box>
      <Box sx={{ position: 'fixed', bottom: 10, right: 20, zIndex: 9999 }}></Box>
    </ThemeProvider>
  );
} 