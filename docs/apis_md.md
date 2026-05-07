| STT | Module                | Method | API                               | Data Raw | Đối tượng call | Mô tả | Mục đích                              | Ai làm? |
| :-: | :-------------------- | :----: | :-------------------------------- | :------: | :----------------: | :------ | :--------------------------------------- | :------: |
|  1  | Auth                  |  POST  | `/auth/login`                   |          |        All        |         | để login                               |          |
|  2  |                       |  POST  | `/auth/register`                |          |        All        |         | để đăng kí                          |          |
|  3  |                       |  POST  | `/auth/logout`                  |          |        All        |         | để đăng xuất                        |          |
|  4  |                       |  GET  | `/auth/me`                      |          |        All        |         | xem tt acc của mình                    |          |
|  5  |                       |  POST  | `/auth/logout`                  |          |        All        |         | Đăng xuất acc                         |          |
|  6  |                       | PATCH | `/auth/change-password`         |          |        All        |         | Thay password                            |          |
|  7  |                       |  POST  | `/auth/forgot-password`         |          |        All        |         | Quên password                           |          |
|  8  |                       |  POST  | `/auth/reset-password`          |          |        All        |         | Đặt lại pass                          |          |
|  9  | User                  |  GET  | `/users`                        |          |        All        |         | Lấy danh sách users                    |          |
| 10 |                       |  POST  | `/users`                        |          |        All        |         | Tạo mới users                          |          |
| 11 |                       |  GET  | `/users/:id`                    |          |        All        |         | Xem tt hồ sơ users                     |          |
| 12 |                       | PATCH | `/users/:id`                    |          |        All        |         | Cập nhật tt hồ sơ users              |          |
| 13 |                       |  PUT  | `/users/:id/avatar`             |          |        All        |         | Upload avatar                            |          |
| 14 |                       | DELETE | `/users/:id`                    |          |        All        |         | Xóa users                               |          |
| 15 |                       |  GET  | `/users/:id/histories`          |          |        All        |         | Lấy danh sách lịch sử làm bài      |          |
| 16 |                       |  GET  | `/users/:id/histories/:id`      |          |        All        |         | Xem lịch sử làm bài thi              |          |
| 17 | Class                 |  GET  | `/classes`                      |          |      Teacher      |         | Lấy danh sách các lớp                |          |
| 18 |                       |  POST  | `/classes`                      |          |      Teacher      |         | Tạo mới lớp                           |          |
| 19 |                       |  GET  | `/classes/:id`                  |          |      Teacher      |         | Xem tt của 1 lớp                       |          |
| 20 |                       |  PUT  | `/classes/:id`                  |          |      Teacher      |         | Cập nhật tt của 1 lớp                |          |
| 21 |                       | DELETE | `/classes/:id`                  |          |      Teacher      |         | Xóa lớp                                |          |
| 22 |                       |  GET  | `/classes/:id/students`         |          |      Teacher      |         | Lấy danh sách học sinh của 1 lớp    |          |
| 23 |                       |  POST  | `/classes/:id/students`         |          |      Teacher      |         | Thêm mới học sinh vào 1 lớp         |          |
| 24 |                       |  GET  | `/classes/:id/students/:stu_id` |          |      Teacher      |         | Lấy tt học sinh của 1 lớp            |          |
| 25 |                       | DELETE | `/classes/:id/students/:stu_id` |          |      Teacher      |         | Xóa học sinh khỏi 1 lớp              |          |
| 26 |                       | PATCH | `/classes/:id/students/:stu_id` |          |      Teacher      |         | Cập nhật thông tin hs                 |          |
| 27 | Schedule              |  GET  | `/classes/:id/schedule`         |          |      Teacher      |         | Lấy thời khóa biểu của lớp học    |          |
| 28 |                       |  POST  | `/classes/:id/schedule`         |          |      Teacher      |         | Cập nhật tt thời khóa biểu          |          |
| 29 | Question Topic        |  GET  | `/topics`                       |          |      Teacher      |         | Lấy danh sách chủ đề                |          |
| 30 |                       |  POST  | `/topics`                       |          |      Teacher      |         | Tạo chủ đề mới                      |          |
| 31 |                       |  GET  | `/topics/:id`                   |          |      Teacher      |         | Xem chi tiết chủ đề                  |          |
| 32 |                       | PATCH | `/topics/:id`                   |          |      Teacher      |         | Thay đổi chủ đề                     |          |
| 33 | Question              |  GET  | `/questions`                    |          |                    |         | Lấy danh sách câu hỏi                |          |
| 34 |                       |  POST  | `/questions`                    |          |                    |         | Tạo mới câu hỏi                      |          |
| 35 |                       |  GET  | `/questions/:id`                |          |                    |         | Xem chi tiết câu hỏi                  |          |
| 36 |                       | PATCH | `/questions/:id`                |          |                    |         | Chỉnh sửa câu hỏi                    |          |
| 37 |                       | DELETE | `/questions/:id`                |          |                    |         | Xóa câu hỏi                           |          |
| 38 | Qeustion Options      |  POST  | `/questions/:id/options`        |          |                    |         | Tạo câu trả lời của câu hỏi       |          |
| 39 |                       | PATCH | `/questions/:id/options`        |          |                    |         | Cập nhật câu trả lời của câu hỏi |          |
| 40 | Exam                  |  GET  | `/exams`                        |          |      Teacher      |         | Lấy danh sách bài thi                 |          |
| 41 |                       |  POST  | `/exams`                        |          |      Teacher      |         | Tạo bài thi mới                       |          |
| 42 |                       |  GET  | `/exams/:id`                    |          |      Teacher      |         | Xem bài thi cụ thể                    |          |
| 43 |                       | PATCH | `/exams/:id`                    |          |      Teacher      |         | Cập nhật bài thi                      |          |
| 44 |                       | DELETE | `/exams/:id`                    |          |      Teacher      |         | Xóa bài thi                            |          |
| 45 |                       |  GET  | `/exams/:id/analysis`           |          |      Teacher      |         | Phân tích bài thi                     |          |
| 46 |                       |  GET  | `/exams/:id/statistics`         |          |      Teacher      |         | Thống kê bài thi                      |          |
| 47 |                       |  GET  | `/exams/:id/questions`          |          |  Teacher, Student  |         | Xem danh sách câu hỏi của đề thi   |          |
| 48 |                       |  POST  | `/exams/:id/questions`          |          |      Teacher      |         | Thêm câu hỏi của đề thi            |          |
| 49 |                       |  GET  | `/exams/:id/questions/:q_id`    |          |  Teacher, Student  |         | Xem câu hỏi cụ thể của đề thi     |          |
| 50 | Exam Session          |  POST  | `/exam-sessions`                |          |        All        |         | Bắt đầu phiên làm bài thi mới     |          |
| 51 |                       |  POST  | `/exam-sessions/:id`            |          |        All        |         | Cập nhật thông tin phiên làm bài   |          |
| 52 |                       |  POST  | `/exam-sessions/:id/submit`     |          |        All        |         | Nộp bài                                |          |
| 53 | Exam Session + Result |  GET  | `/exam-sessions/:id/result`     |          |        All        |         | Xem kết quả bài làm                  |          |
| 54 | Notification          |  GET  | `/notifications`                |          |        All        |         | Xem danh sách thông báo               |          |
| 55 |                       |  POST  | `/notifications/:id`            |          |        All        |         | Xem chi tiết thông báo                |          |
| 56 |                       | PATCH | `/notifications/:id`            |          |        All        |         | Cập nhật trạng thái thông báo      |          |
