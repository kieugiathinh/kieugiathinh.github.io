import React, { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme, Button, Stack, Typography, IconButton, useTheme, useMediaQuery, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { createThemeFromPalette } from "../utils/themeUtils";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import EmailIcon from "@mui/icons-material/Email";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase/config";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { sendEmailVerification, signOut } from "firebase/auth";
import JSZip from 'jszip';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FileList from "../components/FileList";
import UploadDialog from "../components/UploadDialog";
import DownloadDialog from "../components/DownloadDialog";
import ViewDialog from "../components/ViewDialog";
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
  const [viewDialog, setViewDialog] = useState({
    open: false,
    item: null
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
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const [selectedItems, setSelectedItems] = useState([]);

  // Lưu darkMode vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Lưu selectedTheme vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('selectedTheme', JSON.stringify(selectedTheme));
  }, [selectedTheme]);

  // Kiểm tra trạng thái xác thực email khi user đăng nhập
  useEffect(() => {
    if (user && !user.emailVerified && user.providerData[0]?.providerId === 'password') {
      setShowEmailVerification(true);
    }
  }, [user]);

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
    const q = query(collection(db, "files"), where("owner", "==", user.uid), where("parent", "==", null), where("type", "==", "folder"), where("isDeleted", "in", [false, null]));
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
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Thùng rác có ${items.length} item`);
      setTrashItems(items);
    });
    return () => unsub();
  }, [user, isTrash]);

  // Tính tổng dung lượng các file (dựa vào trường size trong Firestore)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "files"), where("owner", "==", user.uid), where("type", "==", "file"), where("isDeleted", "in", [false, null]));
    const unsub = onSnapshot(q, (snap) => {
      let total = 0;
      console.log(`Tính toán dung lượng cho ${snap.docs.length} file`);
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.size && typeof data.size === 'number' && data.size > 0) {
          total += data.size;
          console.log(`File: ${data.name}, Size: ${data.size}, Total so far: ${total}`);
        } else {
          console.warn(`File ${data.name} có size không hợp lệ:`, data.size);
        }
      }
      console.log(`Tổng dung lượng cuối cùng: ${total}`);
      setUsedSize(total);
      
      // Thêm một số thông tin debug
      if (total > 0) {
        console.log(`Dung lượng đã sử dụng: ${formatBytes(total)}`);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || isTrash) return;
    const q = query(
      collection(db, "files"),
      where("parent", "==", currentFolder || null),
      where("owner", "==", user.uid),
      where("isDeleted", "in", [false, null])
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Thư mục hiện tại có ${items.length} item`);
      setItems(items);
    });
    return () => unsub();
  }, [user, currentFolder, isTrash]);

  // Xóa mềm (chuyển vào thùng rác)
  const handleSoftDelete = async (item) => {
    // Nếu là file, chỉ cần đánh dấu xóa
    if (item.type === "file") {
      await updateDoc(doc(db, "files", item.id), { isDeleted: true });
      return;
    }
    // Nếu là folder, đánh dấu xóa đệ quy tất cả file/folder con
    const markDeletedRecursive = async (folderId) => {
      // Đánh dấu xóa folder hiện tại
      await updateDoc(doc(db, "files", folderId), { isDeleted: true });
      // Lấy tất cả file/folder con trực tiếp
      const q = query(
        collection(db, "files"),
        where("parent", "==", folderId),
        where("owner", "==", user.uid),
        // Không cần check isDeleted, vì có thể xóa lại folder đã khôi phục
      );
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        const child = { id: docSnap.id, ...docSnap.data() };
        if (child.type === "file") {
          await updateDoc(doc(db, "files", child.id), { isDeleted: true });
        } else if (child.type === "folder") {
          await markDeletedRecursive(child.id);
        }
      }
    };
    await markDeletedRecursive(item.id);
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
    try {
      // Validate file size
      if (!file.size || typeof file.size !== 'number' || file.size <= 0) {
        throw new Error(`File ${file.name} có kích thước không hợp lệ: ${file.size}`);
      }
      
      console.log(`Bắt đầu upload file: ${file.name}, size: ${file.size}`);
      const storageRef = ref(storage, `${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const docRef = await addDoc(collection(db, "files"), {
        name: file.name,
        type: "file",
        url,
        owner: user.uid,
        parent: currentFolder || null,
        createdAt: new Date(),
        isDeleted: false,
        size: file.size
      });
      console.log(`Upload thành công file: ${file.name}, docId: ${docRef.id}`);
    } catch (error) {
      console.error(`Lỗi khi upload file ${file.name}:`, error);
      throw error;
    }
  };

  const handleCreateFolder = async (name) => {
    // Kiểm tra trùng tên folder trong cùng parent
    const q = query(
      collection(db, "files"),
      where("owner", "==", user.uid),
      where("parent", "==", currentFolder || null),
      where("type", "==", "folder"),
      where("isDeleted", "in", [false, null]),
      where("name", "==", name)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Đã có folder trùng tên
      return false;
    }
    await addDoc(collection(db, "files"), {
      name,
      type: "folder",
      owner: user.uid,
      parent: currentFolder || null,
      createdAt: new Date(),
      isDeleted: false
    });
    return true;
  };

  // Hàm lấy tất cả file trong folder (đệ quy)
  const getAllFilesInFolder = async (folderId, folderPath = "") => {
    const files = [];
    const q = query(
      collection(db, "files"),
      where("parent", "==", folderId),
      where("owner", "==", user.uid),
      where("isDeleted", "in", [false, null])
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

  const handleViewFile = (item) => {
    setViewDialog({ open: true, item: item });
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, item: null });
  };

  // Hàm xử lý thay đổi theme
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
  };

  // Hàm mở dialog chọn theme
  const handleThemeClick = () => {
    setThemeDialog(true);
  };

  const handleResendVerificationEmail = async () => {
    setEmailVerificationLoading(true);
    setEmailVerificationMessage("");
    try {
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: false
      });
      setEmailVerificationMessage("Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.");
    } catch (error) {
      setEmailVerificationMessage("Không thể gửi email xác thực: " + error.message);
    }
    setEmailVerificationLoading(false);
  };

  const handleCloseEmailVerification = () => {
    setShowEmailVerification(false);
    setEmailVerificationMessage("");
  };

  // Thêm hàm xử lý chọn/bỏ chọn item
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  // Chọn tất cả
  const handleSelectAll = (allIds) => {
    setSelectedItems(allIds);
  };
  // Bỏ chọn tất cả
  const handleDeselectAll = () => {
    setSelectedItems([]);
  };
  // Xóa hàng loạt
  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      const item = items.find(i => i.id === id);
      if (item) await handleSoftDelete(item);
    }
    setSelectedItems([]);
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
            borderRadius: 2, 
            p: isMobile ? 1 : 2, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            minHeight: isMobile ? 300 : 400,
            height: isMobile ? '100vh' : '96vh',
            overflowY: 'auto' 
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
                {/* Nút xóa vĩnh viễn và khôi phục hàng loạt */}
                {selectedItems.length > 0 && (
                  <Stack direction="row" spacing={2} mb={2}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<RestoreIcon />}
                      sx={{ fontWeight: 600, borderRadius: 2, fontSize: isMobile ? 12 : 14, py: isMobile ? 0.5 : 1 }}
                      onClick={async () => {
                        for (const id of selectedItems) {
                          const item = trashItems.find(i => i.id === id);
                          if (item) await handleRestore(item);
                        }
                        setSelectedItems([]);
                      }}
                    >
                      Khôi phục đã chọn ({selectedItems.length})
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ fontWeight: 600, borderRadius: 2, fontSize: isMobile ? 12 : 14, py: isMobile ? 0.5 : 1 }}
                      onClick={async () => {
                        for (const id of selectedItems) {
                          const item = trashItems.find(i => i.id === id);
                          if (item) await handlePermanentDelete(item);
                        }
                        setSelectedItems([]);
                      }}
                    >
                      Xóa vĩnh viễn đã chọn ({selectedItems.length})
                    </Button>
                  </Stack>
                )}
                <FileList
                  items={trashItems}
                  onDelete={handlePermanentDelete}
                  onRestore={handleRestore}
                  onView={handleViewFile}
                  isTrash={true}
                  selectedItems={selectedItems}
                  onSelectItem={handleSelectItem}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
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
                {/* Nút xóa hàng loạt */}
                {selectedItems.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{ ml: 2, fontWeight: 600, borderRadius: 2, fontSize: isMobile ? 12 : 14, py: isMobile ? 0.5 : 1 }}
                    onClick={handleBulkDelete}
                  >
                    Xóa đã chọn ({selectedItems.length})
                  </Button>
                )}
                <FileList
                  items={search ? fuzzysort.go(search, items, { key: 'name', allowTypo: true, threshold: -10000 }).map(r => ({ ...r.obj, _highlight: r })) : items.map(i => ({ ...i, _highlight: null }))}
                  onDelete={handleSoftDelete}
                  onOpenFolder={folder => setCurrentFolder(folder.id)}
                  onDownload={handleDownload}
                  onView={handleViewFile}
                  search={search}
                  selectedItems={selectedItems}
                  onSelectItem={handleSelectItem}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
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
        
        {/* View Dialog */}
        <ViewDialog
          open={viewDialog.open}
          onClose={handleCloseViewDialog}
          item={viewDialog.item}
        />
        
        {/* Theme Selector Dialog */}
        <ThemeSelector
          open={themeDialog}
          onClose={() => setThemeDialog(false)}
          currentTheme={selectedTheme}
          onThemeChange={handleThemeChange}
        />

        {/* Email Verification Dialog */}
        <Dialog 
          open={showEmailVerification} 
          onClose={handleCloseEmailVerification}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'primary.main'
          }}>
            <EmailIcon />
            Xác thực Email
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Email của bạn <strong>{user?.email}</strong> chưa được xác thực.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để sử dụng đầy đủ tính năng của GTCloud.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Không nhận được email? Kiểm tra thư mục spam hoặc nhấn nút "Gửi lại" bên dưới.
            </Typography>
            {emailVerificationMessage && (
              <Alert 
                severity={emailVerificationMessage.includes('thành công') ? 'success' : 'error'} 
                sx={{ mb: 2 }}
              >
                {emailVerificationMessage}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseEmailVerification}
              variant="outlined"
            >
              Đóng
            </Button>
            <Button 
              onClick={handleResendVerificationEmail}
              variant="contained"
              disabled={emailVerificationLoading}
              startIcon={<EmailIcon />}
            >
              {emailVerificationLoading ? "Đang gửi..." : "Gửi lại"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box sx={{ position: 'fixed', bottom: 10, right: 20, zIndex: 9999 }}></Box>
    </ThemeProvider>
  );
} 