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

Trình phát nhạc nằm trong khu vực bên phải của trang `Về mình`, ngay dưới ảnh đại diện. Thanh điều hướng sử dụng ba tab `Về mình`, `FurryMC` và `Nuôi tôi`, thay toàn bộ nội dung ngay trong màn hình thay vì cuộn xuống section khác.

Khi đã điền `discordUserId`, thẻ Discord sẽ ưu tiên hiển thị bài hát Spotify, sau đó đến game hoặc hoạt động công khai khác. Dữ liệu được làm mới sau mỗi 15 giây.

## Chạy thử

Chạy `python3 -m http.server 8000`, sau đó truy cập `http://localhost:8000`.

## Triển khai

Đẩy toàn bộ tệp lên nhánh GitHub Pages. Giữ nguyên `CNAME` nếu tên miền đã được trỏ về GitHub Pages.

## Cập nhật 15/10/2026 — Hiệu ứng chuột & Skin Studio

- Hiệu ứng ánh sáng xanh và hạt sáng theo chuột, có nút bật/tắt và nhớ lựa chọn.
- Tắt hiệu ứng trên màn hình cảm ứng hoặc khi hệ thống bật giảm chuyển động.
- Tab Skin Minecraft: chọn PNG 64×64 / 64×32, tối đa 2 MB; kiểm tra chữ ký PNG.
- Kéo xoay 360°, tự xoay, thu phóng, chọn Steve/Alex, đi bộ/chạy, đặt lại góc và tải PNG.
- Chọn file chỉ xem trên máy người truy cập, không đăng lên hosting và không lưu khi tải lại trang.
- Bộ dựng skinview3d 3.4.1 đóng gói tại vendor/ (kèm giấy phép), chỉ tải khi cần skin.
- Trình duyệt cần WebGL; có thông báo nếu thiết bị không hỗ trợ.

### Đặt skin AzureWolf mặc định cho tất cả người xem

1. Tải **file skin PNG gốc** (không phải ảnh chụp mô hình) từ nút Download của trang skin.
2. Đặt file tại `assets/skin.png`.
3. Trong `config.js`, sửa `minecraftSkinUrl: "assets/skin.png"`.
4. Đặt `minecraftSkinModel` thành `auto`, `default` (Steve) hoặc `slim` (Alex).
5. Upload toàn bộ nội dung thư mục này lên hosting/GitHub Pages, giữ nguyên CNAME.

Bản cập nhật chưa bao gồm skin cá nhân vì file đính kèm chỉ có ảnh chụp màn hình.
Đây là mã nguồn website tĩnh; muốn có trang quản trị upload và lưu skin công khai
trực tiếp trên web thì cần bổ sung backend và xác thực chủ sở hữu.
