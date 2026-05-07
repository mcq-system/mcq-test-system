Thiên thần là gì?

---

# Database Schema Samples

### 1. Bảng users

```json
{
    "_id": "000000000000000000000001",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "email": "vana@example.com",
    "phone": "0123456789",
    "password": "<hash1>",
    "role": "student", 
    "status": "active",
    "created_at": "2024-04-13T10:00:00Z"
}
```

### 2. Bảng classes

```json
{
    "_id": "000000000000000000000011",
    "ten": "10A1",
    "teacher_id": "000000000000000000000002",
    "description": "Lop chuyen Toan",
    "created_at": "2024-04-13T10:00:00Z"
}
```

### 3. class_members

```json
{
    "class_id": "000000000000000000000011",
    "student_id": "000000000000000000000001",
    "description": "Hoc sinh gioi",
    "created_at": "2024-04-13T10:10:00Z"
}
```

### 4. schedules

```json
{
    "class_id": "000000000000000000000011",
    "day_of_week": 2,
    "start_time": "08:00",
    "end_time": "09:30"
}
```

### 5. question_topics

```json
{
    "_id": "000000000000000000000021",
    "name": "Toan hoc",
    "description": "Cac cau hoi ve toan"
}
```

### 6. questions

```json
{
    "_id": "000000000000000000000101",
    "topic_id": "000000000000000000000021",
    "created_by": "000000000000000000000002",
    "content": "2 + 2 = ?",
    "level": "easy",
    "status": "active",
    "created_at": "2024-04-13T10:00:00Z",
    "options": [
      { "content": "4", "is_correct": true },
      { "content": "5", "is_correct": false },
      { "content": "3", "is_correct": false },
      { "content": "6", "is_correct": false }
    ]
}
```

### 7. exams

```json
{
    "_id": "000000000000000000000201",
    "class_id": "000000000000000000000011",
    "created_by": "000000000000000000000002",
    "title": "Kiem tra 15 phut Toan",
    "duration_minutes": 15,
    "start_time": "2024-04-14T08:00:00Z",
    "end_time": "2024-04-14T08:15:00Z",
    "status": "DRAFT"
}
```

### 8. exam_questions

```json
{
    "exam_id": "000000000000000000000201",
    "question_id": "000000000000000000000101"
}
```

### 9. exam_sessions

```json
{
    "_id": "000000000000000000000301",
    "exam_id": "000000000000000000000201",
    "student_id": "000000000000000000000001",
    "started_at": "2024-04-14T08:00:00Z",
    "submitted_at": "2024-04-14T08:15:00Z",
    "status": "SUBMITTED"
}
```

### 10. student_answers

```json
{
    "exam_session_id": "000000000000000000000301",
    "question_id": "000000000000000000000101",
    "option_content": "4"
}
```
