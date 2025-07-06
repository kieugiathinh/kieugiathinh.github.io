// Utility để xử lý OTP verification
// Sử dụng localStorage để lưu trữ OTP tạm thời (trong thực tế nên dùng database)

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = (email, otp) => {
  const otpData = {
    otp,
    email,
    timestamp: Date.now(),
    attempts: 0
  };
  localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
};

export const getOTP = (email) => {
  const otpData = localStorage.getItem(`otp_${email}`);
  return otpData ? JSON.parse(otpData) : null;
};

export const verifyOTP = (email, inputOTP) => {
  const otpData = getOTP(email);
  if (!otpData) {
    return { success: false, message: "OTP không tồn tại hoặc đã hết hạn" };
  }

  // Kiểm tra thời gian hết hạn (5 phút)
  const now = Date.now();
  const expiryTime = 5 * 60 * 1000; // 5 phút
  if (now - otpData.timestamp > expiryTime) {
    localStorage.removeItem(`otp_${email}`);
    return { success: false, message: "OTP đã hết hạn" };
  }

  // Kiểm tra số lần thử
  if (otpData.attempts >= 3) {
    localStorage.removeItem(`otp_${email}`);
    return { success: false, message: "Quá nhiều lần thử sai. Vui lòng yêu cầu OTP mới" };
  }

  // Tăng số lần thử
  otpData.attempts += 1;
  localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));

  // Kiểm tra OTP
  if (otpData.otp === inputOTP) {
    localStorage.removeItem(`otp_${email}`);
    return { success: true, message: "Xác thực OTP thành công" };
  } else {
    return { success: false, message: "OTP không đúng" };
  }
};

export const clearOTP = (email) => {
  localStorage.removeItem(`otp_${email}`);
};

// Mock function để gửi email OTP (trong thực tế sẽ gọi API)
export const sendOTPEmail = async (email, otp) => {
  // Giả lập gửi email
  console.log(`Gửi OTP ${otp} đến email: ${email}`);
  
  // Trong thực tế, bạn sẽ gọi API để gửi email
  // Ví dụ: await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "OTP đã được gửi đến email của bạn" });
    }, 1000);
  });
}; 