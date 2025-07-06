import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, TextField, Button, Typography, Stack, Alert, Divider, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton } from "@mui/material";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../firebase/config";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useResponsive } from "../hooks/useResponsive";
import { getThemeColor } from "../utils/themeUtils";


export default function Login() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [isFromRegistration, setIsFromRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const handleTabChange = (_, v) => {
    setTab(v);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setConfirmPassword("");
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      // Thêm scopes nếu cần
      provider.addScope('email');
      provider.addScope('profile');
      
      // Thử popup trước, nếu thất bại thì dùng redirect
      try {
        await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.log("Popup failed, trying redirect:", popupError);
        // Nếu popup thất bại, dùng redirect
        await signInWithRedirect(auth, provider);
      }
    } catch (e) {
      console.error("Google sign-in error:", e);
      if (e.code === 'auth/popup-blocked') {
        setError("Popup bị chặn! Vui lòng cho phép popup cho trang web này.");
      } else if (e.code === 'auth/unauthorized-domain') {
        setError("Domain chưa được authorize trong Firebase Console!");
      } else {
        setError("Đăng nhập Google thất bại: " + e.message);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Kiểm tra xem email đã được xác thực chưa
      if (!user.emailVerified) {
        setError("Email chưa được xác thực! Vui lòng kiểm tra hộp thư và xác thực email trước khi đăng nhập.");
        // Đăng xuất ngay nếu email chưa xác thực
        await signOut(auth);
      } else {
        setSuccess("Đăng nhập thành công!");
      }
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError("Sai email hoặc mật khẩu!");
      } else if (e.code === 'auth/too-many-requests') {
        setError("Quá nhiều lần thử đăng nhập sai. Vui lòng thử lại sau 15 phút.");
      } else {
        setError("Đăng nhập thất bại: " + e.message);
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      
      // Gửi email xác thực thật từ Firebase
      await sendEmailVerification(userCred.user, {
        url: window.location.origin, // URL để redirect sau khi xác thực
        handleCodeInApp: false
      });
      
      // Đăng xuất ngay sau khi gửi email xác thực
      await signOut(auth);
      
      setPendingUser(userCred.user);
      setIsFromRegistration(true);
      setShowOTPDialog(true);
      setSuccess("Email xác thực đã được gửi đến email của bạn!");
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError("Email này đã được sử dụng! Vui lòng sử dụng email khác hoặc đăng nhập.");
      } else if (e.code === 'auth/weak-password') {
        setError("Mật khẩu quá yếu! Vui lòng sử dụng mật khẩu có ít nhất 6 ký tự.");
      } else if (e.code === 'auth/invalid-email') {
        setError("Email không hợp lệ!");
      } else {
        setError("Đăng ký thất bại: " + e.message);
      }
    }
    setLoading(false);
  };

  const handleVerifyEmail = async () => {
    setOtpLoading(true);
    setError("");
    
    try {
      // Đăng nhập lại để kiểm tra trạng thái email verification
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        if (isFromRegistration) {
          setSuccess("Email đã được xác thực thành công! Tài khoản đã được kích hoạt. Vui lòng đăng nhập để tiếp tục.");
          setShowOTPDialog(false);
          setPendingUser(null);
          // Đăng xuất để user có thể đăng nhập lại
          await signOut(auth);
          // Đợi một chút để đảm bảo đăng xuất hoàn tất
          await new Promise(resolve => setTimeout(resolve, 100));
          // Chuyển về tab đăng nhập
          setTab(0);
          setEmail("");
          setPassword("");
          setName("");
          setConfirmPassword("");
        } else {
          setSuccess("Email đã được xác thực thành công! Bạn có thể đăng nhập bình thường.");
          setShowOTPDialog(false);
          setPendingUser(null);
          // Đăng xuất để user có thể đăng nhập lại
          await signOut(auth);
          // Đợi một chút để đảm bảo đăng xuất hoàn tất
          await new Promise(resolve => setTimeout(resolve, 100));
          setEmail("");
          setPassword("");
        }
      } else {
        setError("Email chưa được xác thực. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực.");
        // Đăng xuất nếu email chưa xác thực
        await signOut(auth);
      }
    } catch (e) {
      setError("Lỗi kiểm tra xác thực email: " + e.message);
      // Đăng xuất nếu có lỗi
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Lỗi khi đăng xuất:", signOutError);
      }
    }
    
    setOtpLoading(false);
  };

  const handleResendVerification = async () => {
    setOtpLoading(true);
    setError("");
    try {
      // Đăng nhập lại để gửi email xác thực
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Gửi lại email xác thực
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: false
      });
      
      setSuccess("Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.");
      
      // Đăng xuất sau khi gửi email
      await signOut(auth);
    } catch (e) {
      setError("Không thể gửi lại email xác thực: " + e.message);
      // Đăng xuất nếu có lỗi
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Lỗi khi đăng xuất:", signOutError);
      }
    }
    setOtpLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError("Vui lòng nhập email!");
      return;
    }
    
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");
    
    try {
      await sendPasswordResetEmail(auth, resetEmail, {
        url: window.location.origin + '/login'
      });
      setResetSuccess("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.");
      setResetEmail("");
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        setResetError("Email này chưa được đăng ký!");
      } else {
        setResetError("Không thể gửi email đặt lại mật khẩu: " + e.message);
      }
    }
    setResetLoading(false);
  };

  const handleCloseOTPDialog = async () => {
    setShowOTPDialog(false);
    setError("");
    setSuccess("");
    
    // Luôn đăng xuất khi đóng dialog
    try {
      await signOut(auth);
      // Đợi một chút để đảm bảo đăng xuất hoàn tất
      await new Promise(resolve => setTimeout(resolve, 100));
      setPendingUser(null);
      setIsFromRegistration(false);
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: isMobile ? 2 : 4
    }}>
      <Paper sx={{ 
        p: isMobile ? 2 : 4, 
        borderRadius: 4, 
        minWidth: isMobile ? '100%' : 350, 
        maxWidth: isMobile ? '100%' : 450,
        boxShadow: 4 
      }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          color="primary.main" 
          align="center" 
          mb={2}
          sx={{ fontSize: isMobile ? 28 : 32 }}
        >
          GTCloud
        </Typography>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          sx={{ mb: 2 }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Đăng nhập" />
          <Tab label="Đăng ký" />
        </Tabs>
        {tab === 0 && (
          <form onSubmit={handleLogin}>
            <Stack spacing={isMobile ? 1.5 : 2}>
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth 
                autoFocus 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Mật khẩu" 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              
              {/* Quên mật khẩu */}
              <Button 
                onClick={() => setShowResetDialog(true)}
                variant="text"
                color="secondary"
                size="small"
                sx={{ 
                  fontSize: isMobile ? 12 : 14,
                  textTransform: 'none'
                }}
              >
                Quên mật khẩu?
              </Button>
              
              <Divider>hoặc</Divider>
              <Button 
                onClick={handleGoogle} 
                startIcon={<GoogleIcon />} 
                variant="outlined" 
                color="secondary" 
                disabled={loading} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                Đăng nhập với Google
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
            </Stack>
          </form>
        )}
        {tab === 1 && (
          <form onSubmit={handleRegister}>
            <Stack spacing={isMobile ? 1.5 : 2}>
              <TextField 
                label="Tên hiển thị" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                fullWidth 
                autoFocus 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
              />
              <TextField 
                label="Mật khẩu" 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField 
                label="Xác nhận mật khẩu" 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                fullWidth 
                size={isMobile ? "small" : "medium"}
                error={confirmPassword && password !== confirmPassword}
                helperText={confirmPassword && password !== confirmPassword ? "Mật khẩu không khớp" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading || (confirmPassword && password !== confirmPassword)} 
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  fontSize: isMobile ? 14 : 16,
                  py: isMobile ? 1 : 1.5
                }}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        )}
      </Paper>

      {/* Dialog xác thực email */}
      <Dialog 
        open={showOTPDialog} 
        onClose={handleCloseOTPDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        disableBackdropClick
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
            Chúng tôi đã gửi email xác thực đến <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để kích hoạt tài khoản.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sau khi xác thực email, nhấn nút "Đã xác thực" bên dưới để hoàn tất đăng ký.
          </Typography>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
            ⚠️ Lưu ý: Không nhận được email? Kiểm tra thư mục spam hoặc nhấn nút "Gửi lại".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseOTPDialog}
            variant="outlined"
            color="secondary"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleResendVerification}
            variant="outlined"
            disabled={otpLoading}
            startIcon={<EmailIcon />}
          >
            {otpLoading ? "Đang gửi..." : "Gửi lại"}
          </Button>
          <Button 
            onClick={handleVerifyEmail}
            variant="contained"
            disabled={otpLoading}
            startIcon={<SecurityIcon />}
          >
            {otpLoading ? "Đang kiểm tra..." : (isFromRegistration ? "Hoàn tất đăng ký" : "Đã xác thực")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog đặt lại mật khẩu */}
      <Dialog 
        open={showResetDialog} 
        onClose={() => setShowResetDialog(false)}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'primary.main'
        }}>
          <LockResetIcon />
          Đặt lại mật khẩu
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          {resetSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{resetSuccess}</Alert>
          )}
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowResetDialog(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handlePasswordReset}
            variant="contained"
            disabled={resetLoading}
            startIcon={<LockResetIcon />}
          >
            {resetLoading ? "Đang gửi..." : "Gửi email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}