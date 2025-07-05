# GTCloud - Cloud Storage App

Ứng dụng lưu trữ đám mây được xây dựng với React và Firebase, cung cấp khả năng quản lý file và folder một cách dễ dàng.

## ✨ Tính năng chính

### 📁 Quản lý File & Folder
- Tạo thư mục mới
- Upload file lên cloud storage
- Xem danh sách file và thư mục
- Điều hướng qua các thư mục con
- Tìm kiếm file và thư mục

### ⬇️ Download (Tính năng mới!)
- **Download file đơn lẻ**: Tải xuống file trực tiếp với tên gốc
- **Download folder**: Tự động nén thành file ZIP với tên thư mục
- **Progress tracking**: Hiển thị tiến trình download với thanh progress
- **Preview dialog**: Xem trước nội dung folder trước khi download
- **Error handling**: Xử lý lỗi và hiển thị thông báo rõ ràng

### 🗑️ Thùng rác
- Xóa mềm (chuyển vào thùng rác)
- Khôi phục file/folder từ thùng rác
- Xóa vĩnh viễn

### 🎨 Giao diện
- Responsive design cho mobile và desktop
- Dark mode / Light mode
- Tùy chỉnh màu nền
- Material-UI components

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js (version 14 trở lên)
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm start
```

### Build cho production
```bash
npm run build
```

## 📦 Dependencies chính

- **React 19.1.0** - Framework UI
- **Material-UI 7.2.0** - Component library
- **Firebase 11.10.0** - Backend services
- **JSZip** - Nén folder thành ZIP
- **Fuzzysort** - Tìm kiếm mờ

## 🔧 Cấu hình Firebase

Dự án sử dụng Firebase cho:
- **Authentication**: Đăng nhập/đăng ký
- **Firestore**: Lưu trữ metadata file/folder
- **Storage**: Lưu trữ file thực tế

## 📱 Responsive Design

Ứng dụng được tối ưu cho:
- **Desktop**: Giao diện đầy đủ với sidebar
- **Tablet**: Layout thích ứng
- **Mobile**: Giao diện tối ưu cho màn hình nhỏ

## 🎯 Cách sử dụng Download

### Download File
1. Click vào nút download (⬇️) bên cạnh file
2. File sẽ được tải xuống ngay lập tức

### Download Folder
1. Click vào nút download (⬇️) bên cạnh folder
2. Dialog hiển thị thông tin folder và danh sách file bên trong
3. Xem trước nội dung và kích thước
4. Click "Tải xuống" để bắt đầu quá trình nén và download
5. Theo dõi tiến trình qua thanh progress
6. File ZIP sẽ được tải xuống với tên `[tên_folder].zip`

**GTCloud** - Nơi lưu trữ đám mây đơn giản và hiệu quả! ☁️
