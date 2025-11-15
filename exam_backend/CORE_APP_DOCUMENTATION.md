# SmartExam Core App - Model Documentation

## Overview

The **Core App** handles the administrative functionality of the SmartExam system. It manages:
- Admin authentication and authorization
- Student registration (single & bulk upload)
- Exam module creation with file upload support
- Question bank management
- Result tracking and reporting
- System-wide settings and configuration

---

## Model Structure


---

### 2. Level Model

**Purpose:** Represents academic levels/classes for student categorization.

**Key Features:**
- Supports primary, secondary, and tertiary education levels
- Unique codes for easy reference
- Active/inactive status control
- Student count tracking

**Fields:**
```python
- name: Level name (e.g., "Grade 10", "Year 1")
- level_type: Education type (primary/secondary/tertiary)
- code: Unique code (e.g., "G10", "UG1")
- description: Optional description
- is_active: Whether level is currently active
```

**Examples:**
```python
# Create levels
Level.objects.create(name="Grade 10", level_type="secondary", code="G10")
Level.objects.create(name="Year 1", level_type="tertiary", code="UG1")

# Get all secondary levels
secondary_levels = Level.objects.filter(level_type="secondary", is_active=True)
```

---

### 3. Student Model

**Purpose:** Stores student information for secondary and tertiary levels.

**Key Features:**
- Unique student ID for login (no password required)
- Level/class assignment
- Profile information (email, phone, DOB, gender)
- Registration tracking
- Bulk upload support
- Activity tracking (last login)
- Performance metrics (completed exams, average score)

**Fields:**
```python
- full_name: Student's complete name
- student_id: Unique identifier (used for login)
- level: ForeignKey to Level
- email: Optional email address
- phone_number: Optional contact number
- date_of_birth: Optional DOB
- gender: Optional gender
- registration_date: Auto-set on creation
- is_active: Account status
- last_login: Last login timestamp
- uploaded_via_bulk: True if added via Excel/CSV
```

**Properties:**
```python
- completed_exams_count: Number of completed exams
- average_score: Average percentage across all exams
```

**Usage:**
```python
# Student login (by student_id only)
student = Student.objects.get(student_id="STU001", is_active=True)

# Get student's performance
exams_completed = student.completed_exams_count
avg = student.average_score
```

---

### 4. ExamModule Model

**Purpose:** Represents exam/test modules with associated questions.

**Key Features:**
- Title, description, and unique code
- Level assignment (who can take this exam)
- Time limits and pass/fail thresholds
- Maximum attempts control
- Question randomization
- Show/hide correct answers option
- Availability scheduling (start/end dates)
- Activation control
- Created by admin tracking

**Fields:**
```python
- title: Exam name
- description: Detailed exam description
- code: Unique exam code (e.g., "MATH101")
- level: ForeignKey to Level
- duration_minutes: Time limit (1-300 mins)
- passing_score: Pass threshold percentage (0-100)
- max_attempts: Maximum attempts allowed (1-10)
- randomize_questions: Shuffle questions per student
- show_correct_answers: Show answers after completion
- is_active: Whether exam is available
- start_date, end_date: Optional availability window
- created_by: ForeignKey to AdminUser
```

**Properties:**
```python
- total_questions: Count of questions in exam
- total_marks: Sum of all question marks
- attempts_count: Number of student attempts
- is_available: Whether exam is currently available
```

**Usage:**
```python
# Create exam
exam = ExamModule.objects.create(
    title="Mathematics Final Exam",
    code="MATH101",
    level=level,
    duration_minutes=90,
    passing_score=60,
    created_by=admin
)

# Check if exam is available
if exam.is_available:
    # Show to students
    pass
```

---

### 5. Question Model

**Purpose:** Individual exam questions with multiple choice format.

**Key Features:**
- Multiple choice (4 options: A, B, C, D)
- Difficulty levels (easy, medium, hard)
- Category/topic classification
- Mark allocation
- Correct answer tracking
- Optional explanation
- Display ordering
- Active/inactive status

**Fields:**
```python
- exam_module: ForeignKey to ExamModule
- question_text: The question
- option_a, option_b, option_c, option_d: Answer options
- correct_answer: Correct option (A/B/C/D)
- difficulty: Question difficulty
- category: Optional topic/category
- marks: Points awarded
- explanation: Optional answer explanation
- order: Display order (0 for default)
- is_active: Whether question is active
```

**Properties:**
```python
- options: Dictionary of all options {'A': text, 'B': text, ...}
```

**Usage:**
```python
# Create question
Question.objects.create(
    exam_module=exam,
    question_text="What is 2 + 2?",
    option_a="3",
    option_b="4",
    option_c="5",
    option_d="6",
    correct_answer="B",
    difficulty="easy",
    marks=1
)
```

---

### 6. ExamAttempt Model

**Purpose:** Tracks individual student exam attempts and results.

**Key Features:**
- Multiple attempt tracking
- Answer recording
- Auto-scoring based on correct answers
- Time tracking (start, end, duration)
- Status management (in_progress, completed, abandoned)
- Pass/fail determination
- Performance statistics

**Fields:**
```python
- student: ForeignKey to Student
- exam_module: ForeignKey to ExamModule
- attempt_number: Attempt count (1, 2, 3, ...)
- status: Current status
- start_time: When exam started
- end_time: When exam completed
- time_taken_seconds: Duration in seconds
- score: Final percentage (0-100)
- total_questions: Question count
- correct_answers: Number correct
- wrong_answers: Number wrong
- unanswered: Number unanswered
- passed: Whether student passed
```

**Properties:**
```python
- grade: Letter grade (A+, A, B, C, D, F)
```

**Methods:**
```python
- calculate_score(): Calculate and update score based on answers
```

**Usage:**
```python
# Start exam attempt
attempt = ExamAttempt.objects.create(
    student=student,
    exam_module=exam,
    attempt_number=1,
    status='in_progress'
)

# Complete and calculate score
attempt.status = 'completed'
attempt.end_time = timezone.now()
attempt.calculate_score()
```

---

### 7. StudentAnswer Model

**Purpose:** Records individual answers for each question.

**Key Features:**
- Links answers to exam attempts and questions
- Automatic correctness checking
- Answer timestamp tracking

**Fields:**
```python
- exam_attempt: ForeignKey to ExamAttempt
- question: ForeignKey to Question
- selected_answer: Chosen option (A/B/C/D)
- is_correct: Auto-calculated correctness
- answered_at: Timestamp
```

**Auto-save Logic:**
- Automatically checks if `selected_answer` matches `question.correct_answer`
- Sets `is_correct` accordingly

**Usage:**
```python
# Record student answer
StudentAnswer.objects.create(
    exam_attempt=attempt,
    question=question,
    selected_answer='B'  # is_correct auto-calculated on save
)
```

---

### 8. SystemSettings Model

**Purpose:** Global system configuration (Singleton pattern).

**Key Features:**
- Institution branding (name, logo)
- Contact information (emails, phone)
- Default exam settings
- Question display settings
- Security settings
- Only one instance exists

**Fields:**
```python
# Branding
- institution_name: Institution name
- system_title: System title
- logo: System logo image

# Contact
- admin_email: Admin email
- support_email: Support email
- contact_phone: Contact phone

# Exam Defaults
- default_exam_duration: Default time (minutes)
- default_passing_percentage: Default pass threshold
- default_max_attempts: Default max attempts

# Question Settings
- randomize_questions_default: Default randomization
- show_correct_answers_default: Default show answers
- allow_question_review: Allow review before submit
- commence_exam_immediately: Auto-start exams

# Security
- browser_restrictions: Enable browser checks
- fullscreen_enforcement: Force fullscreen
- copy_paste_prevention: Disable copy/paste
- right_click_disabled: Disable right-click
- keyboard_shortcuts_disabled: Disable shortcuts
```

**Usage:**
```python
# Get settings (creates if doesn't exist)
settings = SystemSettings.load()

# Update settings
settings.institution_name = "My School"
settings.default_exam_duration = 90
settings.save()
```

---

### 9. BulkUpload Model

**Purpose:** Tracks bulk upload operations for students and questions.

**Key Features:**
- Upload type tracking (students/questions)
- File storage
- Processing status
- Success/failure statistics
- Error logging
- Admin tracking

**Fields:**
```python
- upload_type: Type of upload (students/questions)
- file: Uploaded file (Excel/CSV)
- exam_module: Related exam (for question uploads)
- level: Related level (for student uploads)
- uploaded_by: ForeignKey to AdminUser
- status: Processing status
- total_rows: Total rows in file
- successful_rows: Successfully processed
- failed_rows: Failed rows
- error_log: Error details
- processed_at: Processing completion time
```

**Properties:**
```python
- success_rate: Percentage of successful rows
```

**Usage:**
```python
# Track bulk upload
upload = BulkUpload.objects.create(
    upload_type='students',
    file=uploaded_file,
    level=level,
    uploaded_by=admin,
    status='processing'
)

# Update after processing
upload.total_rows = 100
upload.successful_rows = 98
upload.failed_rows = 2
upload.status = 'completed'
upload.save()
```

---

## Database Relationships

```
AdminUser (1) ----< (M) ExamModule
AdminUser (1) ----< (M) BulkUpload

Level (1) ----< (M) Student
Level (1) ----< (M) ExamModule
Level (1) ----< (M) BulkUpload

ExamModule (1) ----< (M) Question
ExamModule (1) ----< (M) ExamAttempt
ExamModule (1) ----< (M) BulkUpload

Student (1) ----< (M) ExamAttempt

ExamAttempt (1) ----< (M) StudentAnswer

Question (1) ----< (M) StudentAnswer
```

---

## API Endpoints Design

### Authentication Endpoints

```
POST /api/core/admin/login/
- Body: { "username": "admin", "password": "password" }
- Response: { "token": "...", "user": {...} }

POST /api/core/admin/logout/
- Headers: Authorization: Bearer <token>
- Response: { "message": "Logged out successfully" }
```

### Student Management Endpoints

```
GET /api/core/students/
- List all students (paginated, filterable by level)
- Query params: ?level=secondary&page=1&search=John

POST /api/core/students/
- Create single student
- Body: { "full_name": "...", "student_id": "...", "level": id }

POST /api/core/students/bulk-upload/
- Bulk upload via Excel/CSV
- Body: FormData with file

PUT /api/core/students/{id}/
- Update student details

DELETE /api/core/students/{id}/
- Deactivate student
```

### Exam Module Management

```
GET /api/core/exam-modules/
- List all exam modules

POST /api/core/exam-modules/
- Create exam module
- Body: { "title": "...", "code": "...", "level": id, ... }

GET /api/core/exam-modules/{id}/
- Get exam details with questions

PUT /api/core/exam-modules/{id}/
- Update exam module

DELETE /api/core/exam-modules/{id}/
- Delete exam module
```

### Question Management

```
POST /api/core/exam-modules/{id}/questions/bulk-upload/
- Bulk upload questions via Excel/CSV
- Body: FormData with file

GET /api/core/exam-modules/{id}/questions/
- List all questions for an exam

POST /api/core/questions/
- Create single question

PUT /api/core/questions/{id}/
- Update question

DELETE /api/core/questions/{id}/
- Delete question
```

### Results & Reports

```
GET /api/core/exam-modules/{id}/results/
- Get all results for an exam module
- Response: Statistics + student results

GET /api/core/exam-modules/{id}/results/export/
- Download results as Excel/PDF

GET /api/core/students/{id}/results/
- Get all results for a student
```

### System Settings

```
GET /api/core/settings/
- Get current system settings

PUT /api/core/settings/
- Update system settings
- Body: { "institution_name": "...", ... }
```

---

## File Upload Format Requirements

### Student Bulk Upload (Excel/CSV)

**Required Columns:**
1. `Full Name` - Student's complete name
2. `Student ID` - Unique identifier
3. `Class/Level` - Level name or code

**Optional Columns:**
4. `Email` - Email address
5. `Phone Number` - Contact number
6. `Date of Birth` - Format: YYYY-MM-DD
7. `Gender` - Male/Female/Other

**Example:**
```csv
Full Name,Student ID,Class/Level,Email,Phone Number
John Doe,STU001,Grade 10,john@example.com,+1234567890
Jane Smith,STU002,Grade 10,jane@example.com,+1234567891
```

### Question Bulk Upload (Excel/CSV)

**Required Columns:**
1. `Question` - Question text
2. `Option A` - First option
3. `Option B` - Second option
4. `Option C` - Third option
5. `Option D` - Fourth option
6. `Correct Answer` - A, B, C, or D

**Optional Columns:**
7. `Difficulty` - easy/medium/hard
8. `Category` - Topic or category
9. `Marks` - Points (default: 1)
10. `Explanation` - Answer explanation

**Example:**
```csv
Question,Option A,Option B,Option C,Option D,Correct Answer,Difficulty,Category,Marks
What is 2+2?,3,4,5,6,B,easy,Mathematics,1
```

---

## Best Practices

### 1. Student Management
- Always validate student_id uniqueness before creation
- Use bulk upload for large student batches
- Keep student records active (use `is_active=False` instead of deletion)

### 2. Exam Creation
- Set appropriate time limits based on question count
- Use question randomization to prevent cheating
- Configure start/end dates for scheduled exams

### 3. Question Management
- Group questions by difficulty and category
- Provide clear, unambiguous options
- Add explanations for learning purposes

### 4. Result Tracking
- Auto-calculate scores using `calculate_score()` method
- Store time_taken for analytics
- Keep all attempts for audit purposes

### 5. System Settings
- Use SystemSettings.load() to access settings
- Update settings through admin interface
- Test security settings before enabling

---

## Migration Commands

```bash
# Create migrations
python manage.py makemigrations core

# Apply migrations
python manage.py migrate core

# Create superuser
python manage.py createsuperuser
```

---

## Testing Examples

```python
# Test student login
student = Student.objects.get(student_id="STU001")
assert student.is_active == True

# Test exam availability
exam = ExamModule.objects.get(code="MATH101")
assert exam.is_available == True

# Test scoring
attempt = ExamAttempt.objects.get(id=1)
attempt.calculate_score()
assert attempt.passed == True

# Test settings
settings = SystemSettings.load()
assert settings.institution_name == "SmartExams University"
```

---

## Summary

The Core App provides a comprehensive foundation for:
✅ Admin authentication and management
✅ Student registration (single & bulk)
✅ Exam and question creation (with bulk upload)
✅ Result tracking and reporting
✅ System configuration

All models are optimized for the frontend requirements with proper indexing, relationships, and helper methods.
