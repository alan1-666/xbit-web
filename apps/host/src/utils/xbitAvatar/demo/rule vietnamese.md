code `function generateAvatar(walletAddress: string)` follow rules:

1 avatar cấu thành từ các part xếp chồng lên nhau:
- logo = face: chỉ có 1 shape
- mouth: cười / mếu / ...
- eye: tròn / híp / ...
- background: solid only / gradient
- decoration in background with low contrast color: blinky star, dotted, diamond, ...

1 part có shape khác nhau ví dụ mouth có cừời / mếu
mỗi part có màu riêng theo pallet màu define sẵn gồm 20 màu gì đó thôi.

Edge case: 1 số thợp không sử dụng nổi:
- màu sắc không tạo ra tương phản, ví dụ face trắng + nền trắng => k nhìn thấy gì
- TODO: Cần phát hiện 2 màu k thể đi với nhau qua độ tương phản ==> nếu 2 màu quá gần nhau trên bánh xe màu thì k thể đi với nhau
- Trong thợp hash trỏ vào màu k đi với nhau ==> Shift index+5 trong pallet màu để select màu khác cho tới khi chọn được màu

