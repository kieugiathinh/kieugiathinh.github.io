import React, { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme, Button, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase/config";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FileList from "../components/FileList";
import UploadDialog from "../components/UploadDialog";
import Login from "./Login";
import AccountInfo from "./AccountInfo";
import fuzzysort from 'fuzzysort';

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

  // Lưu darkMode vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Login />;

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#181a20" : bgColor,
        paper: darkMode ? "#23272f" : "#fff"
      },
      primary: { main: darkMode ? "#bb86fc" : "#7b1fa2" },
      secondary: { main: darkMode ? "#03dac6" : "#ad1457" }
    },
    typography: {
      fontFamily: 'Arima, sans-serif',
    },
  });

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
        />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
          <Header
            onSearch={value => setSearch(value)}
            onAccountInfo={() => setShowAccount(true)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            bgColor={bgColor}
            setBgColor={setBgColor}
          />
          <Box sx={{ flex: 1, borderRadius: 2, p: 2, bgcolor: 'background.paper', boxShadow: 2, minHeight: 400 }}>
            {isTrash ? (
              <>
                <Typography variant="h6" fontWeight={700} color="primary" mb={2}>Thùng rác</Typography>
                <FileList
                  items={trashItems}
                  onDelete={handlePermanentDelete}
                  onRestore={handleRestore}
                  isTrash={true}
                />
              </>
            ) : (
              <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {currentFolder && (
                      <Button startIcon={<ArrowBackIcon />} variant="outlined" color="primary" onClick={() => setCurrentFolder(parentFolder)}>
                        Quay về
                      </Button>
                    )}
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {currentFolder ? currentFolderName : "Trang chủ"}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    color="secondary"
                    onClick={() => setOpenDialog(true)}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Tải lên
                  </Button>
                </Stack>
                <FileList
                  items={search ? fuzzysort.go(search, items, { key: 'name', allowTypo: true, threshold: -10000 }).map(r => ({ ...r.obj, _highlight: r })) : items.map(i => ({ ...i, _highlight: null }))}
                  onDelete={handleSoftDelete}
                  onOpenFolder={folder => setCurrentFolder(folder.id)}
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
        />
      </Box>
      <Box sx={{ position: 'fixed', bottom: 10, right: 20, zIndex: 9999 }}></Box>
    </ThemeProvider>
  );
} 