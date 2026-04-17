# Ngân hàng câu hỏi — Express.js + Handlebars

## Cấu trúc thư mục

```
ngan-hang-cau-hoi/
├── app.js                        # Entry point Express
├── package.json
├── routes/
│   └── questions.js              # Routes + controller logic
├── views/
│   ├── layouts/
│   │   └── main.hbs              # Layout chính (wrapper HTML)
│   ├── partials/
│   │   ├── sidebar.hbs           # Sidebar navigation
│   │   ├── question-card.hbs     # Card câu hỏi (reusable)
│   │   └── drawer-form.hbs       # Drawer thêm câu hỏi
│   └── questions/
│       └── index.hbs             # Trang danh sách câu hỏi
└── public/
    ├── css/
    │   └── main.css              # Toàn bộ CSS
    └── js/
        └── main.js               # Client-side JS
```

## Cài đặt và chạy

```bash
# 1. Vào thư mục
cd ngan-hang-cau-hoi

# 2. Cài dependencies
npm install

# 3. Chạy server
npm start
# hoặc chế độ dev (tự reload):
npm run dev

# 4. Mở trình duyệt
# http://localhost:3000
```

## Tính năng

- Danh sách câu hỏi với filter theo loại, cấp độ, chủ đề
- Tìm kiếm theo text câu hỏi hoặc ID
- Thêm câu hỏi qua drawer (slide-in panel)
- Hỗ trợ 4 loại: Reading, Listening, Grammar, Vocab
- Xoá câu hỏi với xác nhận

## Mở rộng tiếp theo

- Kết nối database (MongoDB / PostgreSQL)
- Thêm authentication
- Phân trang thực sự
- Upload file audio cho Listening
- Export đề thi
