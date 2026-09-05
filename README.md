# AzureWolf VN — Founder Profile

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

Mở `config.js` để chỉnh `minecraftServerIp`, `discordUserId`, `counterApiUrl` và thông tin ủng hộ.

- `minecraftServerIp`: địa chỉ Java server dùng cho trạng thái và nút sao chép.
- `discordUserId`: điền Discord User ID gồm 17–20 chữ số. Tài khoản cần tham gia máy chủ Lanyard để API trả trạng thái.
- `counterApiUrl`: URL backend/API riêng dùng để tăng lượt xem toàn cầu. Khi để trống, web dùng bộ đếm cục bộ trên từng trình duyệt và không giả vờ đó là tổng lượt xem toàn cầu.

## Mục “Nuôi tôi được chứ?”

Điền bốn giá trị sau trong `config.js` để bật VietQR tự động:

```js
bankCode: "BIDV",
bankAccount: "SỐ_TÀI_KHOẢN",
bankAccountName: "TEN CHU TAI KHOAN",
donationNote: "NUOIAZUREWOLF"
```

Khi chưa điền, website hiện trạng thái “đang được chuẩn bị” và nút mở Discord. Khi đã điền, người xem có thể chọn 20.000đ, 50.000đ, 100.000đ hoặc tùy tâm; mã QR tự đổi theo số tiền.

## Ghi nhớ trình phát nhạc

Web lưu `azurewolfMusicTime` và `azurewolfMusicVolume` trong `localStorage`. Khi người dùng quay lại bằng cùng trình duyệt, bài nhạc tiếp tục từ vị trí gần nhất và giữ nguyên âm lượng. Dữ liệu chỉ nằm trên thiết bị của người dùng, không được gửi lên máy chủ.

Trình phát nhạc nằm cố định ở góc phải, có thể thu nhỏ thành ảnh bìa. Thanh điều hướng sử dụng ba tab `Về mình`, `FurryMC` và `Nuôi tôi`, chuyển nội dung ngay lập tức thay vì cuộn trang.

Khi đã điền `discordUserId`, thẻ Discord sẽ ưu tiên hiển thị bài hát Spotify, sau đó đến game hoặc hoạt động công khai khác. Dữ liệu được làm mới sau mỗi 15 giây.

## Chạy thử

Chạy `python3 -m http.server 8000`, sau đó truy cập `http://localhost:8000`.

## Triển khai

Đẩy toàn bộ tệp lên nhánh GitHub Pages. Giữ nguyên `CNAME` nếu tên miền đã được trỏ về GitHub Pages.
