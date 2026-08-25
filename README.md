# AzureWolf VN — Personal Profile

Website profile tĩnh của Hiếu Trần (AzureWolf VN), tối ưu để triển khai bằng GitHub Pages.

## Cấu trúc

- `index.html`: nội dung và SEO
- `style.css`: giao diện responsive
- `script.js`: trình phát nhạc, hiệu ứng và năm tự động
- `assets/`: ảnh, video nền và nhạc
- `CNAME`: tên miền tùy chỉnh `azurewolf.io.vn`
- `robots.txt`, `sitemap.xml`: hỗ trợ công cụ tìm kiếm
- `site.webmanifest`: thông tin khi thêm trang vào màn hình chính
- `config.js`: IP Minecraft, Discord User ID và API bộ đếm

## Cấu hình tính năng động

Mở `config.js` và chỉnh ba giá trị: `minecraftServerIp`, `discordUserId`, `counterApiUrl`.

- `minecraftServerIp`: địa chỉ Java server dùng cho trạng thái và nút sao chép.
- `discordUserId`: điền Discord User ID gồm 17–20 chữ số. Tài khoản cần tham gia máy chủ Lanyard để API trả trạng thái.
- `counterApiUrl`: URL backend/API riêng dùng để tăng lượt xem toàn cầu. Khi để trống, web dùng bộ đếm cục bộ trên từng trình duyệt và không giả vờ đó là tổng lượt xem toàn cầu.

## Ghi nhớ trình phát nhạc

Web lưu `azurewolfMusicTime` và `azurewolfMusicVolume` trong `localStorage`. Khi người dùng quay lại bằng cùng trình duyệt, bài nhạc tiếp tục từ vị trí gần nhất và giữ nguyên âm lượng. Dữ liệu chỉ nằm trên thiết bị của người dùng, không được gửi lên máy chủ.

## Chạy thử

Chạy `python3 -m http.server 8000`, sau đó truy cập `http://localhost:8000`.

## Triển khai

Đẩy toàn bộ tệp lên nhánh GitHub Pages. Giữ nguyên `CNAME` nếu tên miền đã được trỏ về GitHub Pages.
