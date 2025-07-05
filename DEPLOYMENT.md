# Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Chuẩn bị Repository

1. Tạo repository mới trên GitHub với tên `gtstorage`
2. Push code lên repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/gtstorage.git
git push -u origin main
```

## Bước 2: Cập nhật Homepage URL

Trong file `package.json`, thay đổi `homepage` field:
```json
"homepage": "https://yourusername.github.io/gtstorage"
```
Thay `yourusername` bằng tên GitHub username của bạn.

## Bước 3: Deploy

Chạy lệnh sau để deploy:
```bash
npm run deploy
```

## Bước 4: Cấu hình GitHub Pages

1. Vào repository trên GitHub
2. Vào Settings > Pages
3. Trong "Source", chọn "Deploy from a branch"
4. Chọn branch `gh-pages` và folder `/ (root)`
5. Click "Save"

## Bước 5: Truy cập Website

Sau khi deploy thành công, website sẽ có sẵn tại:
`https://yourusername.github.io/gtstorage`

## Lưu ý quan trọng

- Đảm bảo repository là public
- Có thể mất vài phút để website xuất hiện sau khi deploy
- Mỗi lần cập nhật code, chạy lại `npm run deploy` để deploy phiên bản mới

## Troubleshooting

Nếu gặp lỗi 404, hãy kiểm tra:
- URL homepage trong package.json có đúng không
- Repository có public không
- Branch gh-pages đã được tạo chưa 